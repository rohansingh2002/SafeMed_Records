require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { INFURA_API_KEY, MNEMONIC } = process.env;

module.exports = {
    networks: {
        // development: {
        //     host: "127.0.0.1",     // Localhost (default: none)
        //     port: 7545,            // Standard Ethereum port (default: none)
        //     network_id: "*"        // Any network (default: none)
        // },
        polygon: {
            provider: () => new HDWalletProvider(MNEMONIC, INFURA_API_KEY),
            network_id: "80001",
            gas: 20000000,
        },
    },
    compilers: {
        solc: {
            version: "0.8.7", // Use the appropriate Solidity version
        },
    }
};