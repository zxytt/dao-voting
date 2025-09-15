'use client';

import { useState, useEffect } from 'react';
import {
    useAccount,
    useConnect,
    useDisconnect,
    useReadContract,
    usetWriteContrac,
    useWaitForTransaction,
} from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useQuery, gql } from '@apollo/client';

const VOTING_ABI = require('./contracts/Voting.json').abi;
const VOTING_ADDRESS = '0x...'; // 部署后填入

const GET_PROPOSALS = gql`
    query GetProposals {
        proposals(first: 100, orderBy: id, orderDirection: desc) {
            id
            description
            voteCount
            deadline
            executed
        }
    }
`;

function App() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    });
    const { disconnect } = useDisconnect();

    const [description, setDescription] = useState('');
    const [newProposalDesc, setNewProposalDesc] = useState('');

    // 读取提案列表
    const { data: proposals, refetch } = useQuery(GET_PROPOSALS);

    // 创建提案
    const { write: createProposal, data: createData } = usetWriteContrac({
        address: VOTING_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'createProposal',
        args: [newProposalDesc],
        onSuccess: () => {
            setNewProposalDesc('');
            refetch();
        },
    });

    // 投票
    const { write: vote, data: voteData } = usetWriteContrac({
        address: VOTING_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'vote',
        onSuccess: () => refetch(),
    });

    // 等待交易确认
    const { isLoading: isCreating } = useWaitForTransaction({
        hash: createData?.hash,
    });
    const { isLoading: isVoting } = useWaitForTransaction({
        hash: voteData?.hash,
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">DAO Voting System</h1>

                {!isConnected ? (
                    <button
                        onClick={() => connect()}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Connect Wallet
                    </button>
                ) : (
                    <div>
                        <p>
                            Connected: {address.slice(0, 6)}...
                            {address.slice(-4)}
                        </p>
                        <button
                            onClick={() => disconnect()}
                            className="text-red-500 ml-4"
                        >
                            Disconnect
                        </button>
                    </div>
                )}

                {isConnected && (
                    <div className="mt-8">
                        <h2 className="text-xl mb-4">Create Proposal</h2>
                        <input
                            type="text"
                            value={newProposalDesc}
                            onChange={(e) => setNewProposalDesc(e.target.value)}
                            placeholder="Proposal description"
                            className="border p-2 mr-2"
                        />
                        <button
                            onClick={() => createProposal()}
                            disabled={isCreating || !newProposalDesc}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="text-xl mb-4">Active Proposals</h2>
                    {proposals?.proposals.map((p) => (
                        <div
                            key={p.id}
                            className="border p-4 mb-4 rounded bg-white"
                        >
                            <h3 className="font-bold">{p.description}</h3>
                            <p>Votes: {p.voteCount}</p>
                            <p>
                                Deadline:{' '}
                                {new Date(p.deadline * 1000).toLocaleString()}
                            </p>
                            <p>Status: {p.executed ? 'Executed' : 'Active'}</p>
                            {isConnected &&
                                !p.executed &&
                                parseInt(p.deadline) > Date.now() / 1000 && (
                                    <button
                                        onClick={() => vote({ args: [p.id] })}
                                        disabled={isVoting}
                                        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                                    >
                                        {isVoting ? 'Voting...' : 'Vote'}
                                    </button>
                                )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
