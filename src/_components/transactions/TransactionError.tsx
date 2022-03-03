import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

export default function TransactionError({ transactionError }: { transactionError: string }) {
  return (
    <>
      {transactionError !== '' && (
        <div
          className={
            'flex flex-row my-4 md:my-2 items-center rounded-full shadow-sm bg-red-300 px-4 py-2'
          }
        >
          <div className={'mr-4'}>
            <ExclamationCircleIcon className={'text-white h-8 w-8'} />
          </div>
          <span className={'flex-row-center text-body'}>{transactionError}</span>
        </div>
      )}
    </>
  );
}
