import React from 'react';

export default function PoweredByLink({
  url,
  logo,
  isRound = true
}: {
  url: string;
  logo: string;
  isRound?: boolean;
}) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={
        'flex-row-center cursor-pointer shadow-sm bg-gray-100 hover:bg-gray-200 transition rounded-full px-4 py-2'
      }
      href={url}
    >
      <span className={'text-gray-500'}>Powered by</span>
      <img src={logo} className={`h-8 ml-2 ${isRound ? 'rounded-full' : ''}`} />
    </a>
  );
}
