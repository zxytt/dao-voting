const { ethers, upgrades } = require('hardhat');
const fs = require('fs');
const path = require('path');

const SEPOLIA_CONFIG = {
    confirmations: 1,
};

async function main() {
    console.log('🚀 开始部署到 Sepolia 测试网...');
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log('部署者地址:', deployer.address);

    // 检查余额
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('部署者余额:', ethers.formatEther(balance), 'ETH');

    const Voting = await ethers.getContractFactory('Voting');
    const voting = await upgrades.deployProxy(Voting, [], {
        initializer: 'initialize',
    });
    await voting.waitForDeployment();
    const address = await voting.getAddress();
    console.log('✅ 合约部署成功！');
    console.log('📍 合约地址:', address);

    // 等待区块确认
    console.log(`⏳ 等待 ${SEPOLIA_CONFIG.confirmations} 个区块确认...`);
    const receipt = await voting
        .deploymentTransaction()
        .wait(SEPOLIA_CONFIG.confirmations);
    console.log('✅ 区块确认完成');
    console.log('📊 实际 Gas 使用量:', receipt.gasUsed.toString());
    console.log(
        '💰 实际部署成本:',
        ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        'ETH'
    );

    // 保存部署信息
    const deploymentInfo = {
        network: 'sepolia',
        contractAddress: address,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice.toString(),
        deploymentCost: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        confirmations: SEPOLIA_CONFIG.confirmations,
    };
    console.log('📄 部署信息:');
    console.log(JSON.stringify(deploymentInfo, null, 2));

    fs.writeFileSync(
        path.join(__dirname, '../../frontend/src/contracts/sepolia.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log('📄 部署信息已保存到前端');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
