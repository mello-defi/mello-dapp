import TokenSelectDropdown from '_components/core/TokenSelectDropdown';
import { EvmTokenDefinition } from '_enums/tokens';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { parseUnits } from 'ethers/lib/utils';
import { getTokenByAddress } from '_utils/index';
import SingleCryptoAmountInputSkeleton from '_components/core/SingleCryptoAmountInputSkeleton';
import React, { useEffect } from 'react';
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
  const [singleTokenInputShouldRender, setSingleTokenInputShouldRender] = React.useState(false);

  useEffect(() => {
    let shouldRender = true;
    if (!amountsToWithdraw || amountsToWithdraw.length === 0) {
      shouldRender = false;
    }
    if (!tokenSet) {
      shouldRender = false;
    }
    if (!singleAssetMaxes || singleAssetMaxes.length === 0) {
      shouldRender = false;
    }
    if (singleExitTokenIndex === undefined) {
      shouldRender = false;
    }
    setSingleTokenInputShouldRender(shouldRender);
  }, [amountsToWithdraw, singleAssetMaxes, singleExitTokenIndex, tokenSet]);

  return (
    <div className={'px-2'}>
      <TokenSelectDropdown
        tokenFilter={(t) =>
          poolTokens
            .map((token: PoolToken) => token.address.toLowerCase())
            .includes(t.address.toLowerCase())
        }
        selectedToken={singleExitToken}
        onSelectToken={(token: EvmTokenDefinition) => {
          setSingleExitToken(token);
        }}
        disabled={false}
      />
      <div>
        {singleExitTokenIndex !== undefined && singleTokenInputShouldRender ? (
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
