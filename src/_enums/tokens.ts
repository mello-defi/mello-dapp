import ERC20Abi from '_enums/erc20.js';
import WETHAbi from '_enums/weth.json';
import { CryptoCurrencyName, CryptoCurrencySymbol } from '_enums/currency';
import {
  btcLogo,
  daiLogo,
  ethLogo,
  jeurLogo,
  polygonLogo,
  renbtcLogo,
  usdcLogo,
  wbtcLogo,
  wethLogo
} from '_assets/images';

export const validPolygonTokenSymbols: CryptoCurrencySymbol | string[] = [
  CryptoCurrencySymbol.ETH,
  CryptoCurrencySymbol.DAI,
  CryptoCurrencySymbol.MATIC,
  CryptoCurrencySymbol.WMATIC,
  CryptoCurrencySymbol.WBTC,
  CryptoCurrencySymbol.RENBTC,
  CryptoCurrencySymbol.USDC,
  CryptoCurrencySymbol.WETH,
  CryptoCurrencySymbol.BAL,
];
// export const validPolygonTokenSymbolsUppercase: string[] = validPolygonTokenSymbols.map((symbol) =>
//   symbol.toUpperCase()
// );

export const EvmGasTokenBurnAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export enum EthereumTestnetKovanContracts {
  ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
}

export enum EthereumTestnetRinkebyContracts {
  ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
}

export enum EthereumTestnetGoerliContracts {
  ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
}

export enum EthereumMainnetTokenContracts {
  ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  MATIC = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
}

export enum PolygonMainnetTokenContracts {
  WETH = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  WBTC = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
  USDC = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  WMATIC = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  MATIC = '0x0000000000000000000000000000000000001010',
  DAI = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  RENBTC = '0xdbf31df14b66535af65aac99c32e9ea844e14501',
  JEUR = '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c',
  BAL = '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3'
}

export enum PolygonTestnetMumbaiTokenContracts {
  WETH = '0x062f24cb618e6ba873ec1c85fd08b8d2ee9bf23e',
  WBTC = '0xD54Cc629ffcac00592cB578e0dA095a097548d80',
  USDC = '0xe6b8a5cf854791412c1f6efc7caf629f5df1c747',
  WMATIC = '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
  MATIC = '0x0000000000000000000000000000000000001010',
  DAI = '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f',
  RENBTC = '0x880Ad65DC5B3F33123382416351Eef98B4aAd7F1'
}

export enum AvalancheMainnetTokenContracts {
  USDCE = '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
  USDC = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
  WBTCE = '0x50b7545627a5162f82a992c33b87adc75187b218',
  DAIE = '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
  AVAX = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
  WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
}

export enum AvalancheTestnetTokenContracts {
  DAIE = '0xebbc3452cc911591e4f18f3b36727df45d6bd1f9',
  USDCE = '0x45ea5d57ba80b5e3b0ed502e9a08d568c96278f9'
}

export interface TokenDefinition {
  symbol: CryptoCurrencySymbol;
  name: CryptoCurrencyName;
  image: string;
  decimals: number;
}
export interface EvmTokenDefinition extends TokenDefinition {
  address: string;
  abi: any;
  isGasToken?: boolean;
}
export const nativeBitcoin: TokenDefinition = {
  symbol: CryptoCurrencySymbol.BTC,
  name: CryptoCurrencyName.BITCOIN,
  image: btcLogo,
  decimals: 8
};

export interface EthereumTokens {
  eth: EvmTokenDefinition;
  weth: EvmTokenDefinition;
}

export const ethereumTokens: EthereumTokens = {
  eth: {
    symbol: CryptoCurrencySymbol.ETH,
    decimals: 18,
    address: EthereumMainnetTokenContracts.ETH,
    image: ethLogo,
    name: CryptoCurrencyName.ETHEREUM,
    abi: WETHAbi,
    isGasToken: true
  },
  weth: {
    symbol: CryptoCurrencySymbol.WETH,
    decimals: 18,
    address: EthereumMainnetTokenContracts.WETH,
    image: wethLogo,
    name: CryptoCurrencyName.WETHEREUM,
    abi: WETHAbi
  }
};

export type GenericTokenSet = {
  [key in CryptoCurrencySymbol]?: EvmTokenDefinition;
};

export interface AvalancheTokenSet extends GenericTokenSet {
  // [CryptoCurrencySymbol.WAVAX]: TokenDefinition;
  // [CryptoCurrencySymbol.AVAX]: TokenDefinition;
  [CryptoCurrencySymbol.USDCE]: EvmTokenDefinition;
  // [CryptoCurrencySymbol.USDC]: TokenDefinition;
  [CryptoCurrencySymbol.DAIE]: EvmTokenDefinition;
  // [CryptoCurrencySymbol.WBTCE]: TokenDefinition;
}

export const avalancheTestnetTokens: AvalancheTokenSet = {
  [CryptoCurrencySymbol.USDCE]: {
    symbol: CryptoCurrencySymbol.USDCE,
    decimals: 6,
    address: AvalancheTestnetTokenContracts.USDCE,
    image: usdcLogo,
    name: CryptoCurrencyName.USDCE,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.DAIE]: {
    symbol: CryptoCurrencySymbol.DAIE,
    decimals: 18,
    address: AvalancheMainnetTokenContracts.DAIE,
    image: daiLogo,
    name: CryptoCurrencyName.DAIE,
    abi: ERC20Abi
  }
};

export const avalancheMainnetTokens: AvalancheTokenSet = {
  [CryptoCurrencySymbol.USDCE]: {
    symbol: CryptoCurrencySymbol.USDCE,
    decimals: 6,
    address: AvalancheMainnetTokenContracts.USDCE,
    image: usdcLogo,
    name: CryptoCurrencyName.USDCE,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.DAIE]: {
    symbol: CryptoCurrencySymbol.DAIE,
    decimals: 18,
    address: AvalancheMainnetTokenContracts.DAIE,
    image: daiLogo,
    name: CryptoCurrencyName.DAIE,
    abi: ERC20Abi
  }
};

export interface PolygonTokenSet extends GenericTokenSet {
  [CryptoCurrencySymbol.DAI]: EvmTokenDefinition;
  [CryptoCurrencySymbol.USDC]: EvmTokenDefinition;
  [CryptoCurrencySymbol.MATIC]: EvmTokenDefinition;
  [CryptoCurrencySymbol.WMATIC]: EvmTokenDefinition;
  [CryptoCurrencySymbol.WETH]: EvmTokenDefinition;
  [CryptoCurrencySymbol.WBTC]: EvmTokenDefinition;
  [CryptoCurrencySymbol.RENBTC]: EvmTokenDefinition;
  [CryptoCurrencySymbol.JEUR]?: EvmTokenDefinition;
  [CryptoCurrencySymbol.BAL]?: EvmTokenDefinition;
}

export const polygonTestnetMumbaiTokens: PolygonTokenSet = {
  [CryptoCurrencySymbol.DAI]: {
    symbol: CryptoCurrencySymbol.DAI,
    decimals: 18,
    address: PolygonTestnetMumbaiTokenContracts.DAI,
    image: daiLogo,
    name: CryptoCurrencyName.DAI,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.USDC]: {
    symbol: CryptoCurrencySymbol.USDC,
    decimals: 6,
    address: PolygonTestnetMumbaiTokenContracts.USDC,
    image: usdcLogo,
    name: CryptoCurrencyName.USDC,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.MATIC]: {
    symbol: CryptoCurrencySymbol.MATIC,
    decimals: 18,
    address: PolygonTestnetMumbaiTokenContracts.MATIC,
    image: polygonLogo,
    name: CryptoCurrencyName.MATIC,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.WMATIC]: {
    symbol: CryptoCurrencySymbol.WMATIC,
    decimals: 18,
    address: PolygonTestnetMumbaiTokenContracts.WMATIC,
    image: polygonLogo,
    name: CryptoCurrencyName.WMATIC,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.WETH]: {
    symbol: CryptoCurrencySymbol.WETH,
    decimals: 18,
    address: PolygonTestnetMumbaiTokenContracts.WETH,
    image: wethLogo,
    name: CryptoCurrencyName.WETHEREUM,
    abi: WETHAbi
  },
  [CryptoCurrencySymbol.WBTC]: {
    symbol: CryptoCurrencySymbol.WBTC,
    decimals: 8,
    address: PolygonTestnetMumbaiTokenContracts.WBTC,
    image: wbtcLogo,
    name: CryptoCurrencyName.WBITCOIN,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.RENBTC]: {
    symbol: CryptoCurrencySymbol.RENBTC,
    decimals: 8,
    address: PolygonTestnetMumbaiTokenContracts.RENBTC,
    image: renbtcLogo,
    name: CryptoCurrencyName.RENBITCOIN,
    abi: ERC20Abi
  }
};

export const polygonMainnetTokens: PolygonTokenSet = {
  [CryptoCurrencySymbol.DAI]: {
    symbol: CryptoCurrencySymbol.DAI,
    decimals: 18,
    address: PolygonMainnetTokenContracts.DAI,
    image: daiLogo,
    name: CryptoCurrencyName.DAI,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.BAL]: {
    symbol: CryptoCurrencySymbol.BAL,
    decimals: 18,
    address: PolygonMainnetTokenContracts.BAL,
    image: daiLogo,
    name: CryptoCurrencyName.BAL,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.USDC]: {
    symbol: CryptoCurrencySymbol.USDC,
    decimals: 6,
    address: PolygonMainnetTokenContracts.USDC,
    image: usdcLogo,
    name: CryptoCurrencyName.USDC,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.MATIC]: {
    symbol: CryptoCurrencySymbol.MATIC,
    decimals: 18,
    address: PolygonMainnetTokenContracts.MATIC,
    image: polygonLogo,
    name: CryptoCurrencyName.MATIC,
    abi: ERC20Abi,
    isGasToken: true
  },
  [CryptoCurrencySymbol.WMATIC]: {
    symbol: CryptoCurrencySymbol.WMATIC,
    decimals: 18,
    address: PolygonMainnetTokenContracts.WMATIC,
    image: polygonLogo,
    name: CryptoCurrencyName.WMATIC,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.WETH]: {
    symbol: CryptoCurrencySymbol.WETH,
    decimals: 18,
    address: PolygonMainnetTokenContracts.WETH,
    image: wethLogo,
    name: CryptoCurrencyName.WETHEREUM,
    abi: WETHAbi
  },
  [CryptoCurrencySymbol.WBTC]: {
    symbol: CryptoCurrencySymbol.WBTC,
    decimals: 8,
    address: PolygonMainnetTokenContracts.WBTC,
    image: wbtcLogo,
    name: CryptoCurrencyName.WBITCOIN,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.RENBTC]: {
    symbol: CryptoCurrencySymbol.RENBTC,
    decimals: 8,
    address: PolygonMainnetTokenContracts.RENBTC,
    image: renbtcLogo,
    name: CryptoCurrencyName.RENBITCOIN,
    abi: ERC20Abi
  },
  [CryptoCurrencySymbol.JEUR]: {
    symbol: CryptoCurrencySymbol.JEUR,
    decimals: 18,
    address: PolygonMainnetTokenContracts.JEUR,
    image: jeurLogo,
    name: CryptoCurrencyName.JEUR,
    abi: ERC20Abi
  }
};
