const { task } = require('hardhat/config');
require('./generate-abi');

task('build', 'excute tasks').setAction(async (taskArgs, hre) => {
    await hre.run('generate-abi');
});
