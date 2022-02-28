import { useState } from 'react';
import { ClipboardCheckIcon } from '@heroicons/react/solid';
import { ClipboardCopyIcon } from '@heroicons/react/outline';

export default function CopyableText({
  text,
  textSize = 'text-title'
}: {
  text: string;
  textSize?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };
  return (
    <div
      onClick={copyToClipboard}
      className={`flex-row-center ${textSize} bg-gray-100 hover:bg-gray-200 transition justify-center rounded-2xl px-4 py-2 w-full mx-auto cursor-pointer`}
    >
      {text}
      {copied ? (
        <ClipboardCheckIcon className={`ml-2 text-green-500 h-7 w-7`} />
      ) : (
        <ClipboardCopyIcon className={'ml-2 text-gray-500 h-7 w-7'} />
      )}
    </div>
  );
}
