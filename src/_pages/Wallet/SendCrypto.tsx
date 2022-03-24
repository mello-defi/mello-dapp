import MultiCryptoAmountInput from '_components/core/MultiCryptoAmountInput';
import { useEffect, useState } from 'react';
import { EvmTokenDefinition } from '_enums/tokens';
import useMarketPrices from '_hooks/useMarketPrices';
import { CryptoCurrencySymbol } from '_enums/currency';
import { MarketDataResult } from '_services/marketDataService';
import { BigNumber, ethers } from 'ethers';
import { Button, ButtonSize } from '_components/core/Buttons';
import useWalletBalance from '_hooks/useWalletBalance';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { EthereumTransactionError } from '_interfaces/errors';
import { approveToken, getTokenAllowance, sendErc20Token } from '_services/walletService';
import { getGasPrice } from '_services/gasService';
import { toggleBalanceIsStale } from '_redux/effects/walletEffects';
import { logTransactionHash } from '_services/dbService';

export default function SendCrypto() {
  const marketPrices = useMarketPrices();
  const [token, setToken] = useState<EvmTokenDefinition | undefined>();
  const signer = useSelector((state: AppState) => state.web3.signer);
  const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const network = useSelector((state: AppState) => state.web3.network);
  const walletBalance = useWalletBalance(token);
  const [amountToSend, setAmountToSend] = useState<string>('0.0');
  const [amountInFiat, setAmountInFiat] = useState<number>(0);
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [transactionSubmitting, setTransactionSubmitting] = useState<boolean>(false);
  const [transactionCompleted, setTransactionCompleted] = useState<boolean>(false);
  const [sendTransactionHash, setSendTransactionHash] = useState<string>('');
  const [approveTransactionHash, setApproveTransactionHash] = useState<string>('');
  const [tokenApproved, setTokenApproved] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string>('');

  const updateMarketPrice = () => {
    if (token && amountToSend) {
      let symbol = token.symbol;
      if (symbol === CryptoCurrencySymbol.WMATIC) {
        symbol = CryptoCurrencySymbol.MATIC;
      }
      if (symbol === CryptoCurrencySymbol.WETH) {
        symbol = CryptoCurrencySymbol.ETH;
      }
      if (symbol === CryptoCurrencySymbol.WBTC) {
        symbol = CryptoCurrencySymbol.BTC;
      }

      const data = marketPrices.find(
        (m: MarketDataResult) => m.symbol.toLocaleLowerCase() === symbol.toLowerCase()
      );

      setAmountInFiat(data ? data.current_price * parseFloat(amountToSend) : 0);
    }
  };

  useEffect(() => {
    updateMarketPrice();
    resetTransaction();
  }, [amountToSend, token]);

  const dispatch = useDispatch();
  const sendCrypto = async () => {
    if (signer && token && userAddress && provider) {
      try {
        // REVIEW - is approval needed here?
        const amountInUnits = ethers.utils.parseUnits(amountToSend, token.decimals);
        setTransactionSubmitting(true);

        const allowance: BigNumber = await getTokenAllowance(token.address, token.abi, provider, userAddress);
        console.log(amountInUnits.toString());
        console.log(allowance.toString());
        if (allowance.lt(amountInUnits)) {
          const gasPriceResult = await getGasPrice(network.gasStationUrl);
          const tx: TransactionResponse = await approveToken(
            token.address,
            token.abi,
            signer,
            userAddress,
            amountInUnits,
            gasPriceResult?.fastest
          );
          setApproveTransactionHash(tx.hash);
          await tx.wait(gasPriceResult?.blockTime || 3);
        }
        setTokenApproved(true);
        const gasPriceResult = await getGasPrice(network.gasStationUrl);
        const txResponse: TransactionResponse = await sendErc20Token(
          token,
          signer,
          userAddress,
          destinationAddress,
          ethers.utils.parseUnits(amountToSend, token.decimals),
          gasPriceResult?.fastest
        );
        logTransactionHash(txResponse.hash, network.chainId);
        setSendTransactionHash(txResponse.hash);
        await txResponse.wait(gasPriceResult?.blockTime || 3);
        setTransactionCompleted(true);
        dispatch(toggleBalanceIsStale(token.symbol, true));
      } catch (e: any) {
        console.error(e);
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
      setTransactionSubmitting(false);
    }
  };

  const resetTransaction = () => {
    if (transactionSubmitting) {
      setTransactionSubmitting(false);
    }
    if (transactionCompleted) {
      setTransactionCompleted(false);
    }
    if (transactionError) {
      setTransactionError('');
    }
    if (sendTransactionHash) {
      setSendTransactionHash('');
    }
  };
  return (
    <div className={'flex flex-col'}>
      <MultiCryptoAmountInput
        token={token}
        tokenChanged={setToken}
        amount={amountToSend}
        amountChanged={(amount: string) => setAmountToSend(amount)}
        disabled={false}
        amountInFiat={amountInFiat}
      />
      <div className="my-2">
        <label htmlFor="large-input" className={'mb-2 text-body-smaller my-2 px-1'}>
          Destination address
        </label>
        <input
          spellCheck={false}
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
          type="text"
          id="large-input"
          className="block font-mono p-4 w-full rounded-2xl focus:outline-none border border-gray-100 transition hover:border-gray-300 focus:border-gray-300"
        />
      </div>
      <Button
        disabled={
          transactionSubmitting ||
          !ethers.utils.isAddress(destinationAddress) ||
          !token ||
          !amountToSend ||
          parseFloat(amountToSend) === 0 ||
          (walletBalance &&
            (ethers.utils.parseUnits(amountToSend, token.decimals).gt(walletBalance) ||
              (token.isGasToken &&
                ethers.utils.parseUnits(amountToSend, token.decimals).eq(walletBalance))))
        }
        size={ButtonSize.LARGE}
        onClick={sendCrypto}
      >
        {destinationAddress.length > 0 && !ethers.utils.isAddress(destinationAddress)
          ? 'Invalid address'
          : token &&
            walletBalance &&
            token.isGasToken &&
            ethers.utils.parseUnits(amountToSend, token.decimals).eq(walletBalance)
          ? 'You cannot send all of your gas token'
          : 'Send'}
      </Button>
      {(transactionSubmitting || transactionCompleted || transactionError) && (
        <>
          <TransactionStep
            transactionError={transactionError}
            show={true}
            stepComplete={tokenApproved}
          >
            {tokenApproved ? 'Token approved' : 'Approving token'}
            <BlockExplorerLink transactionHash={approveTransactionHash} />
          </TransactionStep>
          <TransactionStep
            showTransition={false}
            transactionError={transactionError}
            show={tokenApproved}
            stepComplete={transactionCompleted}
          >
            {transactionCompleted ? 'Transaction completed' : 'Sending transaction'}
            <BlockExplorerLink transactionHash={sendTransactionHash} />
          </TransactionStep>
          <TransactionError onClickClear={resetTransaction} transactionError={transactionError} />
        </>
      )}
    </div>
  );
}
