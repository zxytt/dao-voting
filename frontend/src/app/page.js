'use client';

import Header from './components/Header';
import ProposalList from './components/ProposalList';
import CreateProposal from './components/CreateProposal';
import VoterManagement from './components/VoterManagement';
import { useReadContract } from 'wagmi';
// import { VOTING_ABI } from '../contracts/abi/VotingABI';
import VOTING_ABI from '../contracts/abi/VotingV2ABI.json';
import contractData from '../contracts/sepolia.json';

export default function Home() {
    // 读取暂停状态
    const contractAddress = contractData.address;
    const { data: isPaused } = useReadContract({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'paused',
        watch: true,
    });

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* ✅ 暂停状态全局提示 */}
                {isPaused && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <h3 className="font-bold">System Paused</h3>
                        <p>
                            Voting and proposal creation are currently disabled
                            for maintenance.
                        </p>
                    </div>
                )}

                <div className="px-4 py-6 sm:px-0">
                    <CreateProposal />
                </div>
                <div className="px-4 py-6 sm:px-0">
                    <ProposalList />
                </div>
                <div className="px-4 py-6 sm:px-0">
                    <VoterManagement />
                </div>
            </main>
        </div>
    );
}
