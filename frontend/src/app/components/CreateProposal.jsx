'use client';

import { useAccount, useWriteContract, useSimulateContract } from 'wagmi';
import { useState } from 'react';
// import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import VOTING_ABI from '../../contracts/abi/VotingABI.json';
import contractData from '../../contracts/sepolia.json';

export default function CreateProposal() {
    const { address, isConnected } = useAccount();
    const [description, setDescription] = useState('');

    const contractAddress = contractData.contractAddress;

    const { data: simulation, isLoading: isSimulating } = useSimulateContract({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'createProposal',
        args: [description],
        query: {
            enabled: isConnected && description.length > 0, // 仅在条件满足时模拟
        },
    });

    console.log('CreateProposal simulation', simulation);

    const { writeContract, isPending } = useWriteContract();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!simulation?.request) return;

        writeContract(simulation.request);
    };

    if (!isConnected) return null;

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Create a Proposal</h2>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proposal description"
                className="w-full p-2 border rounded mb-4"
                required
            />
            <button
                type="submit"
                disabled={!simulation?.request || isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {isPending ? 'Creating...' : 'Create Proposal'}
            </button>

            {/* 可选：显示模拟错误 */}
            {simulation?.result === undefined && description && (
                <p className="text-red-500 text-sm mt-2">
                    Error: Cannot create proposal.
                </p>
            )}
        </form>
    );
}
