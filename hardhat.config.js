require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const hasValidKey = PRIVATE_KEY && PRIVATE_KEY.length === 64 && PRIVATE_KEY !== "your_private_key_here";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        arc_testnet: {
            url: "https://rpc.testnet.arc.network",
            chainId: 5042002,
            accounts: hasValidKey ? [PRIVATE_KEY] : [],
        },
    },
};
