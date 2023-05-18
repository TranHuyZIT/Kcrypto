// https://eth-sepolia.g.alchemy.com/v2/sqevvcZGTVBzivmEZ65dKVH3yA8R1_u6
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const HTTPS_SEPOLIA = process.env.HTTPS_SEPOLIA;
module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: HTTPS_SEPOLIA,
      accounts: [PRIVATE_KEY],
    },
  },
};
