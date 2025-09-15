const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('Voting', function () {
    async function deployVoting() {
        const Voting = await ethers.getContractFactory('Voting');
        const voting = await upgrades.deployProxy(Voting, [], {
            initializer: 'initialize',
            kind: 'uups',
        });
        await voting.waitForDeployment();

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        return { voting, owner, addr1, addr2, addr3 };
    }

    it('Should deploy and initialize correctly', async function () {
        const { voting, owner } = await deployVoting();
        expect(await voting.owner()).to.equal(owner.address);
        expect(await voting.votingDuration()).to.equal(86400);
        expect(await voting.proposalCount()).to.equal(0);
    });

    it('Should allow owner to add voters', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        expect(await voting.voters(addr1.address)).to.be.true;
    });

    it('Should not allow non-owner to add voters', async function () {
        const { voting, addr1, addr2 } = await deployVoting();
        await expect(voting.connect(addr1).addVoter(addr2.address)).to.be.reverted;
    });

    it('Should not allow adding already existing voter', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await expect(voting.addVoter(addr1.address)).to.be.revertedWith('Voter already added');
    });

    it('Should create a proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test Proposal');
        const proposal = await voting.proposals(0);
        expect(proposal.description).to.equal('Test Proposal');
        expect(proposal.voteCount).to.equal(0);
        expect(proposal.executed).to.be.false;
    });

    it('Should not allow non-voter to create a proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await expect(voting.connect(addr1).createProposal('Test Proposal')).to.be.revertedWith('Not a voter');
    });

    it('Should emit ProposalCreated event when creating a proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        const tx = await voting.connect(addr1).createProposal('Test Proposal');
        await expect(tx).to.emit(voting, 'ProposalCreated').withArgs(0, 'Test Proposal', await time.latest() + 86400);
    });

    it('Should increment proposalCount when creating a proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Proposal 1');
        await voting.connect(addr1).createProposal('Proposal 2');
        expect(await voting.proposalCount()).to.equal(2);
    });

    it('Should allow voting', async function () {
        const { voting, addr1, addr2 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.addVoter(addr2.address);
        await voting.connect(addr1).createProposal('Test');
        await voting.connect(addr1).vote(0);
        const proposal = await voting.proposals(0);
        expect(proposal.voteCount).to.equal(1);
        expect(await voting.hasVoted(addr1.address, 0)).to.be.true;
    });

    it('Should not allow non-voter to vote', async function () {
        const { voting, addr1, addr2 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test');
        await expect(voting.connect(addr2).vote(0)).to.be.revertedWith('Not a voter');
    });

    it('Should not allow double voting', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test');
        await voting.connect(addr1).vote(0);
        await expect(voting.connect(addr1).vote(0)).to.be.revertedWith('Already voted');
    });

    it('Should not allow voting after deadline', async function () {
        const { voting, addr1, addr2 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.addVoter(addr2.address);
        await voting.connect(addr1).createProposal('Test');
        await time.increase(86401); // 快进超过截止时间
        await expect(voting.connect(addr2).vote(0)).to.be.revertedWith('Voting closed');
    });

    it('Should not allow voting on non-existent proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await expect(voting.connect(addr1).vote(999)).to.be.revertedWith('Proposal does not exist');
    });

    it('Should emit Voted event when voting', async function () {
        const { voting, addr1, addr2 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.addVoter(addr2.address);
        await voting.connect(addr1).createProposal('Test');
        const tx = await voting.connect(addr1).vote(0);
        await expect(tx).to.emit(voting, 'Voted').withArgs(0, addr1.address, 1);
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

    it('Should not allow executing proposal before deadline', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test');
        await expect(voting.executeProposal(0)).to.be.revertedWith('Voting not ended');
    });

    it('Should not allow executing non-existent proposal', async function () {
        const { voting } = await deployVoting();
        await expect(voting.executeProposal(999)).to.be.revertedWith('Proposal does not exist');
    });

    it('Should not allow executing already executed proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test');
        await time.increase(86401); // 快进超过截止时间
        await voting.executeProposal(0);
        await expect(voting.executeProposal(0)).to.be.revertedWith('Proposal already executed');
    });

    it('Should emit ProposalExecuted event when executing proposal', async function () {
        const { voting, addr1 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).createProposal('Test');
        await time.increase(86401); // 快进超过截止时间
        const tx = await voting.executeProposal(0);
        await expect(tx).to.emit(voting, 'ProposalExecuted').withArgs(0);
    });

    it('Should handle multiple proposals correctly', async function () {
        const { voting, addr1, addr2 } = await deployVoting();
        await voting.addVoter(addr1.address);
        await voting.addVoter(addr2.address);
        
        // 创建两个提案
        await voting.connect(addr1).createProposal('Proposal 1');
        await voting.connect(addr1).createProposal('Proposal 2');
        
        // 为两个提案投票
        await voting.connect(addr1).vote(0);
        await voting.connect(addr2).vote(0);
        await voting.connect(addr1).vote(1);
        
        // 检查投票计数
        const proposal1 = await voting.proposals(0);
        const proposal2 = await voting.proposals(1);
        expect(proposal1.voteCount).to.equal(2);
        expect(proposal2.voteCount).to.equal(1);
        
        // 快进时间并执行第一个提案
        await time.increase(86401);
        await voting.executeProposal(0);
        
        const updatedProposal1 = await voting.proposals(0);
        expect(updatedProposal1.executed).to.be.true;
        expect(proposal2.executed).to.be.false;
    });
});
