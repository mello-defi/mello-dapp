import React from 'react';
import { ErrorOutlineOutlined } from '@mui/icons-material';

export default function TransactionError({ transactionError }: { transactionError: string }) {
  return (
    <>
      {transactionError !== '' && (
        <div
          className={
            'flex flex-row my-4 md:my-2 items-center rounded-2xl shadow-sm bg-red-200 px-4 py-2'
          }
        >
          <div className={'mr-4'}>
            <ErrorOutlineOutlined className={'text-white h-8 w-8'} />
          </div>
          <span className={'flex-row-center text-body'}>{transactionError}</span>
        </div>
      )}
    </>
  );
}
