import { AaveFunction } from '_enums/aave';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import React from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

export default function AaveReserveFunctionButton({
  activeFunctionName,
  handleClicked,
  functionName,
  disabled = false
}: {
  activeFunctionName?: AaveFunction | null;
  handleClicked: (functionName: AaveFunction) => void;
  functionName: AaveFunction;
  disabled?: boolean;
}) {
  const functionIsActiveFunction = () => {
    return activeFunctionName && activeFunctionName === functionName;
  };
  return (
    <Button
      variant={ButtonVariant.SECONDARY}
      size={ButtonSize.SMALL}
      disabled={disabled}
      onClick={() => handleClicked(functionName)}
      className={`ml-2 py-2 my-1 md:my-0 w-full md:w-auto ${
        functionIsActiveFunction() ? 'bg-gray-200' : ''
      }`}
    >
      <div className={'flex-row-center justify-center'}>
        <span>{functionName}</span>
        {activeFunctionName && activeFunctionName === functionName ? (
          <ExpandLess className="-mr-1 ml-1 h-5 w-5" />
        ) : (
          <ExpandMore className="-mr-1 ml-1 h-5 w-5" />
        )}
      </div>
    </Button>
  );
}
