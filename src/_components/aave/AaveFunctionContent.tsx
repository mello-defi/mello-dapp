import { EvmTokenDefinition } from '_enums/tokens';
import { Button } from '_components/core/Buttons';
import React from 'react';
import { BigNumber } from 'ethers';

export default function AaveFunctionContent({
  buttonText,
  renderNextHealthFactor,
  renderAmountInput,
  userBalance,
  token,
  buttonOnClick,
  buttonDisabled
}: {
  buttonText: string;
  renderNextHealthFactor: () => JSX.Element;
  renderAmountInput: () => JSX.Element;
  userBalance: BigNumber | undefined;
  token: EvmTokenDefinition;
  buttonOnClick: () => void;
  buttonDisabled: boolean;
}) {
  return (
    <div className={'flex flex-col justify-between space-x-0 md:space-x-2'}>
      <div className={'w-full'}>{userBalance && renderAmountInput()}</div>

      <div className={'w-full flex flex-col my-2 md:my-0'}>
        {renderNextHealthFactor()}
        {token && (
          <Button
            onClick={buttonOnClick}
            disabled={buttonDisabled}
            className={'flex-row-center justify-center w-full my-0.5'}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}
