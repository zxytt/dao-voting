const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('Voting Upgrade', function () {
    it('Should upgrade from Voting to VotingV2 and retain state', async function () {
        // 部署原始Voting合约代理
        const Voting = await ethers.getContractFactory('Voting');
        const voting = await upgrades.deployProxy(Voting, [], {
            initializer: 'initialize',
            kind: 'uups',
        });
        await voting.waitForDeployment();

        // 获取签名者
        const [owner, addr1, addr2] = await ethers.getSigners();

        // 在升级前添加投票人和创建多个提案
        await voting.addVoter(addr1.address);
        await voting.addVoter(addr2.address);

        await voting.connect(addr1).createProposal('First Proposal');
        await voting.connect(addr2).createProposal('Second Proposal');

        // 记录升级前的状态
        const proposalCountBefore = await voting.proposalCount();
        const voter1StatusBefore = await voting.voters(addr1.address);
        const voter2StatusBefore = await voting.voters(addr2.address);
        const firstProposalBefore = await voting.proposals(0);
        const secondProposalBefore = await voting.proposals(1);

        // 获取代理地址
        const proxyAddress = await voting.getAddress();

        // 升级到 VotingV2
        const VotingV2 = await ethers.getContractFactory('VotingV2');
        const upgraded = await upgrades.upgradeProxy(proxyAddress, VotingV2);
        await upgraded.waitForDeployment();

        // 检查状态是否保留
        const proposalCountAfter = await upgraded.proposalCount();
        const voter1StatusAfter = await upgraded.voters(addr1.address);
        const voter2StatusAfter = await upgraded.voters(addr2.address);
        const firstProposalAfter = await upgraded.proposals(0);
        const secondProposalAfter = await upgraded.proposals(1);

        expect(proposalCountAfter).to.equal(proposalCountBefore);
        expect(voter1StatusAfter).to.equal(voter1StatusBefore);
        expect(voter2StatusAfter).to.equal(voter2StatusBefore);
        expect(firstProposalAfter.description).to.equal(
            firstProposalBefore.description
        );
        expect(secondProposalAfter.description).to.equal(
            secondProposalBefore.description
        );
    });

    it('Should test the new getAllProposals function after upgrade', async function () {
        // 部署原始Voting合约代理
        const Voting = await ethers.getContractFactory('Voting');
        const voting = await upgrades.deployProxy(Voting, [], {
            initializer: 'initialize',
            kind: 'uups',
        });
        await voting.waitForDeployment();

        // 获取签名者
        const [owner, addr1] = await ethers.getSigners();

        // 添加投票人和创建多个提案
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Proposal 1');
        await voting.connect(addr1).createProposal('Proposal 2');
        await voting.connect(addr1).createProposal('Proposal 3');

        // 获取代理地址并升级到VotingV2
        const proxyAddress = await voting.getAddress();
        const VotingV2 = await ethers.getContractFactory('VotingV2');
        const upgraded = await upgrades.upgradeProxy(proxyAddress, VotingV2);
        await upgraded.waitForDeployment();

        // 测试新添加的getAllProposals方法
        const allProposals = await upgraded.getAllProposals();

        // 验证返回的提案数组
        expect(allProposals).to.have.lengthOf(3);
        expect(allProposals[0].description).to.equal('Proposal 1');
        expect(allProposals[1].description).to.equal('Proposal 2');
        expect(allProposals[2].description).to.equal('Proposal 3');

        // 验证提案的其他属性
        expect(allProposals[0].voteCount).to.equal(0);
        expect(allProposals[0].executed).to.be.false;
        expect(allProposals[1].voteCount).to.equal(0);
        expect(allProposals[1].executed).to.be.false;
        expect(allProposals[2].voteCount).to.equal(0);
        expect(allProposals[2].executed).to.be.false;
    });
});
