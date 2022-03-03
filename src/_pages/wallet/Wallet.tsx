import { AppState } from '_redux/store';
import { useSelector } from 'react-redux';
import { TokenDefinition } from '_enums/tokens';
import { useEffect, useState } from 'react';
import { Button } from '_components/core/Buttons';
import { InboxInIcon, PaperAirplaneIcon } from '@heroicons/react/solid';
import { DefaultTransition } from '_components/core/Transition';
import WalletBalance from '_pages/wallet/WalletBalance';
import ReceiveCrypto from '_pages/wallet/ReceiveCrypto';
import SendCrypto from '_pages/wallet/SendCrypto';

export enum WalletPageTab {
  RECEIVE = 'Receive',
  SEND = 'Send'
}

const WalletActionButton = ({
  icon,
  text,
  walletPageTab,
  selectedWalletPageTab,
  onClick
}: {
  icon: any;
  text: string;
  walletPageTab: WalletPageTab;
  selectedWalletPageTab?: WalletPageTab;
  onClick: (tab: WalletPageTab) => void;
}) => {
  return (
    <Button
      className={`w-1/2 flex flex-row justify-center ${
        selectedWalletPageTab === walletPageTab ? 'opacity-50' : ''
      }`}
      onClick={() => onClick(walletPageTab)}
    >
      {icon}
      {text}
    </Button>
  );
};

export default function Wallet() {
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const [walletPageTab, setWalletPageTab] = useState<WalletPageTab | undefined>();

  const handleSend = () => {
    setWalletPageTab(WalletPageTab.SEND);
    // setSendVisible(true);
  };

  const handleReceive = () => {
    setWalletPageTab(WalletPageTab.RECEIVE);
    // setReceiveVisible(true);
  };

  return (
    <div className={'flex flex-col'}>
      <div
        className={
          'flex flex-col my-2 md:flex-row space-x-0 md:space-x-2 space-y-2 md:space-y-0 items-center'
        }
      >
        <WalletActionButton
          icon={<PaperAirplaneIcon className={'mr-2 h-5 w-5'} />}
          text={'Send'}
          walletPageTab={WalletPageTab.SEND}
          selectedWalletPageTab={walletPageTab}
          onClick={setWalletPageTab}
        />
        <WalletActionButton
          icon={<InboxInIcon className={'mr-2 h-5 w-5'} />}
          text={'Receive'}
          walletPageTab={WalletPageTab.RECEIVE}
          selectedWalletPageTab={walletPageTab}
          onClick={setWalletPageTab}
        />
      </div>
      <DefaultTransition isOpen={walletPageTab !== undefined}>
        <div>
          {walletPageTab === WalletPageTab.RECEIVE && <ReceiveCrypto />}
          {walletPageTab === WalletPageTab.SEND && <SendCrypto />}
        </div>
      </DefaultTransition>
      <div className={'rounded-2xl bg-gray-50 p-2'}>
        {Object.values(tokenSet).map((token: TokenDefinition) => (
          <WalletBalance key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  );
}
