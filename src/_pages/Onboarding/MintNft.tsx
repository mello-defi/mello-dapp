
// import { useSelector } from 'react-redux';
// import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { setStep } from '_redux/effects/onboardingEffects';
// import { useState } from 'react';
// import { ThirdwebSDK } from "@thirdweb-dev/sdk";

export default function MintNft () {
  // const signer = useSelector((state: AppState) => state.web3.provider);
  // const userAddress = useSelector((state: AppState) => state.wallet.address);
  // const doStuff = async () => {
  //   if (provider && userAddress) {
  //     const sdk = new ThirdwebSDK(signer);
  //     const contract = sdk.getEditionDrop("0x59D32B562144e43cB52E4becb84172aa8b80710C");
  //     const tokenId = 0; // the id of the NFT you want to claim
  //     const quantity = 1; // how many NFTs you want to claim
  //     const tx = await contract.claimTo(userAddress, tokenId, quantity);
  //     console.log('tx', tx);
  //   }
  // }

  const signer = useSelector((state: AppState) => state.web3.signer);
  const currentStep = useSelector((state: AppState) => state.onboarding.currentStep);
  const dispatch = useDispatch();
  const signMessage = async () => {
    dispatch(setStep(currentStep + 1));
  };
  return (
    <div className={'flex justify-center mb-2'}>
      {signer && (
        <Button className={'w-full md:w-1/2'} onClick={signMessage}>
          Mint NFT
        </Button>
      )}
    </div>
  );
}