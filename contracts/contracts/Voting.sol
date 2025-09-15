// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; // 替代构造函数，提供initializer修饰符，防止初始化被重入调用
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol"; // UUPS升级代理，允许通过代理合约升级实现合约逻辑
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol"; // Ownable升级版，提供onlyOwner 权限控制

contract Voting is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct Proposal {
        string description; // 提案描述
        uint256 voteCount;  // 投票计数
        uint256 deadline;   // 投票截止时间（时间戳）
        bool executed;      // 是否已执行
    }

    mapping(uint256 => Proposal) public proposals; // 所有提案
    mapping(address => mapping(uint256 => bool)) public hasVoted; // 某个地址是否为某个提案投票
    mapping(address => bool) public voters; // 是否为投票者

    uint256 public proposalCount; // 提案数量
    uint256 public votingDuration; // 投票持续时间（秒）

    event ProposalCreated(uint256 indexed id, string description, uint256 deadline); // 创建提案事件
    event Voted(uint256 indexed proposalId, address indexed voter, uint256 voteCount); // 投票事件
    event ProposalExecuted(uint256 indexed id); // 执行提案事件

    // constructor() {
    //     _disableInitializers(); // 防止此合约被直接部署
    // }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        votingDuration = 86400; // 24 hours
    }

    // 添加投票人（由DAO所有者调用）
    function addVoter(address _voter) external onlyOwner {
        require(!voters[_voter], "Voter already added");
        voters[_voter] = true;
    }

    // 创建新提案
    function createProposal(string memory _description) external {
        require(voters[msg.sender], "Not a voter");
        uint256 proposalId = proposalCount;
        proposals[proposalId] = Proposal({
            description: _description,
            voteCount: 0,
            deadline: block.timestamp + votingDuration,
            executed: false
        });
        proposalCount++;
        emit ProposalCreated(proposalId, _description, block.timestamp + votingDuration);
    }

    // 投票
    function vote(uint256 _proposalId) external {
        require(voters[msg.sender], "Not a voter");
        require(!hasVoted[msg.sender][_proposalId], "Already voted");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting closed");
        require(_proposalId < proposalCount, "Proposal does not exist");

        hasVoted[msg.sender][_proposalId] = true;
        proposals[_proposalId].voteCount++;
        emit Voted(_proposalId, msg.sender, proposals[_proposalId].voteCount);
    }

    // 执行提案（示例：仅记录执行，实际可扩展为调用其他合约）
    function executeProposal(uint256 _proposalId) external {
        require(_proposalId < proposalCount, "Proposal does not exist");
        require(!proposals[_proposalId].executed, "Proposal already executed");
        require(block.timestamp >= proposals[_proposalId].deadline, "Voting not ended");
        // 简单逻辑：得票最多的提案获胜（实际DAO可能需要阈值）
        // 这里简化为可执行任何到期提案
        proposals[_proposalId].executed = true;
        emit ProposalExecuted(_proposalId);
    }

    // 升级权限控制
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}