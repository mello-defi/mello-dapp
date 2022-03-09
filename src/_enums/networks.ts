import { ethLogo, polygonLogo } from '_assets/images';

export enum EVMChainIdNumerical {
  ETHEREUM_MAINNET = 1,
  ETHEREUM_TESTNET_RINKEBY = 4,
  ETHEREUM_TESTNET_GOERLI = 5,
  ETHEREUM_TESTNET_KOVAN = 42,
  POLYGON_MAINNET = 137,
  POLYGON_TESTNET_MUMBAI = 80001,
  AVALANCHE_MAINNET = 43114,
  AVALANCHE_TESTNET_FUJI = 43113
}

export enum EVMChainIdHex {
  ETHEREUM_MAINNET = '0x1',
  ETHEREUM_TESTNET_RINKEBY = '0x4',
  ETHEREUM_TESTNET_GOERLI = '0x5',
  ETHEREUM_TESTNET_KOVAN = '0x2A',
  POLYGON_MAINNET = '0x89',
  POLYGON_TESTNET_MUMBAI = '0x13881',
  AVALANCHE_MAINNET = '0xA86A',
  AVALANCHE_TESTNET_FUJI = '0xA869'
}

export enum EVMChainName {
  POLYGON_MAINNET = 'Polygon Mainnet',
  POLYGON_TESTNET_MUMBAI = 'Polygon Testnet (Mumbai)',
  ETHEREUM_MAINNET = 'Ethereum Mainnet',
  ETHEREUM_TESTNET_RINKEBY = 'Ethereum Testnet (Rinkeby)',
  ETHEREUM_TESTNET_KOVAN = 'Ethereum Testnet (Kovan)',
  ETHEREUM_TESTNET_GOERLI = 'Ethereum Testnet (Goerli)',
  AVALANCHE_MAINNET = 'Avalanche Mainnet',
  AVALANCHE_TESTNET_FUJI = 'Avalanche Testnet (Fuji)'
}

export interface EvmNetworkDefinition {
  chainId: EVMChainIdNumerical;
  chainIdHex: EVMChainIdHex;
  name: EVMChainName;
  rpcUrl?: string;
  imageUrl?: string;
  explorerUrl: string;
  gasStationUrl?: string;
}

export function findEvmNetworkById(id: EVMChainIdNumerical | number | string) {
  if (typeof id === 'string') {
    id = parseInt(id);
  }
  switch (id) {
    case EVMChainIdNumerical.POLYGON_MAINNET:
      return evmNetworks.polygonMainnet;
    case EVMChainIdNumerical.ETHEREUM_MAINNET:
      return evmNetworks.ethereumMainnet;
    default:
      throw new Error(`Unknown EVM network id: ${id}`);
  }
}

export interface EvmNetworks {
  polygonMainnet: EvmNetworkDefinition;
  ethereumMainnet: EvmNetworkDefinition;
  ethereumTestnetRinkeby: EvmNetworkDefinition;
  ethereumTestnetGoerli: EvmNetworkDefinition;
  polygonTestnetMumbai: EvmNetworkDefinition;
  ethereumTestnetKovan: EvmNetworkDefinition;
  avalancheMainnet: EvmNetworkDefinition;
  avalancheTestnetFuji: EvmNetworkDefinition;
}

export const evmNetworks: EvmNetworks = {
  ethereumTestnetGoerli: {
    chainId: EVMChainIdNumerical.ETHEREUM_TESTNET_GOERLI,
    chainIdHex: EVMChainIdHex.ETHEREUM_TESTNET_GOERLI,
    name: EVMChainName.ETHEREUM_TESTNET_GOERLI,
    explorerUrl: 'https://goerli.etherscan.io'
  },
  ethereumTestnetRinkeby: {
    chainId: EVMChainIdNumerical.ETHEREUM_TESTNET_RINKEBY,
    chainIdHex: EVMChainIdHex.ETHEREUM_TESTNET_RINKEBY,
    name: EVMChainName.ETHEREUM_TESTNET_RINKEBY,
    explorerUrl: 'https://rinkeby.etherscan.io'
  },
  ethereumTestnetKovan: {
    chainId: EVMChainIdNumerical.ETHEREUM_TESTNET_KOVAN,
    chainIdHex: EVMChainIdHex.ETHEREUM_TESTNET_KOVAN,
    name: EVMChainName.ETHEREUM_TESTNET_KOVAN,
    explorerUrl: 'https://kovan.etherscan.io'
  },
  polygonTestnetMumbai: {
    chainId: EVMChainIdNumerical.POLYGON_TESTNET_MUMBAI,
    chainIdHex: EVMChainIdHex.POLYGON_TESTNET_MUMBAI,
    name: EVMChainName.POLYGON_TESTNET_MUMBAI,
    explorerUrl: 'https://mumbai.polygonscan.com'
  },
  polygonMainnet: {
    chainId: EVMChainIdNumerical.POLYGON_MAINNET,
    chainIdHex: EVMChainIdHex.POLYGON_MAINNET,
    name: EVMChainName.POLYGON_MAINNET,
    explorerUrl: 'https://polygonscan.com',
    imageUrl: polygonLogo,
    gasStationUrl: 'https://gasstation-mainnet.matic.network/'
  },
  ethereumMainnet: {
    chainId: EVMChainIdNumerical.ETHEREUM_MAINNET,
    chainIdHex: EVMChainIdHex.ETHEREUM_MAINNET,
    name: EVMChainName.ETHEREUM_MAINNET,
    explorerUrl: 'https://etherscan.io',
    imageUrl: ethLogo,
    gasStationUrl: 'https://ethgasstation.info/json/ethgasAPI.json'
  },
  avalancheMainnet: {
    chainId: EVMChainIdNumerical.AVALANCHE_MAINNET,
    chainIdHex: EVMChainIdHex.AVALANCHE_MAINNET,
    name: EVMChainName.AVALANCHE_MAINNET,
    explorerUrl: 'https://snowtrace.io'
  },
  avalancheTestnetFuji: {
    chainId: EVMChainIdNumerical.AVALANCHE_TESTNET_FUJI,
    chainIdHex: EVMChainIdHex.AVALANCHE_TESTNET_FUJI,
    name: EVMChainName.AVALANCHE_TESTNET_FUJI,
    explorerUrl: 'https://testnet.snowtrace.io'
  }
};
