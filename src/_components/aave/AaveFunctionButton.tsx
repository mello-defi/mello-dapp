import { AaveFunction } from '_enums/aave';
import { Button, ButtonSize, ButtonVariant } from '_components/core/Buttons';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import React from 'react';

export default function AaveFunctionButton({
                              activeFunctionName,
                              handleClicked,
                              functionName
                            }: {
  activeFunctionName?: AaveFunction | null;
  handleClicked: (functionName: AaveFunction) => void;
  functionName: AaveFunction;
}) {

  return (
    <Button
      variant={ButtonVariant.SECONDARY}
      size={ButtonSize.SMALL}
      onClick={() => handleClicked(functionName)}
      className={`ml-2 py-2 my-1 md:my-0 w-full md:w-auto ${activeFunctionName && activeFunctionName === functionName ? 'bg-gray-200' : ''}`}
    >
      <div className={'flex-row-center justify-center'}>
        <span>{functionName}</span>
        {activeFunctionName && activeFunctionName === functionName ? (
          <ChevronUpIcon className="-mr-1 ml-1 h-5 w-5" />
        ) : (
          <ChevronDownIcon className="-mr-1 ml-1 h-5 w-5" />
        )}
      </div>
    </Button>
  );
}
