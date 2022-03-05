import { TokenDefinition } from '_enums/tokens';
import useWalletBalance from '_hooks/useWalletBalance';
import useMarketPrices from '_hooks/useMarketPrices';
import { useEffect, useState } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import { getMarketDataForSymbol } from '_services/aaveService';
import { formatTokenValueInFiat } from '_services/priceService';
import { BigNumber, ethers } from 'ethers';

export default function WalletBalance({ token, hideZeroBalance }: { token: TokenDefinition, hideZeroBalance: boolean }) {
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
      {marketData && userBalance && (userBalance?.gt(0) || !hideZeroBalance) && (
        <div className={'flex-row-center justify-between my-2 space-y-4 px-2'} key={token.symbol}>
          <div className={'flex-row-center space-y-1'}>
            <img src={token.image} className={'w-10 h-10 rounded-full'} alt={token.symbol} />
            <div className={'flex flex-col ml-3'}>
              <span>{token.name}</span>
              <span className={'text-color-light'}>
                <span className={'font-mono mr-1'}>
                  {ethers.utils.formatUnits(userBalance.toString(), token.decimals).toString()}
                </span>
                {token.symbol}
              </span>
            </div>
          </div>
          <div className={'flex flex-col items-end space-y-1 font-mono'}>
            <span>
              {formatTokenValueInFiat(
                marketData.current_price,
                ethers.utils.formatUnits(userBalance, token.decimals)
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
