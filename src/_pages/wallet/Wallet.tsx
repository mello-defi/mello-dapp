import { AppState } from '_redux/store';
import { useSelector } from 'react-redux';
import { TokenDefinition } from '_enums/tokens';
import { useEffect, useState } from 'react';
import { Button } from '_components/core/Buttons';
import { InboxInIcon, PaperAirplaneIcon } from '@heroicons/react/solid';
import { DefaultTransition } from '_components/core/Transition';
import WalletBalance from '_pages/wallet/WalletBalance';
import Receive from '_pages/wallet/Receive';
import Send from '_pages/wallet/Send';
import { ethers } from 'ethers';

export enum WalletPageTab {
  RECEIVE = 'Receive',
  SEND = 'Send'
}

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
      <div className={'rounded-2xl bg-gray-50 p-2'}>
        {Object.values(tokenSet).map((token: TokenDefinition) => (
          <WalletBalance key={token.symbol} token={token} />
        ))}
      </div>
      <div
        className={
          'flex flex-col my-2 md:flex-row space-x-0 md:space-x-2 space-y-2 md:space-y-0 items-center'
        }
      >
        <Button className={'w-1/2 flex flex-row justify-center'} onClick={handleSend}>
          <PaperAirplaneIcon className={'mr-2 h-5 w-5'} />
          Send
        </Button>
        <Button className={'w-1/2 flex flex-row justify-center'} onClick={handleReceive}>
          <InboxInIcon className={'mr-2 h-5 w-5'} />
          Receive
        </Button>
      </div>
      <DefaultTransition isOpen={walletPageTab !== undefined}>
        <div>
          {walletPageTab === WalletPageTab.RECEIVE && <Receive />}
          {walletPageTab === WalletPageTab.SEND && <Send />}
        </div>
      </DefaultTransition>
    </div>
  );
}
