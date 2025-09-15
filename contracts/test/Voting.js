const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('Voting', function () {
    async function deployVoting() {
        const Voting = await ethers.getContractFactory('Voting');
        const votingDuration = 86400; // 24小时
        const voting = await upgrades.deployProxy(Voting, [votingDuration], {
            initializer: 'initialize',
        });
        await voting.waitForDeployment();

        const [owner, addr1, addr2] = await ethers.getSigners();
        return { voting, owner, addr1, addr2 };
    }

    it('Should deploy and initialize correctly', async function () {
        const { voting, owner } = await deployVoting();
        expect(await voting.owner()).to.equal(owner.address);
        expect(await voting.votingDuration()).to.equal(86400);
    });

    it('Should allow owner to add voters', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        expect(await voting.voters(addr1.address)).to.be.true;
    });

    it('Should create a proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test Proposal');
        const proposal = await voting.proposals(0);
        expect(proposal.description).to.equal('Test Proposal');
    });

    it('Should allow voting', async function () {
        const { voting, addr1, addr2 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.addVoter(addr2.address);
        await voting.connect(addr1).createProposal('Test');
        await voting.connect(addr1).vote(0);
        const proposal = await voting.proposals(0);
        expect(proposal.voteCount).to.equal(1);
    });

    it('Should not allow double voting', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test');
        await voting.connect(addr1).vote(0);
        await expect(voting.connect(addr1).vote(0)).to.be.revertedWith(
            'Already voted'
        );
    });

    it('Should execute proposal after deadline', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test');
        await time.increase(86401); // 快进超过截止时间
        await voting.executeProposal(0);
        const proposal = await voting.proposals(0);
        expect(proposal.executed).to.be.true;
    });
});
