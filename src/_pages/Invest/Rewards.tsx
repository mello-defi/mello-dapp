import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import React, { useEffect, useState } from 'react';
import {
  getMultiTokensCurrentRewardsEstimate,
  getMultiTokensPendingClaims,
  multiTokenClaimRewards
} from '_services/balancerClaimService';
import {
  ClaimableToken,
  MultiTokenCurrentRewardsEstimate,
  MultiTokenPendingClaims
} from '_interfaces/balancer';
import { getTokenByAddress } from '_utils/index';
import useMarketPrices from '_hooks/useMarketPrices';
import { getTokenValueInFiat } from '_services/priceService';
import SingleCryptoAmountInput from '_components/core/SingleCryptoAmountInput';
import { BigNumber } from 'ethers';
import { ExpandMore } from '@mui/icons-material';
import { DefaultTransition } from '_components/core/Transition';
import { Button, ButtonSize } from '_components/core/Buttons';

export function Rewards() {
  const marketPrices = useMarketPrices();
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const { provider, network, tokenSet, signer } = useSelector((state: AppState) => state.web3);
  const [rawTokenClaims, setRawTokenClaims] = useState<MultiTokenPendingClaims[]>([]);
  const [tokenClaims, setTokenClaims] = useState<ClaimableToken[]>([]);
  const [totalRewardsInFiat, setTotalRewardsInFiat] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const getBalancerData = async () => {
      if (provider && userAddress && network) {
        const claims = await getMultiTokensPendingClaims(provider, userAddress, network.chainId);
        const estimates = await getMultiTokensCurrentRewardsEstimate(userAddress, network.chainId);
        console.log('estimates', estimates);
        setRawTokenClaims(claims);
        const formattedClaims: ClaimableToken[] = [];
        let totalRewardsTemp = 0;
        for (const claim of claims) {
          const token = getTokenByAddress(tokenSet, claim.tokenClaimInfo.token);
          const price = marketPrices[token.address.toLowerCase()];
          if (price) {
            const fiatValue = getTokenValueInFiat(price, claim.availableToClaim);
            totalRewardsTemp += fiatValue;
            formattedClaims.push({
              ...token,
              value: claim.availableToClaim,
              fiatValue
            });
          }
        }
        setTokenClaims(formattedClaims);
        setTotalRewardsInFiat(totalRewardsTemp);
      }
    };
    getBalancerData();
  }, [provider, userAddress, network]);

  const claimRewards = async () => {
    if (signer && userAddress) {
      try {
        await multiTokenClaimRewards(signer, [rawTokenClaims[2]], userAddress);
      } catch (e: any) {
        console.error(e);
      }
    }
  };
  return (
    <div
      className={
        'bg-white my-2 rounded-2xl px-2 md:px-4 py-4 mb-2 border-2 -mx-1 border-gray-50 shadow-sm flex flex-col'
      }
    >
      <div className={'flex-row-center text-body justify-between px-2'}>
        <span>My rewards</span>
        <div className={'flex-row-center justify-end'}>
          <span>
            Total rewards:{' '}
            <span className={'font-mono te'}>
              $
              {totalRewardsInFiat.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              })}
            </span>
          </span>
          {totalRewardsInFiat > 0 && (
            <div className={'text-3xl'}>
              <ExpandMore
                onClick={() => setIsExpanded(!isExpanded)}
                fontSize={'inherit'}
                className={'cursor-pointer text-color-light hover:text-black transition ml-2 mb-1'}
              />
            </div>
          )}
        </div>
      </div>
      <DefaultTransition isOpen={isExpanded && totalRewardsInFiat > 0}>
        <div>
          {tokenClaims.map((token) => (
            <div
              key={token.symbol}
              className={
                'rounded-2xl bg-gray-100 transition border-2 py-2 border-gray-50 bg-gray-50 px-2 sm:px-4 flex-row-center justify-between hover:border-gray-100 transition mt-2'
              }
            >
              <div className={'flex flex-col  font-mono'}>
                <span className={'text-body text-color-dark'}>{token.value}</span>
                <span className={'text-body-smaller text-color-light'}>
                  ${token.fiatValue.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </div>
              <span className="flex-row-center max-w-2/5 items-center rounded-2xl bg-white px-4 py-2 justify-center">
                <img
                  src={token.image}
                  alt="person"
                  className="flex-shrink-0 h-6 w-6 rounded-full"
                />
                <span className="ml-2 block truncate">{token.symbol}</span>
              </span>
            </div>
          ))}
          <Button onClick={claimRewards} className={'w-full mt-2'}>
            Claim
          </Button>
        </div>
      </DefaultTransition>
    </div>
  );
}
