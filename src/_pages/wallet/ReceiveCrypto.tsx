import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useState } from 'react';
import { Button } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import QrCodeOutlinedIcon from '@mui/icons-material/QrCodeOutlined';
import QRCode from 'react-qr-code';
import { AssignmentTurnedInOutlined, ContentCopyOutlined } from '@mui/icons-material';

enum ReceiveCryptoOption {
  ShowQrCode = 0,
  ShowAddress = 1
}

export default function ReceiveCrypto() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const [option, setOption] = useState<ReceiveCryptoOption | undefined>();

  const [addressCopied, setAddressCopied] = useState(false);
  const copyToClipboard = async () => {
    if (userAddress) {
      await navigator.clipboard.writeText(userAddress);
      setAddressCopied(true);
    }
  };

  return (
    <div className={''}>
      <div
        className={
          'flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 space-x-0 md:space-x-2'
        }
      >
        <Button
          className={'w-full md:w-1/2'}
          onClick={() => setOption(ReceiveCryptoOption.ShowAddress)}
          disabled={!userAddress}
        >
          Display address
        </Button>
        <Button
          onClick={() => setOption(ReceiveCryptoOption.ShowQrCode)}
          className={'flex-row-center w-full md:w-1/2 justify-center'}
        >
          <QrCodeOutlinedIcon className={'h-5 w-5'} />
          Display QR Code
        </Button>
      </div>
      <div className={'flex flex-col items-center'}>
        {userAddress && (
          <DefaultTransition isOpen={option !== undefined}>
            <div className={'mt-2'}>
              {option === ReceiveCryptoOption.ShowQrCode && (
                <QRCode value={userAddress} size={256} />
              )}
              {option === ReceiveCryptoOption.ShowAddress && (
                <div
                  onClick={copyToClipboard}
                  className={
                    'text-center w-full text-body-smaller sm:text-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition rounded-2xl py-4 px-2 flex-row-center'
                  }
                >
                  <span>{userAddress}</span>
                  <span className={'ml-2 mb-1'}>
                    {addressCopied ? (
                      <AssignmentTurnedInOutlined className={'h-5 w-5 text-color-light'} />
                    ) : (
                      <ContentCopyOutlined
                        className={'h-5 w-5 text-color-light transition hover:text-gray-400'}
                      />
                    )}
                  </span>
                </div>
              )}
            </div>
          </DefaultTransition>
        )}
      </div>
    </div>
  );
}
