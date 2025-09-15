require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-verify');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('dotenv').config();
require('./tasks');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: '0.8.28',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: false, // 启用 IR 优化
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
            gas: 12000000,
            blockGasLimit: 12000000,
            allowUnlimitedContractSize: true,
        },
        localhost: {
            url: 'http://127.0.0.1:8545',
            chainId: 31337,
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155111,
            gas: 3000000,
            gasPrice: Number.parseInt(process.env.GAS_PRICE) || 10000000000, // 10 gwei
            timeout: 60000,
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/',
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 1,
            gas: 3000000,
            gasPrice: Number.parseInt(process.env.GAS_PRICE) || 20000000000, // 20 gwei
            timeout: 60000,
        },
        polygon: {
            url: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 137,
            gas: 3000000,
            gasPrice: 30000000000, // 30 gwei
        },
    },
};
