import React from 'react';
import { Close, ErrorOutlineOutlined } from '@mui/icons-material';

export default function TransactionError({ transactionError, onClickClear }: { transactionError: string, onClickClear?: () => void }) {
  return (
    <>
      {transactionError !== '' && (
        <div
          className={
            'flex-row-center my-4 md:my-2 rounded-2xl shadow-sm bg-red-200 px-4 py-2 justify-between'
          }
        >
          <div className={"flex-row-center"}>
            <div className={'mr-4 text-3xl'}>
              <ErrorOutlineOutlined className={'text-white mb-0.5'} fontSize={'inherit'} />
            </div>
            <span className={'flex-row-center text-body'}>{transactionError}</span>
          </div>
          <div
            onClick={onClickClear}
            className={'text-3xl'}>
            <Close
              fontSize={'inherit'}
              className={'text-white hover:text-gray-100 transition cursor-pointer mb-0.5'}/>
          </div>
        </div>
      )}
    </>
  );
}
