import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useState } from 'react';
import { Button } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import QrCodeOutlinedIcon from '@mui/icons-material/QrCodeOutlined';
import QRCode from 'react-qr-code';

export default function ReceiveCrypto() {
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const [addressCopied, setAddressCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const copyToClipboard = async () => {
    if (userAddress) {
      await navigator.clipboard.writeText(userAddress);
      setAddressCopied(true);
    }
  };

  const toggleShowQrCode = () => {
    setShowQrCode(!showQrCode);
  };

  return (
    <div className={''}>
      {/*<div className={""}*/}
      <div
        className={
          'flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 space-x-0 md:space-x-2'
        }
      >
        <Button className={'w-full md:w-1/2'} onClick={copyToClipboard} disabled={!userAddress}>
          Display address
        </Button>
        <Button
          onClick={toggleShowQrCode}
          className={'flex-row-center w-full md:w-1/2 justify-center'}
        >
          <QrCodeOutlinedIcon className={'h-5 w-5'} />
          Display QR Code
        </Button>
      </div>
      <div className={'flex flex-col items-center'}>
        {userAddress && (
          <DefaultTransition isOpen={showQrCode}>
            <div className={'mt-2'}>
              <QRCode value={userAddress} size={256} />
            </div>
          </DefaultTransition>
        )}
      </div>
    </div>
  );
}
