'use client'

import { useAccount, useWriteContract, usePrepareContractWrite } from 'wagmi';
import { useState } from 'react';
import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import contractData from '../../contracts/sepolia.json'

export default function VoterManagement() {
    const { address } = useAccount();
    const [newVoter, setNewVoter] = useState('');

    const contractAddress = contractData.address;
    const { config } = usePrepareContractWrite({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'addVoter',
        args: [newVoter],
        enabled: Boolean(newVoter && address),
    });

    const { write, isLoading } = useWriteContract(config);

    const handleAddVoter = () => {
        if (write) write();
    };

    return (
        <div className="bg-white p-6 rounded shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">Add Voter (Owner Only)</h2>
            <input
                type="text"
                value={newVoter}
                onChange={(e) => setNewVoter(e.target.value)}
                placeholder="New voter address"
                className="w-full p-2 border rounded mb-4"
            />
            <button
                onClick={handleAddVoter}
                disabled={!write || isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {isLoading ? 'Adding...' : 'Add Voter'}
            </button>
        </div>
    );
}