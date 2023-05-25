import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-network-helpers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      // 솔리디티 버전 관련하여 컴파일 에러시 해당 버전을 추가하세요
    ],
  },
  networks: {
    baobab: {   
      url: `https://public-node-api.klaytnapi.com/v1/baobab`,
      accounts: [process.env.PRIVATE_KEY || ''],
      chainId: 1001,
    },
    cypress: {   
      url: `https://public-node-api.klaytnapi.com/v1/cypress`,
      accounts: [process.env.PRIVATE_KEY || ''],
      chainId: 8217,
      // gasPrice: 250_000_000_000,
    },
    goerli: {   
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY || ''],
      chainId: 5,
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY || ''],
      chainId: 1,
    }
  },
};

export default config;
