const { ethers, upgrades } = require('hardhat');

async function main() {
    const PROXY_ADDRESS = '0xdbd1F939004D9813360b08070dF3532303C65B0b';

    console.log('Upgrading Voting contract...');
    const VotingV2 = await ethers.getContractFactory('VotingV2');
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, VotingV2);
    await upgraded.waitForDeployment();

    const newImplementationAddress =
        await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log(`✅ Voting upgraded!`);
    console.log(`Proxy Address: ${PROXY_ADDRESS}`);
    console.log(`New Implementation Address: ${newImplementationAddress}`);
}

main().catch((error) => {
    console.error('Upgrade failed:', error);
    process.exitCode = 1;
});
