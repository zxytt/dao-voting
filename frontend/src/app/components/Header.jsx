import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">DAO Voting</h1>
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}