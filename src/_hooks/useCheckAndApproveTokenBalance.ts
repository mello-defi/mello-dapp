import { getMarketPrices } from '_redux/effects/marketEffects';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { approveToken, getTokenAllowance } from '_services/walletService';
import { ERC20Abi } from '../_abis';
import { getGasPrice } from '_services/gasService';
import { MaxUint256 } from '_utils/maths';
import { logTransactionHash } from '_services/dbService';

const useCheckAndApproveTokenBalance = () => {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const signer = useSelector((state: AppState) => state.web3.signer);
  const network = useSelector((state: AppState) => state.web3.network);
  const checkAndApproveAllowance = async (
    tokenAddress: string,
    userAddress: string,
    setTransactionHash: (hash: string) => void,
    amount: ethers.BigNumber = MaxUint256,
    spenderAddress?: string
  ) => {
    if (provider && signer && network) {
      const allowance = await getTokenAllowance(
        tokenAddress,
        ERC20Abi,
        provider,
        userAddress,
        spenderAddress
      );
      if (allowance.eq(0)) {
        const approvalGasResult = await getGasPrice(network.gasStationUrl);
        const approvalTxHash = await approveToken(
          tokenAddress,
          ERC20Abi,
          signer,
          userAddress,
          amount,
          approvalGasResult?.fastest,
          spenderAddress
        );
        logTransactionHash(approvalTxHash.hash, network.chainId);
        setTransactionHash(approvalTxHash.hash);
        await approvalTxHash.wait(approvalGasResult?.blockTime || 3);
      }
    }
  };
  return checkAndApproveAllowance;
};

export default useCheckAndApproveTokenBalance;
