import { useState } from 'react';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

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
        <AssignmentTurnedInOutlinedIcon className={`ml-2 text-color-light h-7 w-7`} />
      ) : (
        <ContentCopyOutlinedIcon className={'ml-2 text-color-light h-7 w-7'} />
      )}
    </div>
  );
}
