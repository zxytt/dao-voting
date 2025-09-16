'use client';
import React, { useState } from 'react';
import { useReadContract } from 'wagmi';
// import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import VOTING_ABI from '../../contracts/abi/VotingV2ABI.json';
import contractData from '../../contracts/sepolia.json';
// import { useQuery, gql } from '@apollo/client';

export default function ProposalList() {
    const contractAddress = contractData.contractAddress;
    // 读取提案列表
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { data } = useReadContract({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'getAllProposals',
    });
    console.log('data', data);
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

    if (isLoading) return <div>Loading proposals...</div>;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {proposals?.map((proposal, index) => (
                    <li key={index} className="px-6 py-4">
                        <h3 className="text-lg font-medium">
                            {proposal.description}
                        </h3>
                        <p>Votes: {proposal.voteCount.toString()}</p>
                        <p>
                            Status: {proposal.executed ? 'Executed' : 'Active'}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
