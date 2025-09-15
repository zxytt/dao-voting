import { useReadContract } from 'wagmi';
import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import contractData from '../../contracts/sepolia.json'

export default function ProposalList() {
    const contractAddress = contractData.address;
    const { data: proposals, isLoading } = useReadContract({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'getAllProposals', // 假设您在合约中实现了此只读函数
        watch: true, // 实时监听变化
    });

    if (isLoading) return <div>Loading proposals...</div>;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {proposals?.map((proposal, index) => (
                <li key={index} className="px-6 py-4">
                    <h3 className="text-lg font-medium">{proposal.description}</h3>
                    <p>Votes: {proposal.voteCount.toString()}</p>
                    <p>Status: {proposal.executed ? 'Executed' : 'Active'}</p>
                </li>
                ))}
            </ul>
        </div>
    );
}