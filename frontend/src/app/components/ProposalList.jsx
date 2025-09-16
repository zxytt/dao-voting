'use client';
import React, { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
// import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import VOTING_ABI from '../../contracts/abi/VotingV2ABI.json';
import contractData from '../../contracts/sepolia.json';
// import { useQuery, gql } from '@apollo/client';

// 计算剩余时间的函数
const calculateRemainingTime = (deadline) => {
    const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
    const remainingSeconds = Number(deadline) - now;
    
    if (remainingSeconds <= 0) {
        return 'End';
    }
    
    // 计算天、小时、分钟
    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    
    if (days > 0) {
        return `${days}day ${hours}hour`;
    } else if (hours > 0) {
        return `${hours}hour ${minutes}minute`;
    } else {
        return `${minutes}minute`;
    }
};

export default function ProposalList() {
    const contractAddress = contractData.contractAddress;
    const { data: proposals } = useReadContract({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'getAllProposals',
    });
    console.log('data', proposals);
    // const { data: proposals, refetch } = useQuery(GET_PROPOSALS);

    // const GET_PROPOSALS = gql`
    //     query GetProposals {
    //         proposals(first: 100, orderBy: id, orderDirection: desc) {
    //             id
    //             description
    //             voteCount
    //             deadline
    //             executed
    //         }
    //     }
    // `;
    const { writeContract, isPending } = useWriteContract();
    const handleVote = async (proposalId) => {
        await writeContract({
            address: contractAddress,
            abi: VOTING_ABI,
            functionName: 'vote',
            args: [proposalId],
        });
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {proposals?.map((proposal, index) => {
const remainingTime = calculateRemainingTime(proposal.deadline);
                    return (
                        <div key={index} className="flex justify-between px-6 py-4">
                            <div>
                                <h3 className="text-lg font-medium">
                                    {proposal.description}
                                </h3>
                                <p>Votes: {proposal.voteCount.toString()}</p>
                                <p>
                                    Status: {proposal.executed ? 'Executed' : 'Active'}
                                </p>
                                <p>
                                    Deadline: {remainingTime}
                                </p>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleVote(index)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                                >
                                    Vote
                                </button>
                            </div>
                    </div>)
                })}
            </ul>
        </div>
    );
}
