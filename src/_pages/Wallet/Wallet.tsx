import { AppState } from '_redux/store';
import { useSelector } from 'react-redux';
import { EvmTokenDefinition } from '_enums/tokens';
import React, { useEffect, useState } from 'react';
import { Button } from '_components/core/Buttons';
import { DefaultTransition } from '_components/core/Transition';
import WalletBalance from '_pages/Wallet/WalletBalance';
import ReceiveCrypto from '_pages/Wallet/ReceiveCrypto';
import SendCrypto from '_pages/Wallet/SendCrypto';
import { MoveToInbox, Send } from '@mui/icons-material';
import useWalletBalances from '_hooks/useWalletBalances';
import { WalletTokenBalances } from '_redux/types/walletTypes';

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
      className={`w-full md:w-1/2 flex flex-row justify-center ${
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
  const walletBalances = useWalletBalances();
  const [sortedBalances, setSortedBalances] = useState<WalletTokenBalances>();

  useEffect(() => {
    // walletBalances.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
  }, [walletBalances]);
  const handleWalletPageTabClick = (tab: WalletPageTab) => {
    if (tab === walletPageTab) {
      setWalletPageTab(undefined);
    } else {
      setWalletPageTab(tab);
    }
  };
  return (
    <div className={'flex flex-col'}>
      <span className={'text-header'}>Wallet</span>
      <div
        className={
          'flex flex-col my-2 md:flex-row space-x-0 md:space-x-2 space-y-2 md:space-y-0 items-center'
        }
      >
        <WalletActionButton
          icon={<Send className={'mr-2 h-5 w-5'} />}
          text={'Send'}
          walletPageTab={WalletPageTab.SEND}
          selectedWalletPageTab={walletPageTab}
          onClick={handleWalletPageTabClick}
        />
        <WalletActionButton
          icon={<MoveToInbox className={'mr-2 h-5 w-5'} />}
          text={'Receive'}
          walletPageTab={WalletPageTab.RECEIVE}
          selectedWalletPageTab={walletPageTab}
          onClick={handleWalletPageTabClick}
        />
      </div>
      <DefaultTransition isOpen={walletPageTab !== undefined}>
        <div>
          {walletPageTab === WalletPageTab.RECEIVE && <ReceiveCrypto />}
          {walletPageTab === WalletPageTab.SEND && <SendCrypto />}
        </div>
      </DefaultTransition>
      <div className={'rounded-2xl bg-gray-50 py-2'}>
        {Object.values(tokenSet).map((token: EvmTokenDefinition) => (
          <WalletBalance key={token.symbol} token={token} hideZeroBalance={false} />
        ))}
      </div>
    </div>
  );
}
