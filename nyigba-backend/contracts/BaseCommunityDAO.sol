// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseCommunityDAO
 * @dev Simplified Base-optimized DAO for African community governance
 * Leverages Base's 2-second block time for rapid decision making
 */
contract BaseCommunityDAO is Ownable, ReentrancyGuard {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        string category;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
        mapping(address => bool) votes; // true = for, false = against
    }

    // Base network optimizations
    uint256 public constant BASE_VOTING_PERIOD = 604800; // 7 days in seconds
    uint256 public constant BASE_QUORUM_PERCENTAGE = 10; // 10% quorum

    mapping(address => bool) public communityMembers;
    mapping(uint256 => Proposal) public proposals;
    mapping(string => uint256[]) public categoryProposals;

    string[] public categories = [
        "Cultural Preservation",
        "Education",
        "Healthcare",
        "Economic Development",
        "Technology",
        "Environmental",
        "Social Justice"
    ];

    uint256 public proposalCount;
    IERC20 public governanceToken;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string category);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event CommunityMemberAdded(address indexed member);
    event ProposalCanceled(uint256 indexed proposalId);

    constructor(address _governanceToken) Ownable(msg.sender) {
        governanceToken = IERC20(_governanceToken);
    }

    /**
     * @dev Add community member
     * @param member Address to add as community member
     */
    function addCommunityMember(address member) external onlyOwner {
        communityMembers[member] = true;
        emit CommunityMemberAdded(member);
    }

    /**
     * @dev Create proposal
     * @param description Proposal description
     * @param category Proposal category
     */
    function createProposal(
        string memory description,
        string memory category
    ) external returns (uint256) {
        require(communityMembers[msg.sender], "Not a community member");

        // Validate category
        bool validCategory = false;
        for (uint256 i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(category))) {
                validCategory = true;
                break;
            }
        }
        require(validCategory, "Invalid category");

        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.category = category;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + BASE_VOTING_PERIOD;

        categoryProposals[category].push(proposalCount);

        emit ProposalCreated(proposalCount, msg.sender, category);
        return proposalCount;
    }

    /**
     * @dev Cast vote on proposal
     * @param proposalId The proposal ID
     * @param support True for yes, false for no
     */
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(governanceToken.balanceOf(msg.sender) > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = support;

        if (support) {
            proposal.forVotes += governanceToken.balanceOf(msg.sender);
        } else {
            proposal.againstVotes += governanceToken.balanceOf(msg.sender);
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    /**
     * @dev Execute proposal if passed
     * @param proposalId The proposal ID
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 totalSupply = governanceToken.totalSupply();
        uint256 quorum = (totalSupply * BASE_QUORUM_PERCENTAGE) / 100;

        require(totalVotes >= quorum, "Quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel proposal (only proposer or owner)
     * @param proposalId The proposal ID
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.proposer == msg.sender || owner() == msg.sender, "Not authorized");
        require(!proposal.executed, "Already executed");

        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }

    /**
     * @dev Get proposal details
     * @param proposalId The proposal ID
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        string memory category,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        bool canceled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.category,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.canceled
        );
    }

    /**
     * @dev Get proposals by category
     * @param category The category to filter by
     */
    function getProposalsByCategory(string memory category) external view returns (uint256[] memory) {
        return categoryProposals[category];
    }

    /**
     * @dev Check if address is community member
     * @param account The address to check
     */
    function isCommunityMember(address account) external view returns (bool) {
        return communityMembers[account];
    }

    /**
     * @dev Get all categories
     */
    function getCategories() external view returns (string[] memory) {
        return categories;
    }

    /**
     * @dev Get voting power
     * @param account The account to check
     */
    function getVotes(address account) external view returns (uint256) {
        return governanceToken.balanceOf(account);
    }
}
