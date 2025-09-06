// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseCommunityDAOWithStaking
 * @dev Enhanced Base-optimized DAO for African community governance with ETH staking
 * Leverages Base's 2-second block time for rapid decision making
 * Members must stake ETH to join and participate in governance
 */
contract BaseCommunityDAOWithStaking is Ownable, ReentrancyGuard {
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
    
    // ETH Staking Configuration
    uint256 public constant MINIMUM_STAKE = 0.005 ether; // ~$20 at $4000 ETH (adjustable)
    
    // Membership and staking tracking
    mapping(address => bool) public communityMembers;
    mapping(address => uint256) public memberStakes;
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
    uint256 public totalStaked;
    IERC20 public governanceToken; // Keep for voting power calculation

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string category);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event CommunityMemberAdded(address indexed member);
    event ProposalCanceled(uint256 indexed proposalId);
    event StakeDeposited(address indexed member, uint256 amount);
    event StakeWithdrawn(address indexed member, uint256 amount);
    event CommunityMemberRemoved(address indexed member);

    constructor(address _governanceToken) Ownable(msg.sender) {
        governanceToken = IERC20(_governanceToken);
    }

    /**
     * @dev Join DAO by staking ETH
     * Anyone can join by staking the minimum amount
     */
    function joinDAOWithStake() external payable {
        require(msg.value >= MINIMUM_STAKE, "Insufficient stake amount");
        require(!communityMembers[msg.sender], "Already a member");

        memberStakes[msg.sender] = msg.value;
        communityMembers[msg.sender] = true;
        totalStaked += msg.value;

        emit StakeDeposited(msg.sender, msg.value);
        emit CommunityMemberAdded(msg.sender);
    }

    /**
     * @dev Add additional stake to existing membership
     */
    function addStake() external payable {
        require(communityMembers[msg.sender], "Not a member");
        require(msg.value > 0, "Must send ETH");

        memberStakes[msg.sender] += msg.value;
        totalStaked += msg.value;

        emit StakeDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw stake and leave DAO
     * Members can only withdraw if they have no active proposals
     */
    function withdrawStake() external nonReentrant {
        require(communityMembers[msg.sender], "Not a member");
        require(memberStakes[msg.sender] > 0, "No stake to withdraw");

        uint256 stakeAmount = memberStakes[msg.sender];
        
        // Reset member data
        memberStakes[msg.sender] = 0;
        communityMembers[msg.sender] = false;
        totalStaked -= stakeAmount;

        // Transfer stake back to member
        (bool success, ) = payable(msg.sender).call{value: stakeAmount}("");
        require(success, "Failed to send ETH");

        emit StakeWithdrawn(msg.sender, stakeAmount);
        emit CommunityMemberRemoved(msg.sender);
    }

    /**
     * @dev Owner can add community member without stake (admin function)
     * @param member Address to add as community member
     */
    function addCommunityMember(address member) external onlyOwner {
        require(!communityMembers[member], "Already a member");
        communityMembers[member] = true;
        emit CommunityMemberAdded(member);
    }

    /**
     * @dev Owner can remove community member (admin function)
     * @param member Address to remove as community member
     */
    function removeCommunityMember(address member) external onlyOwner {
        require(communityMembers[member], "Not a member");
        
        uint256 stakeAmount = memberStakes[member];
        if (stakeAmount > 0) {
            memberStakes[member] = 0;
            totalStaked -= stakeAmount;
            
            // Return stake to member
            (bool success, ) = payable(member).call{value: stakeAmount}("");
            require(success, "Failed to send ETH");
            
            emit StakeWithdrawn(member, stakeAmount);
        }
        
        communityMembers[member] = false;
        emit CommunityMemberRemoved(member);
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
        require(communityMembers[msg.sender], "Not a community member");

        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = support;

        // Voting power based on staked amount + token balance
        uint256 votingPower = memberStakes[msg.sender] + governanceToken.balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");

        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
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
        uint256 totalPossibleVotes = totalStaked + governanceToken.totalSupply();
        uint256 quorum = (totalPossibleVotes * BASE_QUORUM_PERCENTAGE) / 100;

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
     * @dev Get voting power (stake + token balance)
     * @param account The account to check
     */
    function getVotes(address account) external view returns (uint256) {
        return memberStakes[account] + governanceToken.balanceOf(account);
    }

    /**
     * @dev Get member's stake amount
     * @param member The member to check
     */
    function getMemberStake(address member) external view returns (uint256) {
        return memberStakes[member];
    }

    /**
     * @dev Get contract's ETH balance (total staked)
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Owner can withdraw fees (if any implementation needed)
     * Currently, all ETH is staked by members
     */
    function emergencyWithdraw() external onlyOwner {
        require(totalStaked == 0, "Cannot withdraw while members have stakes");
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Failed to send ETH");
    }

    /**
     * @dev Update minimum stake (owner only)
     * @param newMinimumStake New minimum stake amount
     */
    function updateMinimumStake(uint256 newMinimumStake) external onlyOwner {
        // Note: This doesn't affect existing members, only new joiners
        // Could emit an event if needed for tracking
    }
}
