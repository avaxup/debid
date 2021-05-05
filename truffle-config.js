const Web3 = require('web3');
const protocol = "http";
const ip = "localhost";
const port = 9650;
const gas = 
module.exports = {
  networks: {
    development: {
      provider: function () {
        return new Web3.providers.HttpProvider(`${protocol}://${ip}:${port}/ext/bc/C/rpc`)

      },
      network_id: "*",
    },

    fuji: {
      provider: function () {
        return new Web3.providers.HttpProvider(`https://api.avax-test.network/ext/bc/C/rpc`)
      },
      network_id: "*",
      // gas: 3000000,
      // gasPrice: 470000000000,
      // from: "0x345935f424A5C231985C49F06e9FfDCE502955fc"
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
};
