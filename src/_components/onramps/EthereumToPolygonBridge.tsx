import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect, useState } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import { CryptoCurrencySymbol } from '_enums/currency';
import { ethereumTokens } from '_enums/tokens';
import { EVMChainIdNumerical } from '_enums/networks';
import { ethers } from 'ethers';
import { Button } from '_components/core/Buttons';
import PoweredByLink from '_components/core/PoweredByLink';
import { hyphenLogo } from '_assets/images';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
// @ts-ignore
import { Hyphen, RESPONSE_CODES } from '@biconomy/hyphen';
import useMarketPrices from '_hooks/useMarketPrices';
import { getGasPrice } from '_services/gasService';
import { logTransaction } from '_services/dbService';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { formatUnits } from 'ethers/lib/utils';
import { BiconomyActions, GenericActions, TransactionServices } from '_enums/db';

interface BiconomyPreTransferStatus {
  code: number;
  depositContract: string;
  message: string;
  responseCode: number;
}

interface BiconomyDepositResponse {
  hash: string;
  wait: (confirmations: number) => Promise<void>;
}

interface BiconomyFundsTransferedResponse {
  amount: string;
  code: number;
  depositHash: string;
  exitHash: string;
  fromChainId: number;
  message: string;
  statusCode: number;
  toChainId: number;
  tokenAddress: string;
}

export default function EthereumToPolygonBridge() {
  const { provider, network } = useSelector((state: AppState) => state.web3);

  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const ethereumTokenDefinition = ethereumTokens.eth;
  const [transferAmount, setTransferAmount] = useState<string>('0.0');
  const [depositAddress, setDepositAddress] = useState<string | undefined>(undefined);
  const [ethereumPrice, setEthereumPrice] = useState<MarketDataResult | undefined>();
  const [transactionError, setTransactionError] = useState<string>('');
  const [biconomyInitialized, setBiconomyInitialized] = useState<boolean>(false);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [ethereumTransactionComplete, setEthereumTransactionComplete] = useState<boolean>(false);
  const [ethereumTransactionHash, setEthereumTransactionHash] = useState<string>('');
  const [polygonTransactionHash, setPolygonTransactionHash] = useState<string>('');
  const [polygonTransferComplete, setPolygonTransferComplete] = useState<boolean>(false);
  const marketPrices = useMarketPrices();
  useEffect(() => {
    if (marketPrices) {
      const eth = marketPrices.find(
        (item: MarketDataResult) =>
          item.symbol.toLowerCase() === CryptoCurrencySymbol.ETH.toLowerCase()
      );
      if (eth) {
        setEthereumPrice(eth);
      }
    }
  }, [marketPrices]);

  const onFundsTransfered = async (data: BiconomyFundsTransferedResponse) => {
    console.log('FUNDS TRANSFERRED', data);
    setPolygonTransactionHash(data.exitHash);
    if (provider) {
      const tx = await provider.getTransaction(data.exitHash);
      logTransaction(tx.hash, network.chainId, TransactionServices.Biconomy, BiconomyActions.Mint);
      await tx.wait(3);
      setPolygonTransferComplete(true);
    }
  };

  let hyphen: Hyphen;
  if (provider) {
    hyphen = new Hyphen(provider, {
      // debug: true, // If 'true', it prints debug logs on console window
      environment: 'prod', // It can be "test" or "prod"
      onFundsTransfered
    });
  }

  useEffect(() => {
    async function initTransfer() {
      if (provider && userAddress && !biconomyInitialized) {
        await hyphen.init();
        setBiconomyInitialized(true);
        const preTransferStatus: BiconomyPreTransferStatus = await hyphen.preDepositStatus({
          tokenAddress: ethereumTokenDefinition.address,
          amount: ethers.utils
            .parseUnits(transferAmount, ethereumTokenDefinition.decimals)
            .toString(),
          fromChainId: EVMChainIdNumerical.ETHEREUM_MAINNET,
          toChainId: EVMChainIdNumerical.POLYGON_MAINNET,
          userAddress
        });

        if (preTransferStatus.code === RESPONSE_CODES.OK) {
          setDepositAddress(preTransferStatus.depositContract);
        } else if (preTransferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {
          const approveTx = await hyphen.approveERC20(
            ethereumTokenDefinition.address,
            preTransferStatus.depositContract,
            transferAmount
          );
          // const gasPrice = await getGasPrice(network.gasStationUrl);
          await approveTx.wait(3);
          logTransaction(
            approveTx.hash,
            network.chainId,
            TransactionServices.Biconomy,
            GenericActions.Approve,
            transferAmount,
            ethereumTokenDefinition.symbol
          );
        } else if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_NETWORK) {
          setTransactionError('Target chain is not supported yet');
        } else if (preTransferStatus.code === RESPONSE_CODES.NO_LIQUIDITY) {
          setTransactionError('No liquidity on target chain');
        } else if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN) {
          setTransactionError('Token is not supported on target chain');
        }
      }
    }
    initTransfer();
  }, [provider, userAddress]);

  const deposit = async () => {
    if (provider) {
      setIsTransferring(true);
      const etherVal = ethers.utils.parseEther(transferAmount.toString());
      const weiAmount = formatUnits(etherVal, 'wei');
      try {
        const depositTx: BiconomyDepositResponse = await hyphen.deposit({
          sender: userAddress,
          receiver: userAddress,
          tokenAddress: ethereumTokenDefinition.address,
          depositContractAddress: depositAddress,
          amount: weiAmount,
          fromChainId: EVMChainIdNumerical.ETHEREUM_MAINNET, // chainId of fromChain
          toChainId: EVMChainIdNumerical.POLYGON_MAINNET // chainId of toChain
        });
        setEthereumTransactionHash(depositTx.hash);
        // const gasPrice = await getGasPrice(network.gasStationUrl);
        await depositTx.wait(3);
        logTransaction(
          depositTx.hash,
          EVMChainIdNumerical.ETHEREUM_MAINNET,
          TransactionServices.Biconomy,
          BiconomyActions.Deposit,
          weiAmount,
          ethereumTokenDefinition.symbol
        );
        setEthereumTransactionComplete(true);
      } catch (e: any) {
        console.error(e);
        setTransactionError(e.message);
      }
    }
  };

  return (
    <div>
      {network.chainId !== EVMChainIdNumerical.ETHEREUM_MAINNET ? (
        <span className={'text-header'}>
          Please switch to Ethereum mainnet and refresh the page
        </span>
      ) : (
        <>
          {depositAddress && (
            <div className={'flex flex-col'}>
              <div className={'flex-row-center justify-between'}>
                <span className={'text-body'}>Bridge ETH</span>
                <PoweredByLink
                  url={'https://hyphen.biconomy.io/'}
                  logo={hyphenLogo}
                  isRound={false}
                />
              </div>
              <SingleCryptoAmountInput
                disabled={isTransferring}
                amount={transferAmount}
                amountChanged={setTransferAmount}
                token={ethereumTokenDefinition}
              />
              <Button className={'mt-4'} onClick={deposit} disabled={isTransferring}>
                Deposit
              </Button>
              {(isTransferring || polygonTransferComplete) && (
                <>
                  <TransactionStep
                    show={true}
                    transactionError={transactionError}
                    stepComplete={depositAddress !== ''}
                  >
                    Deposit address generated
                  </TransactionStep>
                  <TransactionStep
                    show={depositAddress !== ''}
                    requiresUserInput={true}
                    transactionError={transactionError}
                    stepComplete={!!transferAmount && parseFloat(transferAmount) > 0}
                  >
                    Transfer amount set
                  </TransactionStep>
                  <TransactionStep
                    show={isTransferring}
                    transactionError={transactionError}
                    stepComplete={ethereumTransactionComplete}
                  >
                    Ethereum transaction complete
                    <BlockExplorerLink transactionHash={ethereumTransactionHash} />
                  </TransactionStep>
                  <TransactionStep
                    showTransition={false}
                    show={ethereumTransactionComplete}
                    transactionError={transactionError}
                    stepComplete={polygonTransferComplete}
                  >
                    Polygon transaction complete
                    <BlockExplorerLink transactionHash={polygonTransactionHash} />
                  </TransactionStep>
                  <TransactionError transactionError={transactionError} />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
