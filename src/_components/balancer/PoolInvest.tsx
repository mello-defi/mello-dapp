import { Pool, PoolToken } from '_interfaces/balancer';
import useWalletBalances from '_hooks/useWalletBalances';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useMarketPrices from '_hooks/useMarketPrices';
import React, { useEffect, useState } from 'react';
import useCheckAndApproveTokenBalance from '_hooks/useCheckAndApproveTokenBalance';
import { CryptoCurrencySymbol } from '_enums/currency';
import { amountIsValidNumberGtZero, getTokenByAddress } from '_utils/index';
import { getMarketDataForSymbol } from '_services/marketDataService';
import { BigNumber } from 'ethers';
import { getVaultAddress } from '_services/balancerVaultService';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { MaxUint256 } from '_utils/maths';
import { getGasPrice } from '_services/gasService';
import { joinPool } from '_services/balancerPoolService';
import { toggleBalancesAreStale } from '_redux/effects/walletEffects';
import { toggleUserPoolDataStale } from '_redux/effects/balancerEffects';
import { EthereumTransactionError } from '_interfaces/errors';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { HorizontalLineBreak } from '_components/core/HorizontalLineBreak';
import MaxAmountButton from '_components/core/MaxAmountButton';
import { Button } from '_components/core/Buttons';
import { TransactionStep } from '_components/transactions/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/transactions/TransactionError';
import { BalancerFunction } from '_components/balancer/PoolFunctions';
import { setStep } from '_redux/effects/onboardingEffects';
import { BalancerActions, TransactionServices } from '_enums/db';
import { logTransaction } from '_services/dbService';

export default function PoolInvest({ pool }: { pool: Pool }) {
  const walletBalances = useWalletBalances();
  const dispatch = useDispatch();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const { provider, network, signer, tokenSet } = useSelector((state: AppState) => state.web3);
  const { complete, ongoing, currentStep } = useSelector((state: AppState) => state.onboarding);

  const marketPrices = useMarketPrices();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [tokensApproved, setTokensApproved] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const checkAndApproveAllowance = useCheckAndApproveTokenBalance();
  const [approvalHash, setApprovalHash] = useState<string>('');
  const [amountsToInvest, setAmountsToInvest] = useState<string[]>([]);
  const [sumOfAmountsInFiat, setSumOfAmountsInFiat] = useState<string | null>(null);
  // const [tokenAmountMap, setTokenAmountMap] = useState<TokenAmountMap | undefined>(undefined);

  const initTokenAmounts = () => {
    setAmountsToInvest(Array(pool.tokens.length).fill('0.0'));
  };
  useEffect(() => {
    if (!amountsToInvest.length) {
      initTokenAmounts();
    }
  }, [pool]);
  const walletBalanceGreaterThanZero = (token: PoolToken): boolean => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return !bal || (bal && bal.balance.gt(0));
  };
  const getMarketPricesForPoolToken = (token: PoolToken): number => {
    const tokenDetail = getTokenByAddress(tokenSet, token.address);
    const data = getMarketDataForSymbol(marketPrices, tokenDetail.symbol);
    if (data) {
      return data.current_price;
    }
    return 0;
  };

  const getUserBalanceForPoolToken = (token: PoolToken): BigNumber | undefined => {
    const bal = walletBalances[token.symbol as CryptoCurrencySymbol];
    return bal && bal.balance;
  };

  const handleTokenAmountChange = (tokenIndex: number, amount: string) => {
    const newTokenAmountMap = [...amountsToInvest];
    newTokenAmountMap[tokenIndex] = amount;
    setAmountsToInvest(newTokenAmountMap);
  };

  useEffect(() => {
    if (!amountsToInvest.length) {
      setSumOfAmountsInFiat('0.0');
    }
    let total = 0;
    for (let i = 0; i < amountsToInvest.length; i++) {
      const amount = amountsToInvest[i];
      console.log(amount);
      if (!isNaN(parseFloat(amount))) {
        const token = pool.tokens[i];
        const tokenData = getTokenByAddress(tokenSet, token.address);
        const data = getMarketDataForSymbol(marketPrices, tokenData.symbol);
        if (data) {
          const price = data && data.current_price;
          total += price * parseFloat(amount);
        }
      }
    }
    setSumOfAmountsInFiat(isNaN(total) ? null : total.toFixed(2));
  }, [amountsToInvest]);

  const join = async () => {
    if (userAddress && signer && amountsToInvest && provider && network) {
      try {
        const addressesSorted = pool.tokens.map((t) => t.address).sort();
        const amountsIn: string[] = [];
        const vaultAddress = getVaultAddress(network.chainId);
        setTransactionInProgress(true);
        for (let i = 0; i < addressesSorted.length; i++) {
          const address = addressesSorted[i];
          const decimals = pool.tokens.find((t) => t.address === address)?.decimals;
          const amount = parseUnits(amountsToInvest[i], decimals);
          amountsIn.push(amount.toString());
          if (amount.gt(0)) {
            await checkAndApproveAllowance(
              address,
              userAddress,
              setApprovalHash,
              MaxUint256,
              TransactionServices.Balancer,
              vaultAddress
            );
          }
        }
        setTokensApproved(true);
        const gasResult = await getGasPrice(network.gasStationUrl);

        const tx = await joinPool(pool, userAddress, signer, amountsIn, gasResult?.fastest);
        setTransactionHash(tx.hash);
        logTransaction(
          tx.hash,
          network.chainId,
          TransactionServices.Balancer,
          BalancerActions.Invest
        );
        await tx.wait(3);
        setTransactionComplete(true);
        dispatch(toggleBalancesAreStale(true));
        dispatch(toggleUserPoolDataStale(true));
        initTokenAmounts();
        if (ongoing && !complete) {
          dispatch(setStep(currentStep + 1));
        }
      } catch (e: any) {
        console.error(e);
        // TODO move to hook
        const errorParsed = typeof e === 'string' ? (JSON.parse(e) as EthereumTransactionError) : e;
        setTransactionError(
          `${errorParsed.message}${errorParsed.data ? ' - ' + errorParsed.data.message : ''}`
        );
      }
    }
  };

  const stateIsValid = (): boolean => {
    if (!amountsToInvest.length) {
      return false;
    }
    let nonZeroAmounts = 0;
    for (let i = 0; i < amountsToInvest.length; i++) {
      const amount = amountsToInvest[i];
      if (amountIsValidNumberGtZero(amount)) {
        nonZeroAmounts++;
        const amountBn = parseUnits(amount, pool.tokens[i].decimals);
        const walletBalance =
          walletBalances[pool.tokens[i].symbol.toUpperCase() as CryptoCurrencySymbol];
        if (walletBalance && amountBn.gt(walletBalance.balance)) {
          return false;
        }
      }
    }
    if (nonZeroAmounts === 0) {
      return false;
    }
    if (sumOfAmountsInFiat === null) {
      return false;
    }
    return true;
  };

  const resetState = () => {
    initTokenAmounts();
    setTransactionHash('');
    setTransactionInProgress(false);
    setTransactionComplete(false);
    setTransactionError('');
    setTokensApproved(false);
  };

  const handleMaxAmountPressed = () => {
    const newTokenAmounts = [...amountsToInvest];
    for (let i = 0; i < newTokenAmounts.length; i++) {
      const token = pool.tokens[i];
      const balance = getUserBalanceForPoolToken(token);
      newTokenAmounts[i] = balance ? formatUnits(balance.toString(), token.decimals) : '0';
    }
    setAmountsToInvest(newTokenAmounts);
  };
  return (
    <div className={'flex flex-col'}>
      {amountsToInvest &&
        amountsToInvest.length > 0 &&
        pool.tokens.map((token, tokenIndex: number) => (
          <div key={token.symbol} className={'px-2'}>
            <SingleCryptoAmountInput
              disabled={!walletBalanceGreaterThanZero(token)}
              maxAmount={getUserBalanceForPoolToken(token)}
              amount={amountsToInvest[tokenIndex]}
              balance={getUserBalanceForPoolToken(token)}
              amountChanged={(amount: string) => handleTokenAmountChange(tokenIndex, amount)}
              token={getTokenByAddress(tokenSet, token.address)}
            />
          </div>
        ))}

      <div className={'px-4 mt-2'}>
        <HorizontalLineBreak />
        <div className={'flex-row-center mb-2 justify-between text-body'}>
          <div>Total:</div>
          <div className={'flex-row-center'}>
            <div className={'font-mono'}>{sumOfAmountsInFiat ? `$${sumOfAmountsInFiat}` : '-'}</div>
            <MaxAmountButton onClick={handleMaxAmountPressed} />
          </div>
        </div>
        <div>
          <Button
            disabled={transactionInProgress || !stateIsValid()}
            className={'w-full'}
            onClick={join}
          >
            {BalancerFunction.Invest}
          </Button>
        </div>
      </div>
      <div className={'text-body px-2 my-2'}>
        {(transactionInProgress || transactionComplete) && (
          <div>
            <TransactionStep
              show={true}
              transactionError={transactionError}
              stepComplete={tokensApproved}
            >
              {tokensApproved ? 'Tokens approved' : 'Approving tokens'}
              <BlockExplorerLink transactionHash={approvalHash} />
            </TransactionStep>
            <TransactionStep
              show={tokensApproved}
              transactionError={transactionError}
              stepComplete={transactionComplete}
              showTransition={false}
            >
              {transactionComplete ? 'Investment confirmed' : 'Investment confirming'}
              <BlockExplorerLink transactionHash={transactionHash} />
            </TransactionStep>
            <TransactionError onClickClear={resetState} transactionError={transactionError} />
          </div>
        )}
      </div>
    </div>
  );
}
