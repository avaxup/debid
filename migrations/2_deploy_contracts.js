const DebidNFT = artifacts.require("DebidNFT");
const DebidAuction = artifacts.require("DebidAuction");

module.exports = function (deployer) {
  deployer.deploy(DebidNFT);
  deployer.deploy(DebidAuction);
};