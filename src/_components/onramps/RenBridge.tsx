import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bitcoin, Polygon } from '@renproject/chains';
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

function RenBridge() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const network = useSelector((state: AppState) => state.web3.network);
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const [message, setMessage] = useState('');
  const [gatewayAddress, setGatewayAddress] = useState('');
  const [tokensMinted, setTokensMinted] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactionError, setTransactionError] = useState('');
  const [transactionExplorerLink, setTransactionExplorerLink] = useState('');
  const [numberOfConfirmedTransactions, setNumberOfConfirmedTransactions] = useState(0);
  const [transactionConfirmationTarget, setTransactionConfirmationTarget] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [transactionHash, setTransactionHash] = useState('');

  // REVIEW needs huge cleanup
  const deposit = async () => {
    // @ts-ignore
    // console.log('userAddress', userAddress);
    // logError(""); // Reset error
    // log(`Generating deposit address...`);
    if (provider && signer) {
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
        to: Polygon(web3Provider, 'testnet').Account({
          address: userAddress
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
        // Details of the deposit are available from `deposit.depositDetails`.

        const hash = deposit.txHash();
        console.log('hash', hash);
        console.log('DEPOSOT STATUS', deposit.status);
        setTransactionStatus(deposit.status);

        console.log('number of confs', await deposit.confirmations());
        // const depositLog = (msg: string) =>
        //   log(
        //     `BTC deposit: ${Bitcoin.utils.transactionExplorerLink(
        //       deposit.depositDetails.transaction,
        //       'testnet'
        //     )}\n
        //   RenVM Hash: ${hash}\n
        //   Status: ${deposit.status}\n
        //   ${msg}`
        //   );

        await deposit
          .confirmed()
          .on('target', (target) => {
            console.log('IN TARGET');
            const link = Bitcoin.utils.transactionExplorerLink(
              deposit.depositDetails.transaction,
              'testnet'
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
            // const link = Bitcoin.utils.transactionExplorerLink(deposit.depositDetails.transaction, 'testnet');
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
            console.log(e);
            setTransactionError(e.message);
          });
        await deposit
          .mint()
          // Print Ethereum transaction hash.
          .on('transactionHash', async (txHash) => {
            console.log('IN TRANSACTION HASH');
            console.log('TX HASH', txHash);
            setTransactionHash(txHash);
            const gasPrice = await getGasPrice(network.gasStationUrl);
            const tx = await provider.getTransaction(txHash);
            await tx.wait(gasPrice?.blockTime || 3);
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

  const log = (message: string) => {
    setMessage(message);
  };

  return (
    <>
      <div className="rounded-2xl flex flex-col">
        <div className={'flex flex-row items-center justify-end'}>
          <PoweredByLink url={'https://bridge.renproject.io/'} logo={renLogo} />
        </div>
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
        {/*<div*/}
        {/*  className={*/}
        {/*    'flex flex-row items-center justify-between bg-gray-200 px-2 py-4 my-2 rounded-2xl'*/}
        {/*  }*/}
        {/*>*/}
        {/*  <div>Transaction status</div>*/}
        {/*  <div>{transactionStatus}</div>*/}
        {/*</div>*/}
        <TransactionError transactionError={transactionError} />
        <div className={'text-lg mt-2 font-bold'}>
          {message.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </>
  );
}

export default RenBridge;
