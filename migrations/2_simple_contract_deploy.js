const SimpleContract = artifacts.require("Simple");
module.exports = function (deployer) {
    deployer.deploy(SimpleContract);
}