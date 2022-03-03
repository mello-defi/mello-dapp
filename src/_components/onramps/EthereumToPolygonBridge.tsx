import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect } from 'react';
import { MarketDataResult } from '_services/marketDataService';
import { CryptoCurrencySymbol } from '_enums/currency';
import { EthereumTestnetGoerliContracts, ethereumTokens } from '_enums/tokens';
import { EVMChainIdNumerical } from '_enums/networks';
import { BigNumber, ethers } from 'ethers';
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
  const [transferAmount, setTransferAmount] = React.useState<string>('0');
  const [depositAddress, setDepositAddress] = React.useState<string | undefined>(undefined);
  const [ethereumPrice, setEthereumPrice] = React.useState<MarketDataResult | undefined>();
  const [transactionError, setTransactionError] = React.useState<string>('');
  const [ethereumTransactionRequested, setEthereumTransactionRequested] =
    React.useState<boolean>(false);
  const [ethereumTransactionSent, setEthereumTransactionSent] = React.useState<boolean>(false);
  const [ethereumTransactionComplete, setEthereumTransactionComplete] =
    React.useState<boolean>(false);
  const [ethereumTransactionHash, setEthereumTransactionHash] = React.useState<string>('');
  const [polygonTransactionHash, setPolygonTransactionHash] = React.useState<string>('');
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

  useEffect(() => {
    if (!depositAddress) {
      // initTransfer().then(() => {
      //   console.log('transfer initialised')
      // });
    }
  }, [provider]);

  const onFundsTransfered = (data: BiconomyFundsTransferedResponse) => {
    console.log('FUNDS TRANSFERRED', data);
    setPolygonTransactionHash(data.exitHash);
  };

  let hyphen: Hyphen;
  if (provider) {
    hyphen = new Hyphen(provider, {
      debug: true, // If 'true', it prints debug logs on console window
      environment: 'test', // It can be "test" or "prod"
      onFundsTransfered
    });
  }

  // const [hyphen, setHyphen] = React.useState<Hyphen | null>(null);

  const initTransfer = async () => {
    console.log('initTransfer');
    console.log(provider);
    if (provider) {
      await hyphen.init();
      const token = ethereumTokens.eth;
      const amount = 0.001;
      const preTransferStatus: BiconomyPreTransferStatus = await hyphen.preDepositStatus({
        tokenAddress: token.address, // Token address on fromChain which needs to be transferred
        amount: ethers.utils.formatUnits(amount, token.decimals).toString(), // Amount of tokens to be transferred in smallest unit eg wei
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
          amount.toString()
        );

        // ⏱Wait for transaction to confirm, pass number of blocks to wait as param
        await approveTx.wait(2);

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
  };

  const deposit = async () => {
    if (provider) {
      setEthereumTransactionRequested(true);
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
      setEthereumTransactionSent(true);
      setEthereumTransactionHash(depositTx.hash);
      console.log('DEPOSIT Tx', depositTx);
      await depositTx.wait(2);
      setEthereumTransactionComplete(true);
    }
  };

  return (
    <div>
      <Button onClick={initTransfer}>Transfer</Button>
      {depositAddress && (
        <div className={'flex flex-col'}>
          <div className={'flex flex-row justify-between'}>
            <span className={'text-title'}>Bridge ETH</span>
            <PoweredByLink url={'https://hyphen.biconomy.io/'} logo={hyphenLogo} isRound={false} />
          </div>
          <span className={'text-title'}>How much ETH do you want to deposit?</span>
          <div
            className={
              'rounded-2xl transition border-2 py-2 border-gray-50 bg-gray-50 px-2 sm:px-4 flex flex-row items-center justify-between hover:border-gray-100 transition mt-2'
            }
          >
            <div className={'w-4/5'}>
              <input
                type={'number'}
                className={
                  'text-2xl sm:text-3xl bg-gray-50 focus:outline-none px-2 sm:px-0 sm:mt-0 py-1 sm:py-0 w-full'
                }
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
            <div className={'text-gray-500 w-1/5 text-md'}>
              {ethereumPrice ? (
                <div className={'text-right'}>
                  {formatTokenValueInFiat(ethereumPrice.current_price, transferAmount)}
                </div>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          </div>
          <Button className={'mt-4'} onClick={deposit}>
            Deposit
          </Button>
          <TransactionStep
            show={true}
            transactionError={transactionError}
            stepComplete={depositAddress !== ''}
          >
            Deposit address generated
          </TransactionStep>
          <TransactionStep
            show={depositAddress !== ''}
            transactionError={transactionError}
            stepComplete={BigNumber.from(transferAmount).gt(0)}
          >
            Transfer amount set
          </TransactionStep>
          <TransactionStep
            show={ethereumTransactionRequested}
            transactionError={transactionError}
            stepComplete={ethereumTransactionSent}
          >
            Ethereum transaction sent
            <BlockExplorerLink transactionHash={ethereumTransactionHash} />
          </TransactionStep>
          <TransactionStep
            show={ethereumTransactionSent}
            transactionError={transactionError}
            stepComplete={ethereumTransactionComplete}
          >
            Ethereum transaction complete
          </TransactionStep>
          <TransactionStep
            showTransition={false}
            show={ethereumTransactionComplete}
            transactionError={transactionError}
            stepComplete={polygonTransactionHash !== ''}
          >
            Polygon transaction complete
            <BlockExplorerLink transactionHash={polygonTransactionHash} />
          </TransactionStep>
          <TransactionError transactionError={transactionError} />
        </div>
      )}
    </div>
  );
}
