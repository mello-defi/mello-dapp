import useMarketPrices from '_hooks/useMarketPrices';
import { PoolToken } from '_interfaces/balancer';
import { useState } from 'react';
import { getVaultAddress } from '_services/balancerVaultService';
import { parseUnits } from 'ethers/lib/utils';
import { MaxUint256 } from '_utils/maths';
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import useCheckAndApproveTokenBalance from '_hooks/useCheckAndApproveTokenBalance';
import { TransactionServices } from '_enums/db';

const useBalancerFunctions = () => {
  const marketPrices = useMarketPrices();
  const checkAndApproveAllowance = useCheckAndApproveTokenBalance();
  const [amounts, setAmounts] = useState<string[]>([]);
  const { network }= useSelector((state: AppState) => state.web3);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [tokensApproved, setTokensApproved] = useState(false);
  const [tokenApprovalHash, setTokenApprovalHash] = useState('');
  const [sumOfAmountsInFiat, setSumOfAmountsInFiat] = useState<string | null>(null);

  // const [approvalHash, setApprovalHash] = useState<string>();
  const [transactionError, setTransactionError] = useState('');
  const { address: userAddress } = useSelector((state: AppState) => state.wallet);

  const checkApprovalsAndGetAmounts = async (poolTokens: PoolToken[]): Promise<string[]> => {
    const amountsOut: string[] = [];
    if (userAddress) {
      const addressesSorted = poolTokens.map((t) => t.address).sort();
      const vaultAddress = getVaultAddress(network.chainId);
      for (let i = 0; i < addressesSorted.length; i++) {
        const address = addressesSorted[i];
        const amount = parseUnits(amounts[i], poolTokens[i].decimals);
        amountsOut.push(amount.toString());
        if (amount.gt(0)) {
          await checkAndApproveAllowance(
            address,
            userAddress,
            setTokenApprovalHash,
            MaxUint256,
            TransactionServices.Balancer,
            vaultAddress
          );
        }
      }
    }
    return amountsOut
  }
  const handleTokenAmountChange = (tokenIndex: number, amount: string) => {
    const newTokenAmountMap = [...amounts];
    newTokenAmountMap[tokenIndex] = amount;
    setAmounts(newTokenAmountMap);
  };
  const sumAmounts = (poolTokens: PoolToken[]): number => {
    let total = 0;
    for (let i = 0; i < amounts.length; i++) {
      const amount = amounts[i];
      console.log(amount);
      if (!isNaN(parseFloat(amount))) {
        const token = poolTokens[i];
        const marketPrice = marketPrices[token.address.toLowerCase()]
        if (marketPrice) {
          total += marketPrice * parseFloat(amount);
        }
      }
    }
    return total;
  }
  return {
    sumAmounts,
    amounts,
    setAmounts,
    handleTokenAmountChange,
    checkApprovalsAndGetAmounts,
    transactionInProgress,
    setTransactionInProgress,
    transactionComplete,
    setTransactionComplete,
    transactionHash,
    setTransactionHash,
    transactionError,
    setTransactionError,
    setTokensApproved,
    tokensApproved,
    tokenApprovalHash,
    sumOfAmountsInFiat,
    setSumOfAmountsInFiat
  }
};

export default useBalancerFunctions;
