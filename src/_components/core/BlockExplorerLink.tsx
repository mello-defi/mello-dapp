import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';

export default function BlockExplorerLink({ transactionHash }: { transactionHash?: string }) {
  const network = useSelector((state: AppState) => state.web3.network);
  return (
    <>
      {transactionHash && (
        <a
          target="_blank"
          href={`${network.explorerUrl}/tx/${transactionHash}`}
          className={
            'flex text-center text-body-smaller px-2 py-1 ml-2 cursor-pointer rounded-full bg-gray-200 hover:bg-gray-300 transition'
          }
          rel="noreferrer"
        >
          View on explorer
        </a>
      )}
    </>
  );
}
