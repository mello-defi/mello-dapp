import { AppState } from '_redux/store';
import { useSelector } from 'react-redux';
import { TokenDefinition } from '_enums/tokens';
import { useEffect, useState } from 'react';
import { Button } from '_components/core/Buttons';
import {
  ClipboardCheckIcon,
  InboxInIcon,
  PaperAirplaneIcon,
  QrcodeIcon
} from '@heroicons/react/solid';
import { DefaultTransition } from '_components/core/Transition';
import { ClipboardCopyIcon } from '@heroicons/react/outline';
import QRCode from 'react-qr-code';
import useMarketPrices from '_hooks/useMarketPrices';
import useWalletBalance from '_hooks/useWalletBalance';
import { formatTokenValueInFiat } from '_services/priceService';
import { getMarketDataForSymbol } from '_services/aaveService';
import { Market } from '@aave/protocol-js';
import { MarketDataResult } from '_services/marketDataService';

interface TokenBalance {
  token: TokenDefinition;
  balance: string;
  balanceInFiat: string;
  // change24Hr: string;
}

export function CopyableText({
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

function Receive() {
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

function Send() {
  return (
    <div>
      <span className={'text-title'}>How much do you want to send?</span>
      {/*<Input*/}
    </div>
  );
}

export enum WalletPageTab {
  RECEIVE = 'Receive',
  SEND = 'Send'
}

function WalletBalance({ token }: { token: TokenDefinition }) {
  const userBalance = useWalletBalance(token);
  const marketPrices = useMarketPrices();
  const [attemptedToGetMarketData, setAttemptedToGetMarketData] = useState(false);
  const [marketData, setMarketData] = useState<MarketDataResult | null>(null);
  useEffect(() => {
    if (!attemptedToGetMarketData) {
      try {
        const data = getMarketDataForSymbol(marketPrices, token.symbol);
        setMarketData(data);
        setAttemptedToGetMarketData(true);
      } catch (e: any) {
        console.log(e);
      }
    }
  }, [attemptedToGetMarketData]);
  return (
    <>
      {marketData && parseFloat(userBalance) > 0 && (
        <div className={'flex-row-center justify-between my-2 space-y-4 px-2'} key={token.symbol}>
          <div className={'flex-row-center space-y-1'}>
            <img src={token.image} className={'w-10 h-10 rounded-full'} alt={token.symbol} />
            <div className={'flex flex-col ml-3'}>
              <span>{token.name}</span>
              <span className={'text-gray-500'}>{userBalance} {token.symbol}</span>
            </div>
          </div>
          <div className={'flex flex-col items-end space-y-1'}>
            <span>{formatTokenValueInFiat(marketData.current_price, userBalance)}</span>
            {/*<span className={'text-gray-500'}>{marketData.price_change_percentage_24h.toFixed(2)}%</span>*/}
            <span className={'text-gray-500'}>{' '}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default function Wallet() {
  const userAddress = useSelector((state: AppState) => state.web3.userAddress);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const walletBalances = useSelector((state: AppState) => state.wallet.balances);
  // const balances = useSelector((state: AppState) => state.wallet.balances);
  // const tokenSet = useSelector((state: AppState) => state.web3.tokenSet);
  const marketPrices = useMarketPrices();
  // const [balances, setBalances] = useState<TokenBalance[] | undefined>();
  const [walletPageTab, setWalletPageTab] = useState<WalletPageTab | undefined>();

  useEffect(() => {
    if (provider && userAddress && marketPrices) {
      // (async () => {
      //   const tempBalances: TokenBalance[] = [];
      //   for (const token of Object.values(tokenSet)) {
      //     // const balance = await getErc20TokenBalance(token, provider, userAddress, 6);
      //     const data = marketData.find(
      //       (m: MarketDataResult) => m.symbol.toLocaleLowerCase() === token.symbol.toLowerCase()
      //     );
      //     if (data) {
      //       // const balanceInFiat = formatTokenValueInFiat(data.current_price, balance);
      //       // const percentagePrefix = `${data.price_change_percentage_24h < 0 ? '' : '+'}`;
      //       // tempBalances.push({
      //       //   token,
      //       //   balance,
      //       //   balanceInFiat,
      //       //   // change24Hr: `${percentagePrefix}${data.price_change_percentage_24h.toPrecision(2)}`
      //       // });
      //     }
      //   }
      // // setBalances(tempBalances);
      // })();
    }
  });
  useEffect(() => {
    // if (walletBalances[])
  }, [walletBalances]);

  // useEffect(() => {
  //   if (token) {
  //     const tokenBalance = walletBalances[token.symbol];
  //     if (tokenBalance) {
  //       setUserBalance(tokenBalance);
  //     }
  //   }
  // }, [walletBalances])
  //
  // const getUserBalance = () => {
  //   if (token && provider) {
  //     dispatch(getBalanceForToken(token, provider, userAddress));
  //   }
  // }

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

      {/*{balances?.map((balance) => (*/}
      {/*))}*/}
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
