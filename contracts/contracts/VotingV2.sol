// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Voting.sol"; // 导入原合约，继承其状态和逻辑

contract VotingV2 is Voting {
    // 获取所有提案信息
    // 返回值：Proposal结构体数组，包含所有提案的完整信息
    function getAllProposals() external view returns (Proposal[] memory) {
        // 创建一个新的Proposal数组，大小为提案总数
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        
        // 遍历所有提案，将它们添加到数组中
        for (uint256 i = 0; i < proposalCount; i++) {
            allProposals[i] = proposals[i];
        }
        
        // 返回包含所有提案的数组
        return allProposals;
    }
}