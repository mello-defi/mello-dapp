import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { getTokenByAddress } from '_utils/index';
import React from 'react';
import { PoolToken } from '_interfaces/balancer';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { CryptoCurrencySymbol } from '_enums/currency';
import { BigNumber } from 'ethers';

export default function PoolInvestForm({
  poolTokens,
  handleTokenAmountChange,
  amountsToInvest
}: {
  poolTokens: PoolToken[];
  handleTokenAmountChange: (index: number, amount: string) => void;
  amountsToInvest: string[];
}) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const walletBalances = useSelector((state: AppState) => state.wallet.balances);

  const getUserBalanceForPoolToken = (token: PoolToken): BigNumber | undefined => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return bal && bal.balance;
  };

  const walletBalanceGreaterThanZero = (token: PoolToken): boolean => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return !bal || (bal && bal.balance.gt(0));
  };

  return (
    <>
      {amountsToInvest &&
        amountsToInvest.length > 0 &&
        poolTokens.map((token, tokenIndex: number) => (
          <div key={token.symbol} className={'px-2'}>
            <SingleCryptoAmountInput
              disabled={!walletBalanceGreaterThanZero(token)}
              maxAmount={getUserBalanceForPoolToken(token)}
              amount={amountsToInvest[tokenIndex]}
              balance={getUserBalanceForPoolToken(token)}
              amountChanged={(amount: string) => handleTokenAmountChange(tokenIndex, amount)}
              token={getTokenByAddress(tokenSet, token.address)}
            />
          </div>
        ))}
    </>
  );
}
