import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useState } from 'react';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import { Button } from '_components/core/Buttons';
import { QrcodeIcon } from '@heroicons/react/solid';
import { DefaultTransition } from '_components/core/Transition';
import QRCode from 'react-qr-code';

export default function Receive() {
  const userAddress = useSelector((state: AppState) => state.web3.userAddress);
  const [addressCopied, setAddressCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(userAddress);
    setAddressCopied(true);
  };

  const toggleShowQrCode = () => {
    setShowQrCode(!showQrCode);
  };

  return (
    <div className={'space-y-2'}>
      <div className={'flex flex-col md:flex-row justify-between'}>
        <span className={'text-title'}>Copy your wallet address by clicking the button below</span>
        <span className={'text-title text-gray-600'}>
          Address {!addressCopied ? ' not ' : ''} copied{' '}
          <span className={'ml-1'}>{addressCopied ? '✅' : '☑️'}</span>
        </span>
      </div>
      <div
        onClick={copyToClipboard}
        className={
          'flex-row-center text-title bg-gray-100 hover:bg-gray-200 transition justify-center rounded-2xl px-4 py-2 w-full mx-auto cursor-pointer'
        }
      >
        {userAddress}
        <ClipboardCopyIcon className={'ml-2 text-gray-500 h-7 w-7'} />
      </div>
      <div className={'flex flex-col items-center'}>
        <span className={'text-title'}>Or</span>
        <Button onClick={toggleShowQrCode} className={'flex-row-center justify-center'}>
          <QrcodeIcon className={'h-6 w-6'} />
          Display QR Code
        </Button>
        <DefaultTransition isOpen={showQrCode}>
          <div className={'mt-2'}>
            <QRCode value={userAddress} size={256} />
          </div>
        </DefaultTransition>
      </div>
    </div>
  );
}
