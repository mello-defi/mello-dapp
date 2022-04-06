import axios from 'axios';
import { FiatCurrencyName } from '_enums/currency';

const instance = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/coins/markets',
  headers: {
    Accept: 'application/json'
  }
});

export interface MarketDataResult {
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CoinGeckoParams {
  vs_currency: string;
  ids: string;
}

export const getMarketDataForSymbol = (
  marketDataResults: MarketDataResult[],
  symbol: string
): MarketDataResult | undefined => {
  return marketDataResults?.find(
    (m) => m.symbol === (symbol.startsWith('W') ? symbol.substring(1) : symbol).toLocaleLowerCase()
  );
};
export function getMarketData(
  currency: FiatCurrencyName = FiatCurrencyName.USD
): Promise<MarketDataResult[]> {
  const params: CoinGeckoParams = {
    vs_currency: currency.toLocaleLowerCase(),
    // https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=0xD6DF932A45C0f255f85145f286eA0b292B21C90B,0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7,0xc3FdbadC7c795EF1D6Ba111e06fF8F16A20Ea539,0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b,0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3,0xDB7Cb471dd0b49b29CAB4a1C14d070f27216a0Ab,0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39,0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c,0x172370d5Cd63279eFa6d502DAB29171933a610AF,0xE7804D91dfCDE7F776c90043E03eAa6Df87E6395,0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063,0x1D607Faa0A51518a7728580C238d912747e71F7a,0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369,0x2a93172c8DCCbfBC60a39d56183B7279a2F647b4,0xbD7A5Cf51d22930B8B3Df6d834F9BCEf90EE7c4f,0xC8A94a3d3D2dabC3C1CaffFFDcA6A7543c3e3e65,0xdb95f9188479575F3F718a245EcA1B3BF74567EC,0x5FFD62D3C3eE2E81C00A7b9079FB248e7dF024A8,0xfBd8A3b908e764dBcD51e27992464B4432A1132b,0x596eBE76e2DB4470966ea395B0d063aC6197A8C5,0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c,0xa3Fa99A148fA48D14Ed51d610c367C61876997F1,0xF501dd45a1198C2E1b5aEF5314A68B9006D842E0,0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1,0x282d8efCe846A88B159800bd4130ad77443Fa1A1,0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128,0x263534a4Fe3cb249dF46810718B7B612a30ebbff,0x580A84C73811E1839F75d86d75d88cCa0c241fF4,0x831753DD7087CaC61aB5644b308642cc1c33Dc13,0x00e5646f60AC6Fb446f621d146B6E1886f002905,0x431CD3C9AC9Fc73644BF68bF5691f4B83F9E104f,0xE111178A87A3BFf0c8d18DECBa5798827539Ae99,0x7DfF46370e9eA5f0Bad3C4E29711aD50062EA7A4,0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a,0x50B728D8D964fd00C2d0AAD81718b71311feF68a,0x2934b36ca9A4B31E633C5BE670C8C8b28b6aA015,0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32,0xc2132D05D31c914a87C6611C10748AEb04B58e8F,0x5fe2B58c013d7601147DcdD68C143A77499f5531,0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683,0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756,0x3066818837c5e6eD6601bd5a91B0762877A6B731,0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174,0xb33EaAd8d922B1083446DC23f610c2567fB5180f,0x87ff96aba480f1813aF5c780387d8De7cf7D8261,0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6,0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619,0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270,0xbAe28251B2a4E621aA7e20538c06DEe010Bc06DE,0xDBf31dF14B66535aF65AaC99C32e9eA844e14501,0xDA537104D6A5edd53c6fBba9A898708E465260b6,0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE,0xC3C7d422809852031b44ab29EEC9F1EfF2A58756&vs_currencies=usd
    // TODO use contract acddresses https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&vs_currencies=usd
    // ids: tokenIds.join(',').toLocaleLowerCase(),
    ids: [
      'bitcoin',
      'ethereum',
      'matic-network',
      'usd-coin',
      'dai',
      'wrapped-bitcoin',
      'jarvis-synthetic-euro',
      'renbtc',
      'balancer',
      'true-usd',
      'tether',
      'qi-dao',
      'mimatic'
    ]
      .join(',')
      .toLocaleLowerCase()
  };
  return instance
    .get(`/`, {
      params
    })
    .then((response) => {
      return response.data as MarketDataResult[];
    });
}
