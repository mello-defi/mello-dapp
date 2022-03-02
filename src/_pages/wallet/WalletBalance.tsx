import { TokenDefinition } from '_enums/tokens';
import useWalletBalance from '_hooks/useWalletBalance';
import useMarketPrices from '_hooks/useMarketPrices';
import { useEffect, useState } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import { getMarketDataForSymbol } from '_services/aaveService';
import { formatTokenValueInFiat } from '_services/priceService';
import { BigNumber, ethers } from 'ethers';

export default function WalletBalance({ token }: { token: TokenDefinition }) {
  const userBalance: BigNumber | undefined = useWalletBalance(token);
  const marketPrices = useMarketPrices();
  const [attemptedToGetMarketData, setAttemptedToGetMarketData] = useState(false);
  const [marketData, setMarketData] = useState<MarketDataResult | null>(null);
  useEffect(() => {
    if (!attemptedToGetMarketData) {
      try {
        const data = getMarketDataForSymbol(marketPrices, token.symbol);
        setMarketData(data);
        setAttemptedToGetMarketData(true);
      } catch (e: any) {
        console.log(e);
      }
    }
  }, [attemptedToGetMarketData]);
  return (
    <>
      {marketData && userBalance && (
        <div className={'flex-row-center justify-between my-2 space-y-4 px-2'} key={token.symbol}>
          <div className={'flex-row-center space-y-1'}>
            <img src={token.image} className={'w-10 h-10 rounded-full'} alt={token.symbol} />
            <div className={'flex flex-col ml-3'}>
              <span>{token.name}</span>
              <span className={'text-gray-500'}>
                {ethers.utils.formatUnits(userBalance.toString(), token.decimals).toString()}{' '}
                {token.symbol}
              </span>
            </div>
          </div>
          <div className={'flex flex-col items-end space-y-1'}>
            <span>
              {formatTokenValueInFiat(
                marketData.current_price,
                ethers.utils.formatUnits(userBalance, token.decimals)
              )}
            </span>
            <span className={'text-gray-500'}> </span>
          </div>
        </div>
      )}
    </>
  );
}
