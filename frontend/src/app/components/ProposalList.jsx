import { useReadContract } from 'wagmi';
// import { VOTING_ABI } from '../../contracts/abi/VotingABI';
import VOTING_ABI from '../../contracts/abi/VotingABI.json';
import contractData from '../../contracts/sepolia.json';

export default function ProposalList() {
    const contractAddress = contractData.contractAddress;
    const { data: proposals, isLoading } = useReadContract({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'getAllProposals',
        watch: true,
    });

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
