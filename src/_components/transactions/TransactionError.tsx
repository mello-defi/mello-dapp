import React from 'react';

export default function TransactionError({ transactionError }: { transactionError: string }) {
  return (
    <>
      {transactionError !== '' && (
        <div className={'bg-red-200 my-1 px-2 py-2 text-title-tab-bar rounded-md'}>
          {transactionError}
        </div>
      )}
    </>
  );
}
