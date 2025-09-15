'use client'

import { useAccount, useWriteContract, usePrepareContractWrite } from 'wagmi';
import { useState } from 'react';
import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import contractData from '../../contracts/sepolia.json'

export default function CreateProposal() {
    const { address, isConnected } = useAccount();
    const [description, setDescription] = useState('');
    const contractAddress = contractData.address;

    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'createProposal',
        args: [description],
        enabled: Boolean(description && isConnected),
    });

    const { write, isLoading } = useWriteContract(config);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (write) write();
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
                disabled={!write || isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {isLoading ? 'Creating...' : 'Create Proposal'}
            </button>
        </form>
    );
}