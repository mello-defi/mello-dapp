import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bitcoin, BtcDeposit, BtcTransaction, Polygon } from '@renproject/chains';
import { AppState } from '_redux/store';
import { renJS } from '_services/renService';
import { EthProvider } from '@renproject/chains-ethereum/build/main/types';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import PoweredByLink from '_components/core/PoweredByLink';
import { renLogo } from '_assets/images';
import CopyableText from '_components/core/CopyableText';
import { getGasPrice } from '_services/gasService';
import { logTransactionHash } from '_services/dbService';
import { EvmTokenDefinition, nativeBitcoin } from '_enums/tokens';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { MarketDataResult } from '_services/marketDataService';
import { CryptoCurrencySymbol } from '_enums/currency';
import useMarketPrices from '_hooks/useMarketPrices';
import { ethers } from 'ethers';
import { LockAndMintDeposit } from '@renproject/ren';

function RenBridge() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const network = useSelector((state: AppState) => state.web3.network);
  const bitcoinTokenDefinition = nativeBitcoin;
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const [amount, setAmount] = useState<string>('0.0');
  const [gatewayAddress, setGatewayAddress] = useState('');
  const [tokensMinted, setTokensMinted] = useState(false);
  const [depositedAmount, setDepositedAmount] = useState('string');
  const [transactionError, setTransactionError] = useState('');
  const [transactionExplorerLink, setTransactionExplorerLink] = useState('');
  const [numberOfConfirmedTransactions, setNumberOfConfirmedTransactions] = useState(0);
  const [transactionConfirmationTarget, setTransactionConfirmationTarget] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');
  const marketPrices = useMarketPrices();
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const [deposit, setDeposit] = useState<LockAndMintDeposit<BtcTransaction, BtcDeposit, string, any, any>>();
  useEffect(() => {
    if (marketPrices) {
      const btc = marketPrices.find(
        (item: MarketDataResult) =>
          item.symbol.toLowerCase() === CryptoCurrencySymbol.BTC.toLowerCase()
      );
      if (btc) {
        setBitcoinPrice(btc.current_price);
      }
    }
  }, [marketPrices]);


  const onConfirmation = (confirmations: number, target: number) => {
    setNumberOfConfirmedTransactions(confirmations > target ? target : confirmations);
  };

  const onConfirmationTarget = async (target: number) => {
    if (deposit) {
      const link = Bitcoin.utils.transactionExplorerLink(
        deposit.depositDetails.transaction,
        'testnet'
      );
      const confirmations = await deposit.confirmations();
      setNumberOfConfirmedTransactions(
        confirmations.current > target ? target : confirmations.current
      );
      setTransactionConfirmationTarget(target);
      if (link) {
        setTransactionExplorerLink(link);
      }
    }
  };


  const onMint = async (txHash: string) => {
    if (provider) {
      logTransactionHash(txHash, network.chainId);
      setTransactionHash(txHash);
      const gasPrice = await getGasPrice(network.gasStationUrl);
      const tx = await provider.getTransaction(txHash);
      await tx.wait(gasPrice?.blockTime || 3);
      setTokensMinted(true);
    }
  }

  const onError = (e: any) => {
    setTransactionError(e.message);
  }

  const initialiseDeposit = async () => {
    if (provider && signer) {
      const web3Provider: EthProvider = {
        signer,
        provider
      };
      const mint = await renJS.lockAndMint({
        asset: 'BTC',
        from: Bitcoin(),
        to: Polygon(web3Provider, 'testnet').Account({
          address: userAddress
        })
      });
      if (mint.gatewayAddress) {
        setGatewayAddress(mint.gatewayAddress);
      }
      mint.on('deposit', async (deposit:LockAndMintDeposit<BtcTransaction, BtcDeposit, string, any, any>) => {
        setDeposit(deposit);
        setDepositedAmount(deposit.depositDetails.amount);
        await deposit
          .confirmed()
          .on('target', onConfirmationTarget)
          .on('confirmation', onConfirmation)
          .catch(onError);

        await deposit
          .signed()
          .catch(onError);

        await deposit
          .mint()
          .on('transactionHash', onMint)
          .catch(onError);
      });
    }
  };

  useEffect(() => {
    if (userAddress && provider && !gatewayAddress) {
      initialiseDeposit();
    }
  });


  return (
    <>
      <div className="rounded-2xl flex flex-col">
        {network.name}
        <div className={'flex flex-row items-center justify-end'}>
          <PoweredByLink url={'https://bridge.renproject.io/'} logo={renLogo} />
        </div>
        <SingleCryptoAmountInput disabled={transactionExplorerLink !== ''} tokenPrice={bitcoinPrice} amount={amount} amountChanged={setAmount} token={bitcoinTokenDefinition}/>
        {gatewayAddress && (
          <span className={'text-body-smaller'}>
            <span>Send {amount} BTC to this address</span>
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
          Bitcoin deposited {depositedAmount && parseFloat(depositedAmount) > 0 ? `(${ethers.utils.formatUnits(depositedAmount, bitcoinTokenDefinition.decimals)} BTC)` : ''}
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
          {tokensMinted ? 'Tokens minted' : 'Minting tokens'}
          <BlockExplorerLink transactionHash={transactionHash} />
        </TransactionStep>
        <TransactionError transactionError={transactionError} />
      </div>
    </>
  );
}

export default RenBridge;
