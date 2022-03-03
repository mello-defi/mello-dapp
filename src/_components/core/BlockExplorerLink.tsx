import React from 'react';

export default function BlockExplorerLink({ transactionHash }: { transactionHash?: string }) {
  return (
    <>
      {transactionHash && (
        <a
          target="_blank"
          href={'https://polygonscan.com/tx/' + transactionHash}
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
