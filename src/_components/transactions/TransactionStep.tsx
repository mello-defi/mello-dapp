import { Spinner, SpinnerSize } from '_components/core/Animations';
import React from 'react';
import { TransactionTransition } from '_components/transactions/TransactionTransition';
import {
  CheckCircle,
  CheckCircleOutlineOutlined,
  ErrorOutline,
  ErrorOutlineOutlined,
  Info
} from '@mui/icons-material';

export function TransactionStep({
  show,
  children,
  transactionError,
  stepComplete,
  requiresUserInput,
  showTransition = true
}: {
  show: boolean;
  children: any;
  transactionError?: string;
  requiresUserInput?: boolean;
  stepComplete: boolean;
  showTransition?: boolean;
}) {
  return (
    <div>
      {show && (
        <div
          className={
            'flex flex-row my-1 md:my-2 items-center rounded-2xl shadow-sm bg-white px-4 py-2'
          }
        >
          <div className={'mr-4 text-3xl'}>
            {transactionError ? (
              <ErrorOutline className={'text-red-400 mb-0.5'} fontSize={'inherit'} />
            ) : (
              <>
                {stepComplete ? (
                  <CheckCircle className={'text-green-400'} fontSize={'inherit'} />
                ) : (
                  <>
                    {requiresUserInput ? (
                      <Info className={'text-gray-400 mb-0.5'} fontSize={'inherit'} />
                    ) : (
                      <div className={'ml-1.5'}>
                        <Spinner show={!stepComplete} size={SpinnerSize.SMALL} />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          <span className={'flex-row-center my-2 text-body'}>{children}</span>
        </div>
      )}
      {((transactionError && transactionError.length > 0) || (showTransition && stepComplete)) && (
        <TransactionTransition transactionError={transactionError} />
      )}
    </div>
  );
}
