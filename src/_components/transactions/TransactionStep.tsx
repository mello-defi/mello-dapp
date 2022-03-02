import { Spinner, SpinnerSize } from '_components/core/Animations';
import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import { TransactionTransition } from '_components/transactions/TransactionTransition';

export function TransactionStep({
  show,
  children,
  transactionError,
  stepComplete,
  showTransition = true
}: {
  show: boolean;
  children: any;
  transactionError: string | undefined;
  stepComplete: boolean;
  showTransition?: boolean;
}) {
  return (
    <div>
      {show && (
        <div
          className={'flex flex-row my-4 md:my-2 items-center rounded-full shadow-sm bg-white px-4 py-2'}
        >
          <div className={'mr-4'}>
            {transactionError ? (
              <ExclamationCircleIcon className={'text-red-400 h-8 w-8'} />
            ) : (
              <>
                {stepComplete ? (
                  <CheckCircleIcon className={'text-green-400 h-8 w-8'} />
                ) : (
                  <div className={'ml-1.5'}>
                    <Spinner show={!stepComplete} size={SpinnerSize.SMALL} />
                  </div>
                )}
              </>
            )}
          </div>
          <span className={'flex-row-center text-title'}>{children}</span>
        </div>
      )}
      {showTransition && stepComplete && <TransactionTransition />}
    </div>
  );
}
