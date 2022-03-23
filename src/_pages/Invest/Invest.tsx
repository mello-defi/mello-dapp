
import { useSelector } from 'react-redux';
import { AppState } from '_redux/store';
import { Button } from '_components/core/Buttons';
import { useState } from 'react';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

export default function Invest () {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.wallet.address);
  const doStuff = async () => {
    if (provider && userAddress) {
      const sdk = new ThirdwebSDK(provider);
      const contract = sdk.getEditionDrop("0x59D32B562144e43cB52E4becb84172aa8b80710C");
      const tokenId = 0; // the id of the NFT you want to claim
      const quantity = 1; // how many NFTs you want to claim
      const tx = await contract.claimTo(userAddress, tokenId, quantity);
      console.log('tx', tx);
    }
  }

  return (
    <div>
      <h1>Invest</h1>
      <Button onClick={doStuff}>press me</Button>
    </div>
  )
}