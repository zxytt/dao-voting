'use client';

import { useAccount, useWriteContract, useSimulateContract } from 'wagmi';
import { useState } from 'react';
// import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import VOTING_ABI from '../../contracts/abi/VotingV2ABI.json';
import contractData from '../../contracts/sepolia.json';

export default function VoterManagement() {
    const { address, isConnected } = useAccount();
    const [newVoter, setNewVoter] = useState('');

    const contractAddress = contractData.contractAddress;

    const {
        data: simulation,
        isLoading: isSimulating,
        error: simulationError,
    } = useSimulateContract({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'addVoter',
        args: [newVoter],
        query: {
            enabled: Boolean(newVoter && isConnected), // 只有连接钱包且输入地址时才模拟
        },
    });

    console.log('VoterManagement simulation', simulation);

    const { writeContract, isPending } = useWriteContract();

    const handleAddVoter = () => {
        // if (!simulation?.request) return;

        // // 直接调用 writeContract 并传入 request
        // writeContract(simulation.request);

        writeContract({
            address: contractAddress,
            abi: VOTING_ABI,
            functionName: 'addVoter',
            args: [newVoter],
        });
    };

    if (!isConnected) return null;

    return (
        <div className="bg-white p-6 rounded shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">
                Add Voter (Owner Only)
            </h2>
            <input
                type="text"
                value={newVoter}
                onChange={(e) => setNewVoter(e.target.value)}
                placeholder="New voter address"
                className="w-full p-2 border rounded mb-4 font-mono text-sm"
                disabled={isPending}
            />
            <button
                onClick={handleAddVoter}
                // disabled={!simulation?.request || isPending}
                disabled={!newVoter || isPending}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {isPending ? 'Adding...' : 'Add Voter'}
            </button>

            {/* 可选：显示模拟错误（比如非 owner 调用） */}
            {simulation?.result === undefined && newVoter && (
                <p className="text-red-500 text-sm mt-2">
                    Error: Cannot add voter. Are you the owner?
                </p>
            )}
        </div>
    );
}
