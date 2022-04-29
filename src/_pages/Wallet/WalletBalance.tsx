import { EvmTokenDefinition } from '_enums/tokens';
import useWalletBalances from '_hooks/useWalletBalances';
import useMarketPrices from '_hooks/useMarketPrices';
import { useEffect, useState } from 'react';
import { formatTokenValueInFiat } from '_services/priceService';
import { BigNumber } from 'ethers';
import CryptoAmountWithTooltip from '_components/core/CryptoAmountTooltip';
import { formatUnits } from 'ethers/lib/utils';

export default function WalletBalance({
  token,
  hideZeroBalance
}: {
  token: EvmTokenDefinition;
  hideZeroBalance: boolean;
}) {
  const [userBalance, setUserBalance] = useState<BigNumber | undefined>();
  const marketPrices = useMarketPrices();
  const [marketPrice, setMarketPrice] = useState<number | undefined>();
  const walletBalances = useWalletBalances();
  useEffect(() => {
    if (token) {
      setUserBalance(walletBalances[token.symbol]?.balance);
    }
  }, [walletBalances, token]);

  useEffect(() => {
    setMarketPrice(marketPrices[token.address.toLowerCase()]);
  }, [marketPrices, token.address]);
  // const marketPrices = useMarketPrices();
  // const [attemptedToGetMarketData, setAttemptedToGetMarketData] = useState(false);
  // const [marketData, setMarketData] = useState<NetworkMarketData | null>(null);
  // useEffect(() => {
  //   if (!attemptedToGetMarketData && marketPrices) {
  //     try {
  //       // const data = getMarketDataForSymbol(marketPrices, token.symbol);
  //       const data = marketPrices
  //       if (data) {
  //         setMarketData(data);
  //         setAttemptedToGetMarketData(true);
  //       }
  //     } catch (e: any) {
  //       console.error(e);
  //     }
  //   }
  // }, [attemptedToGetMarketData, marketPrices]);

  return (
    <>
      {marketPrice && userBalance !== undefined && (userBalance?.gt(0) || !hideZeroBalance) && (
        <div className={'flex-row-center justify-between my-2 space-y-4 px-2'} key={token.symbol}>
          <div className={'flex-row-center space-y-1'}>
            <img src={token.image} className={'w-10 h-10 rounded-full'} alt={token.symbol} />
            <div className={'flex flex-col ml-3'}>
              <span>{token.name}</span>
              <span className={'text-color-light'}>
                <CryptoAmountWithTooltip
                  token={token}
                  amount={userBalance.toString()}
                  showSymbol={true}
                />
              </span>
            </div>
          </div>
          <div className={'flex flex-col items-end space-y-1 font-mono'}>
            <span>
              {formatTokenValueInFiat(marketPrice, formatUnits(userBalance, token.decimals))}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
