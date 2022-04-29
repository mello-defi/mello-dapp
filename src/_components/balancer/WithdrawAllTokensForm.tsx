import { PoolToken } from '_interfaces/balancer';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { parseUnits } from 'ethers/lib/utils';
import { getTokenByAddress } from '_utils/index';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';

export default function WithdrawAllTokensForm({
  amountsToWithdraw,
  amountsInPool,
  poolTokens,
  handleTokenAmountChange
}: {
  amountsToWithdraw: string[];
  amountsInPool: string[];
  poolTokens: PoolToken[];
  handleTokenAmountChange: (index: number, amount: string) => void;
}) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  return (
    <>
      {amountsToWithdraw &&
        amountsInPool &&
        poolTokens.map((token: PoolToken, index: number) => (
          <div key={token.symbol} className={'px-2'}>
            <SingleCryptoAmountInput
              disabled={amountsInPool[index] === '0'}
              amount={amountsToWithdraw[index]}
              balance={parseUnits(amountsInPool[index], token.decimals)}
              maxAmount={parseUnits(amountsInPool[index], token.decimals)}
              amountChanged={(amount: string) => handleTokenAmountChange(index, amount)}
              token={getTokenByAddress(tokenSet, token.address)}
            />
          </div>
        ))}
    </>
  );
}
