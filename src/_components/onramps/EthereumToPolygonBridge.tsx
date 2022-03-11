import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect, useState } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import { CryptoCurrencySymbol } from '_enums/currency';
import { EthereumTestnetGoerliContracts, ethereumTokens } from '_enums/tokens';
import { EVMChainIdNumerical } from '_enums/networks';
import { ethers } from 'ethers';
import { Button } from '_components/core/Buttons';
import PoweredByLink from '_components/core/PoweredByLink';
import { hyphenLogo } from '_assets/images';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
// @ts-ignore
import { Hyphen, RESPONSE_CODES, SIGNATURE_TYPES } from '@biconomy/hyphen';
import useMarketPrices from '_hooks/useMarketPrices';
import { formatTokenValueInFiat } from '_services/priceService';
import { decimalPlacesAreValid } from '_utils/index';
import { getGasPrice } from '_services/gasService';

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
  const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const network = useSelector((state: AppState) => state.web3.network);
  // const token = PolygonTestnetMumbaiTokenContracts.
  const token = ethereumTokens.eth;

  // const tokenSet = use
  const [transferAmount, setTransferAmount] = useState<string>('0.0');
  const [depositAddress, setDepositAddress] = useState<string | undefined>(undefined);
  const [ethereumPrice, setEthereumPrice] = useState<MarketDataResult | undefined>();
  const [transactionError, setTransactionError] = useState<string>('');
  const [biconomyIninitialized, setBiconomyInitialized] = useState<boolean>(false);
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
      const gasPrice = await getGasPrice(network.gasStationUrl);
      const tx = await provider.getTransaction(data.exitHash);
      await tx.wait(gasPrice?.blockTime || 3);
      setPolygonTransferComplete(true);
    }
  };

  let hyphen: Hyphen;
  if (provider) {
    hyphen = new Hyphen(provider, {
      debug: true, // If 'true', it prints debug logs on console window
      environment: 'test', // It can be "test" or "prod"
      onFundsTransfered
    });
  }

  // const [hyphen, setHyphen] = useState<Hyphen | null>(null);
  // REVIEW - whole file needs big cleaunp
  useEffect(() => {
    console.log('initTransfer');
    console.log(provider);
    async function initTransfer() {
      if (provider && userAddress && !biconomyIninitialized) {
        await hyphen.init();
        setBiconomyInitialized(true);
        // const amount = '0.001';
        const preTransferStatus: BiconomyPreTransferStatus = await hyphen.preDepositStatus({
          tokenAddress: token.address, // Token address on fromChain which needs to be transferred
          amount: ethers.utils.parseUnits(transferAmount, token.decimals).toString(), // Amount of tokens to be transferred in smallest unit eg wei
          fromChainId: EVMChainIdNumerical.ETHEREUM_TESTNET_GOERLI, // Chain id from where tokens needs to be transferred
          toChainId: EVMChainIdNumerical.POLYGON_TESTNET_MUMBAI, // Chain id where tokens are supposed to be sent
          userAddress: userAddress // User wallet address who want's to do the transfer
        });

        console.log('preTransferStatus', preTransferStatus);

        if (preTransferStatus.code === RESPONSE_CODES.OK) {
          // ✅ ALL CHECKS PASSED. Proceed to do deposit transaction

          setDepositAddress(preTransferStatus.depositContract);
        } else if (preTransferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {
          // ❌ Not enough apporval from user address on LiquidityPoolManager contract on fromChain
          const approveTx = await hyphen.approveERC20(
            token.address,
            preTransferStatus.depositContract,
            transferAmount
          );

          const gasPrice = await getGasPrice(network.gasStationUrl);
          // ⏱Wait for transaction to confirm, pass number of blocks to wait as param
          await approveTx.wait(gasPrice?.blockTime || 3);

          // NOTE: Whenever there is a transaction done via SDK, all responses
          // will be ethers.js compatible with an async wait() function that
          // can be called with 'await' to wait for transaction confirmation.

          // 🆗Now proceed to do the deposit transaction
        } else if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_NETWORK) {
          // ❌ Target chain id is not supported yet
        } else if (preTransferStatus.code === RESPONSE_CODES.NO_LIQUIDITY) {
          // ❌ No liquidity available on target chain for given tokenn
        } else if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN) {
          // ❌ Requested token is not supported on fromChain yet
        } else {
          // ❌ Any other unexpected error
        }
      }
    }
    initTransfer();
  }, [provider, userAddress]);

  const deposit = async () => {
    if (provider) {
      setIsTransferring(true);
      const etherVal = ethers.utils.parseEther(transferAmount.toString());
      const weiAmount = ethers.utils.formatUnits(etherVal, 'wei');
      // console.log(ethers.utils.formatUnits(etherVal, 'gwei'))
      // console.log(ethers.utils.formatUnits(etherVal, 'wei'))
      const depositTx: BiconomyDepositResponse = await hyphen.deposit({
        sender: userAddress,
        receiver: userAddress,
        tokenAddress: EthereumTestnetGoerliContracts.ETH,
        depositContractAddress: depositAddress,
        amount: weiAmount,
        fromChainId: EVMChainIdNumerical.ETHEREUM_TESTNET_GOERLI, // chainId of fromChain
        toChainId: EVMChainIdNumerical.POLYGON_TESTNET_MUMBAI // chainId of toChain
      });
      setEthereumTransactionHash(depositTx.hash);
      const gasPrice = await getGasPrice(network.gasStationUrl);
      console.log('DEPOSIT Tx', depositTx);
      await depositTx.wait(gasPrice?.blockTime || 3);
      setEthereumTransactionComplete(true);
    }
  };

  const handleTransferAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (token && value && !decimalPlacesAreValid(value, token.decimals)) {
      value = value.substring(0, value.length - 1);
    }
    if (parseFloat(value) < 0) {
      value = '0.0';
    }
    setTransferAmount(value);
  };

  return (
    <div>
      {depositAddress && (
        <div className={'flex flex-col'}>
          <div className={'flex-row-center justify-between'}>
            <span className={'text-body'}>Bridge ETH</span>
            <PoweredByLink url={'https://hyphen.biconomy.io/'} logo={hyphenLogo} isRound={false} />
          </div>
          <div
            className={
              'rounded-2xl bg-gray-100 transition border-2 py-2 border-gray-50 bg-gray-50 px-2 sm:px-4 flex flex-row items-center justify-between hover:border-gray-100 transition mt-2'
            }
          >
            <div className={'w-4/5'}>
              <input
                disabled={isTransferring}
                onWheel={() => false}
                type={'number'}
                min={'0'}
                className={`text-2xl sm:text-3xl bg-gray-100 focus:outline-none px-2 sm:px-0 sm:mt-0 py-1 sm:py-0 w-full ${
                  isTransferring ? 'text-gray-400' : 'text-color-dark'
                }`}
                value={transferAmount}
                onChange={handleTransferAmountChange}
              />
            </div>
            <div className={'text-color-light w-1/5 text-md'}>
              {ethereumPrice ? (
                <div className={'text-right'}>
                  {formatTokenValueInFiat(ethereumPrice.current_price, transferAmount)}
                </div>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          </div>
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
    </div>
  );
}
