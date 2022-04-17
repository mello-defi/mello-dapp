import TokenSelectDropdown from '_components/TokenSelectDropdown';
import { EvmTokenDefinition } from '_enums/tokens';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { parseUnits } from 'ethers/lib/utils';
import { getTokenByAddress } from '_utils/index';
import SingleCryptoAmountInputSkeleton from '_components/core/SingleCryptoAmountInputSkeleton';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { PoolToken } from '_interfaces/balancer';

export default function WithdrawSingleTokenForm({
  poolTokens,
  amountsToWithdraw,
  singleExitTokenIndex,
  singleAssetMaxes,
  singleExitToken,
  setSingleExitToken,
  handleTokenAmountChange
}: {
  poolTokens: PoolToken[];
  amountsToWithdraw: string[];
  singleExitTokenIndex?: number;
  singleAssetMaxes: string[];
  singleExitToken?: EvmTokenDefinition;
  setSingleExitToken: (token: EvmTokenDefinition) => void;
  handleTokenAmountChange: (index: number, amount: string) => void;
}) {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const singleTokenOutInputShouldRender = (): boolean => {
    if (!amountsToWithdraw || amountsToWithdraw.length === 0) {
      return false;
    }
    if (!tokenSet) {
      return false;
    }
    if (!singleAssetMaxes || singleAssetMaxes.length === 0) {
      return false;
    }
    if (singleExitTokenIndex === undefined) {
      return false;
    }
    if (!amountsToWithdraw[singleExitTokenIndex]) {
      return false;
    }
    return true;
  };
  return (
    <div className={'px-2'}>
      <TokenSelectDropdown
        tokenFilter={(t) =>
          Object.keys(poolTokens)
            .map((address: string) => address.toLowerCase())
            .includes(t.address.toLowerCase())
        }
        selectedToken={singleExitToken}
        onSelectToken={(token: EvmTokenDefinition) => {
          setSingleExitToken(token);
        }}
        disabled={false}
      />
      <div>
        {singleExitTokenIndex && singleTokenOutInputShouldRender() ? (
          <SingleCryptoAmountInput
            disabled={parseUnits(
              singleAssetMaxes[singleExitTokenIndex] || '0',
              poolTokens[singleExitTokenIndex].decimals
            ).eq(0)}
            amount={amountsToWithdraw[singleExitTokenIndex]}
            balance={parseUnits(
              singleAssetMaxes[singleExitTokenIndex] || '0',
              poolTokens[singleExitTokenIndex].decimals
            )}
            amountChanged={(amount: string) =>
              handleTokenAmountChange(singleExitTokenIndex, amount)
            }
            maxAmount={parseUnits(
              singleAssetMaxes[singleExitTokenIndex] || '0',
              poolTokens[singleExitTokenIndex].decimals
            )}
            token={getTokenByAddress(tokenSet, poolTokens[singleExitTokenIndex].address)}
          />
        ) : (
          <SingleCryptoAmountInputSkeleton />
        )}
      </div>
    </div>
  );
}
