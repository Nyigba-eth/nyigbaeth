// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AutonomousAgentRegistry
 * @dev Registry for named autonomous agents with human-verifiable interactions
 * Enables AI agents to communicate and coordinate through ENS names
 */
contract AutonomousAgentRegistry is Ownable, ReentrancyGuard {
    struct Agent {
        address agentAddress;
        address owner;
        bytes32 nameNode; // ENS name node
        string agentType; // "autonomous", "coordinator", "payment", "social"
        string capabilities;
        string metadata;
        bool isActive;
        uint256 registeredAt;
        uint256 lastActivity;
        uint256 reputation; // 0-100 score
    }

    struct AgentInteraction {
        bytes32 fromAgent;
        bytes32 toAgent;
        string interactionType; // "message", "transaction", "coordination"
        string content;
        uint256 timestamp;
        bool verified;
    }

    struct CoordinationTask {
        bytes32 taskId;
        bytes32 coordinatorAgent;
        bytes32[] participatingAgents;
        string taskType;
        string description;
        uint256 reward; // in wei
        bool completed;
        uint256 createdAt;
        uint256 deadline;
    }

    mapping(bytes32 => Agent) public agents;
    mapping(address => bytes32[]) public ownerAgents;
    mapping(bytes32 => AgentInteraction[]) public agentInteractions;
    mapping(bytes32 => CoordinationTask) public coordinationTasks;

    address public nyigbaNamesContract;
    uint256 public agentCount;

    event AgentRegistered(bytes32 indexed agentId, address indexed owner, bytes32 nameNode);
    event AgentInteraction(bytes32 indexed fromAgent, bytes32 indexed toAgent, string interactionType);
    event CoordinationTaskCreated(bytes32 indexed taskId, bytes32 indexed coordinator);
    event TaskCompleted(bytes32 indexed taskId, bytes32 indexed completingAgent);
    event ReputationUpdated(bytes32 indexed agentId, uint256 newReputation);

    constructor(address _nyigbaNamesContract) Ownable(msg.sender) {
        nyigbaNamesContract = _nyigbaNamesContract;
    }

    /**
     * @dev Register a new autonomous agent
     * @param agentId Unique agent identifier
     * @param agentAddress The agent's contract address
     * @param nameNode ENS name node for the agent
     * @param agentType Type of agent
     * @param capabilities Agent capabilities description
     * @param metadata Additional metadata
     */
    function registerAgent(
        bytes32 agentId,
        address agentAddress,
        bytes32 nameNode,
        string calldata agentType,
        string calldata capabilities,
        string calldata metadata
    ) external {
        require(agents[agentId].agentAddress == address(0), "Agent already exists");
        require(agentAddress != address(0), "Invalid agent address");

        agents[agentId] = Agent({
            agentAddress: agentAddress,
            owner: msg.sender,
            nameNode: nameNode,
            agentType: agentType,
            capabilities: capabilities,
            metadata: metadata,
            isActive: true,
            registeredAt: block.timestamp,
            lastActivity: block.timestamp,
            reputation: 50 // Start with neutral reputation
        });

        ownerAgents[msg.sender].push(agentId);
        agentCount++;

        emit AgentRegistered(agentId, msg.sender, nameNode);
    }

    /**
     * @dev Record agent-to-agent interaction
     * @param fromAgent Sender agent ID
     * @param toAgent Recipient agent ID
     * @param interactionType Type of interaction
     * @param content Interaction content
     * @param verified Whether the interaction is verified
     */
    function recordInteraction(
        bytes32 fromAgent,
        bytes32 toAgent,
        string calldata interactionType,
        string calldata content,
        bool verified
    ) external {
        require(agents[fromAgent].agentAddress == msg.sender, "Not authorized agent");
        require(agents[fromAgent].isActive, "Agent not active");
        require(agents[toAgent].isActive, "Recipient agent not active");

        AgentInteraction memory interaction = AgentInteraction({
            fromAgent: fromAgent,
            toAgent: toAgent,
            interactionType: interactionType,
            content: content,
            timestamp: block.timestamp,
            verified: verified
        });

        agentInteractions[fromAgent].push(interaction);

        // Update agent activity
        agents[fromAgent].lastActivity = block.timestamp;
        agents[toAgent].lastActivity = block.timestamp;

        // Update reputation based on verified interactions
        if (verified) {
            _updateReputation(fromAgent, 1); // Small positive boost
        }

        emit AgentInteraction(fromAgent, toAgent, interactionType);
    }

    /**
     * @dev Create a coordination task for multiple agents
     * @param taskId Unique task identifier
     * @param participatingAgents Array of participating agent IDs
     * @param taskType Type of coordination task
     * @param description Task description
     * @param reward Reward amount in wei
     * @param deadline Task deadline
     */
    function createCoordinationTask(
        bytes32 taskId,
        bytes32[] calldata participatingAgents,
        string calldata taskType,
        string calldata description,
        uint256 reward,
        uint256 deadline
    ) external payable {
        require(coordinationTasks[taskId].coordinatorAgent == bytes32(0), "Task already exists");
        require(participatingAgents.length > 0, "No participating agents");
        require(msg.value >= reward, "Insufficient reward");

        // Verify all participating agents exist and are active
        for (uint256 i = 0; i < participatingAgents.length; i++) {
            require(agents[participatingAgents[i]].isActive, "Agent not active");
        }

        coordinationTasks[taskId] = CoordinationTask({
            taskId: taskId,
            coordinatorAgent: 0, // Will be set by first participant
            participatingAgents: participatingAgents,
            taskType: taskType,
            description: description,
            reward: reward,
            completed: false,
            createdAt: block.timestamp,
            deadline: deadline
        });

        emit CoordinationTaskCreated(taskId, participatingAgents[0]);
    }

    /**
     * @dev Complete a coordination task
     * @param taskId The task ID
     * @param completingAgent The agent completing the task
     */
    function completeTask(bytes32 taskId, bytes32 completingAgent) external {
        CoordinationTask storage task = coordinationTasks[taskId];
        require(!task.completed, "Task already completed");
        require(block.timestamp <= task.deadline, "Task deadline passed");

        // Verify completing agent is participating
        bool isParticipant = false;
        for (uint256 i = 0; i < task.participatingAgents.length; i++) {
            if (task.participatingAgents[i] == completingAgent) {
                isParticipant = true;
                break;
            }
        }
        require(isParticipant, "Not a participating agent");

        task.completed = true;
        task.coordinatorAgent = completingAgent;

        // Distribute reward
        (bool success,) = payable(agents[completingAgent].agentAddress).call{value: task.reward}("");
        require(success, "Reward distribution failed");

        // Update reputation
        _updateReputation(completingAgent, 5); // Positive reputation boost

        emit TaskCompleted(taskId, completingAgent);
    }

    /**
     * @dev Update agent reputation
     * @param agentId The agent ID
     * @param change The reputation change (+/-)
     */
    function _updateReputation(bytes32 agentId, int256 change) internal {
        Agent storage agent = agents[agentId];
        if (change > 0) {
            if (agent.reputation + uint256(change) > 100) {
                agent.reputation = 100;
            } else {
                agent.reputation += uint256(change);
            }
        } else {
            if (agent.reputation < uint256(-change)) {
                agent.reputation = 0;
            } else {
                agent.reputation -= uint256(-change);
            }
        }

        emit ReputationUpdated(agentId, agent.reputation);
    }

    /**
     * @dev Get agent details
     * @param agentId The agent ID
     */
    function getAgent(bytes32 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }

    /**
     * @dev Get owner's agents
     * @param owner The owner address
     */
    function getOwnerAgents(address owner) external view returns (bytes32[] memory) {
        return ownerAgents[owner];
    }

    /**
     * @dev Get agent interactions
     * @param agentId The agent ID
     */
    function getAgentInteractions(bytes32 agentId) external view returns (AgentInteraction[] memory) {
        return agentInteractions[agentId];
    }

    /**
     * @dev Get coordination task
     * @param taskId The task ID
     */
    function getCoordinationTask(bytes32 taskId) external view returns (CoordinationTask memory) {
        return coordinationTasks[taskId];
    }

    /**
     * @dev Deactivate agent
     * @param agentId The agent ID
     */
    function deactivateAgent(bytes32 agentId) external {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        agents[agentId].isActive = false;
    }

    /**
     * @dev Reactivate agent
     * @param agentId The agent ID
     */
    function reactivateAgent(bytes32 agentId) external {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        agents[agentId].isActive = true;
        agents[agentId].lastActivity = block.timestamp;
    }
}
