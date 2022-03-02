import React from 'react';

export function TransactionTransition({ transactionError }: { transactionError?: string }) {
  return (
    <div
      className={`border-${transactionError ? 'red' : 'green'}-400 ml-8 border-l-2 border-dashed`}
    >
      &nbsp;
    </div>
  );
}
