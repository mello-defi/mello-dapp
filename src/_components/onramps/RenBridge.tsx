import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bitcoin, EthereumConfigMap, Polygon, PolygonConfigMap } from '@renproject/chains';
import { AppState } from '_redux/store';
import { renJS } from '_services/renService';
import { EthProvider } from '@renproject/chains-ethereum/build/main/types';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import PoweredByLink from '_components/core/PoweredByLink';
import { renLogo } from '_assets/images';
import CopyableText from '_components/core/CopyableText';
import { logTransactionHash } from '_services/dbService';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import useMarketPrices from '_hooks/useMarketPrices';
import { MarketDataResult } from '_services/marketDataService';
import { CryptoCurrencySymbol } from '_enums/currency';
import { nativeBitcoin, PolygonMainnetTokenContracts } from '_enums/tokens';

function RenBridge() {
  const { provider, network, signer } = useSelector((state: AppState) => state.web3);

  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const [message, setMessage] = useState('');
  const [gatewayAddress, setGatewayAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState<string>('0.0');
  const [tokensMinted, setTokensMinted] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactionError, setTransactionError] = useState('');
  const [transactionExplorerLink, setTransactionExplorerLink] = useState('');
  const [numberOfConfirmedTransactions, setNumberOfConfirmedTransactions] = useState(0);
  const [transactionConfirmationTarget, setTransactionConfirmationTarget] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [btcPrice, setBtcPrice] = useState<MarketDataResult | undefined>();
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  const marketPrices = useMarketPrices();
  useEffect(() => {
    if (marketPrices) {
      const btc = marketPrices.find(
        (item: MarketDataResult) =>
          item.symbol.toLowerCase() === CryptoCurrencySymbol.ETH.toLowerCase()
      );
      if (btc) {
        setBtcPrice(btc);
      }
    }
  }, [marketPrices]);

  // TODO needs huge cleanup
  const deposit = async () => {
    // @ts-ignore
    // console.log('userAddress', userAddress);
    // logError(""); // Reset error
    // log(`Generating Deposit address...`);
    if (provider && signer && userAddress) {
      const web3Provider: EthProvider = {
        signer,
        provider
      };
      // const amount = 0.003; // BTC
      // 0x880Ad65DC5B3F33123382416351Eef98B4aAd7F1
      // await addTokenToWallet(mumbaiBtc, provider);
      const mint = await renJS.lockAndMint({
        // SendCrypto BTC from the Bitcoin blockchain to the Ethereum blockchain.
        asset: 'BTC',
        from: Bitcoin(),
        to: Polygon(web3Provider, PolygonConfigMap['mainnet']).Contract({
          contractFn: 'mint',
          sendTo: userAddress,
          txConfig: undefined,
          // Arguments expected for calling `mint`
          contractParams: [
            {
              name: '_token',
              type: 'address',
              value: PolygonMainnetTokenContracts.RENBTC
            },
            {
              name: '_slippage',
              type: 'uint256',
              // Max slippage is unused param since we're not swapping.
              value: 0
            },
            {
              name: '_to',
              type: 'address',
              value: userAddress
            }
          ]
        })
      });
      console.log('mint', mint);
      // @ts-ignore
      console.log(JSON.stringify(mint.deposits));

      // Show the gateway address to the user so that they can transfer their BTC to it.
      // log(`Deposit ${amount} BTC to ${mint.gatewayAddress}`);

      //  @ts-ignore
      setGatewayAddress(mint.gatewayAddress);
      mint.on('deposit', async (deposit) => {
        // Details of the Deposit are available from `Deposit.depositDetails`.

        const hash = deposit.txHash();
        console.log('hash', hash);
        console.log('DEPOSOT STATUS', deposit.status);
        setTransactionStatus(deposit.status);

        console.log('number of confs', await deposit.confirmations());
        // const depositLog = (msg: string) =>
        //   log(
        //     `BTC Deposit: ${Bitcoin.utils.transactionExplorerLink(
        //       Deposit.depositDetails.transaction,
        //       'testnet'
        //     )}\n
        //   RenVM Hash: ${hash}\n
        //   Status: ${Deposit.status}\n
        //   ${msg}`
        //   );

        await deposit
          .confirmed()
          .on('target', (target) => {
            console.log('IN TARGET');
            const link = Bitcoin.utils.transactionExplorerLink(
              deposit.depositDetails.transaction,
              'mainnet'
            );
            console.log('TARGET', target);
            deposit.confirmations().then((confirmations) => {
              setNumberOfConfirmedTransactions(
                confirmations.current > target ? target : confirmations.current
              );
            });
            setTransactionConfirmationTarget(target);
            if (link) {
              setTransactionExplorerLink(link);
            }
            // depositLog(`0/${target} confirmations`)
          })
          .on('confirmation', (confs, target) => {
            console.log('IN  CONFIRMATION');
            // const link = Bitcoin.utils.transactionExplorerLink(Deposit.depositDetails.transaction, 'testnet');
            console.log('CONFS', confs);
            console.log('TARGET', target);
            setNumberOfConfirmedTransactions(confs > target ? target : confs);
            // if (link) {
            //   setTransactionExplorerLink(link);
            // }
            // depositLog(`${confs}/${target} confirmations`)
          });

        await deposit
          .signed()
          .on('txHash', (txHash) => {
            console.log('IN SIGNED TX HASN');
            // depositLog(`Transaction hash: ${txHash}`);
          })
          .on('status', (a) => {
            console.log('IN SIGNED STATUS');
            console.log('A', a);
            setTransactionStatus(a);
            // depositLog(`Signed: ${a}`);
          })
          // Print RenVM status - "pending", "confirming" or "done".
          // .on('status', (status) => {
          //   // console.log('SIGNED STATUS', status);
          //   // depositLog(`Status: ${status}`)
          // })
          .catch((e) => {
            console.log('SIGNED ERRRO');
            console.error(e);
            setTransactionError(e.message);
          });
        await deposit
          .mint()
          // Print Ethereum transaction hash.
          .on('transactionHash', async (txHash) => {
            console.log('IN TRANSACTION HASH');
            console.log('TX HASH', txHash);
            logTransactionHash(txHash, network.chainId);
            setTransactionHash(txHash);
            const tx = await provider.getTransaction(txHash);
            await tx.wait(3);
            setTokensMinted(true);
          })
          .catch((e) => {
            logError('ERROR ON MINT ' + e.message);
            setTransactionError(e.message);
          });
        //
        // log(`Deposited ${amount} BTC.`);
      });
    }
  };

  useEffect(() => {
    if (userAddress && provider && !gatewayAddress) {
      deposit();
    }
  });

  const updateBalance = async () => {
    // const { web3 } = this.state;
    // const contract = new web3.eth.Contract(ABI, contractAddress);
    // const balance = await contract.methods.balance().call();
    // setBalance(parseInt(balance.toString()) / 10 ** 8);
  };

  const logError = (error: string) => {
    console.log('error', error);
    if (error && error != '') {
      // setError(error);
    }
    // this.setState({ error: String((error || {}).message || error) });
  };

  return (
    <>
      <div className="rounded-2xl flex flex-col">
        <div className={'flex flex-row items-center justify-end'}>
          <PoweredByLink url={'https://bridge.renproject.io/'} logo={renLogo} />
        </div>
        {btcPrice && (
          <SingleCryptoAmountInput
            disabled={isTransferring}
            tokenPrice={btcPrice.current_price}
            amount={transferAmount}
            amountChanged={setTransferAmount}
            token={nativeBitcoin}
          />
        )}

        {gatewayAddress && (
          <span className={'text-body-smaller'}>
            <span>Send your BTC to this address</span>
            <CopyableText text={gatewayAddress} />
          </span>
        )}
        <TransactionStep
          show={gatewayAddress !== ''}
          stepComplete={gatewayAddress !== ''}
          transactionError={transactionError}
        >
          Gateway created
        </TransactionStep>
        <TransactionStep
          show={gatewayAddress !== ''}
          stepComplete={transactionExplorerLink !== ''}
          transactionError={transactionError}
          requiresUserInput={true}
        >
          Bitcoin deposited
          {transactionExplorerLink && (
            <a
              target="_blank"
              href={transactionExplorerLink}
              className={
                'flex text-body-smaller px-2 py-1 ml-2 cursor-pointer rounded-full bg-gray-200'
              }
              rel="noreferrer"
            >
              View on explorer
            </a>
          )}
        </TransactionStep>
        <TransactionStep
          show={transactionExplorerLink !== ''}
          transactionError={transactionError}
          stepComplete={
            transactionConfirmationTarget > 0 &&
            numberOfConfirmedTransactions === transactionConfirmationTarget
          }
        >
          {numberOfConfirmedTransactions}/{transactionConfirmationTarget} confirmations
        </TransactionStep>
        <TransactionStep
          showTransition={false}
          show={
            transactionConfirmationTarget > 0 &&
            numberOfConfirmedTransactions === transactionConfirmationTarget
          }
          transactionError={transactionError}
          stepComplete={tokensMinted}
        >
          Tokens minted
          <BlockExplorerLink transactionHash={transactionHash} />
        </TransactionStep>
        <TransactionError transactionError={transactionError} />
        {/*<div className={'text-lg mt-2 font-bold'}>*/}
        {/*  {message.split('\n').map((line) => (*/}
        {/*    <p key={line}>{line}</p>*/}
        {/*  ))}*/}
        {/*</div>*/}
      </div>
    </>
  );
}

export default RenBridge;
