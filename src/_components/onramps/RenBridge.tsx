import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bitcoin, Polygon } from '@renproject/chains';
import { AppState } from '_redux/store';
import { renJS } from '_services/renService';
import { EthProvider } from '@renproject/chains-ethereum/build/main/types';
import { CopyableText } from '_pages/Wallet';
import { TransactionStep } from '_components/core/TransactionStep';
import BlockExplorerLink from '_components/core/BlockExplorerLink';
import TransactionError from '_components/core/TransactionError';
import PoweredByLink from '_components/PoweredByLink';
import { renLogo } from '_assets/images';

const amount = 0.0001;

interface DropdownSelectOption {
  label: string;
  imageUrl?: string | null;
}

// export const DropdownSelect = ({
//                             option,
//                            validOptions,
//                            onSelectOption,
//                            onCancelOption,
//                          }: {
//   option: TokenDefinition,
//   validOptions: TokenDefinition[],
//   onSelectOption: (option: TokenDefinition) => void,
//   onCancelOption: () => void,
//
//                                }) => {
//   const [dropdownOpen, setDropdownOpen] = React.useState(false);
//   const [selectedItem, setSelectedItem] = React.useState<DropdownSelectOption>(options[0]);
//   // CAN BE FIXED WITH THIS https://github1s.com/renproject/ren-js-v3-demo/blob/HEAD/src/components/views/Dropdown.tsx
//   return (
//     <div className="w-full my-1">
//       <div className="mt-1 relative">
//         <button type="button"
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//                 className="cursor-pointer relative w-full z-0 bg-white rounded-md shadow-lg pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm">
//             <span className="flex items-center">
//                 {selectedItem.imageUrl && (
//                   <img src={selectedItem.imageUrl} alt="person" className="flex-shrink-0 h-6 w-6 rounded-full"/>
//                 )}
//               <span className="ml-3 block truncate">
//                     {selectedItem.label}
//                 </span>
//             </span>
//           <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                 <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
//                      fill="currentColor" aria-hidden="true">
//                     <path fill-rule="evenodd"
//                           d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
//                           clip-rule="evenodd">
//                     </path>
//                 </svg>
//             </span>
//         </button>
//         <DefaultTransition isOpen={dropdownOpen}>
//           <div className="absolute mt-1 w-full z-10 rounded-md bg-white shadow-lg">
//             <ul tabIndex={-1} role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-item-3"
//                 className="max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
//               {options.map((option: DropdownSelectOption) => {
//                 return (
//                   <li
//                     onClick={() => {
//                       setSelectedItem(option);
//                       setDropdownOpen(false);
//                       onClick(option);
//                     }}
//                     role="option"
//                     className="text-gray-900 cursor-pointer hover:bg-gray-500 hover:text-white select-none relative py-2 pl-3 pr-9">
//                     <div className="flex items-center">
//                       {option.imageUrl && (
//                         <img src={option.imageUrl} alt="person" className="flex-shrink-0 h-6 w-6 rounded-full"/>
//                       )}
//                       <span className="ml-3 block font-normal truncate">
//                         {option.label}
//                       </span>
//                     </div>
//                     {selectedItem.label === option.label && (
//                       <span className="absolute inset-y-0 right-0 flex items-center pr-4">
//                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
//                                fill="currentColor" aria-hidden="true">
//                               <path fill-rule="evenodd"
//                                     d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                                     clip-rule="evenodd">
//                               </path>
//                           </svg>
//                       </span>
//                     )}
//                   </li>
//                 )
//               })}
//             </ul>
//           </div>
//         </DefaultTransition>
//       </div>
//     </div>
//   )
// }

export function HorizontalLineBreak() {
  return <div className={'w-full border-b-2 border-gray-50 my-2'} />;
}

export const shortenBlockchainAddress = (address: string) => {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length);
};

const calculatePrice = (amount: number, price: number): string => {
  return `$${(amount * price).toFixed(2)}`;
};
//
// function FeeCalculator({ fromAsset, toAsset }: { fromAsset: string; toAsset: string }) {
//   const [amount, setAmount] = useState<number>(0);
//   const userAddress = useSelector((state: AppState) => state.web3.userAddress);
//   const provider = useSelector((state: AppState) => state.web3.provider);
//   const [renFees, setRenFees] = useState<number>(0);
//   const [gasPrice, setGasPrice] = useState<number>(0);
//   const [bitcoinFees, setBitcoinFees] = useState<number>(0);
//   const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
//   const [ethPrice, setEthPrice] = useState<number>(0);
//
//   useEffect(() => {
//     const getPrices = async () => {
//       const gasPrice = await getGasPrice();
//       const renFees = await renJS.getFees({
//         asset: 'BTC',
//         from: Bitcoin(),
//         // @ts-ignore
//         to: Ethereum(provider, 'mainnet')
//       });
//       setRenFees(renFees.mint / 100);
//       const marketData: MarketDataResult[] = await getMarketData();
//       console.log(marketData);
//       setBitcoinPrice(
//         // @ts-ignore
//         marketData.find((m) => m.id === CryptoCurrencyName.BITCOIN.toLocaleLowerCase())
//           ?.current_price
//       );
//       setEthPrice(
//         // @ts-ignore
//         marketData.find((m) => m.id === CryptoCurrencyName.ETHEREUM.toLocaleLowerCase())
//           ?.current_price
//       );
//     };
//   }, [provider]);
//
//   const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const regex = /^[0-9.]+$/;
//     if (regex.test(event.target.value)) {
//       let num = Number(event.target.value);
//       if (num < 0) {
//         num = 0;
//       }
//       setAmount(num);
//       // getPrices()
//     }
//   };
//   return (
//     <div className={'flex flex-col w-full text-left'}>
//       <HorizontalLineBreak />
//       <div className={'flex-row-center justify-between'}>
//         <h6>Fee calculator</h6>
//         <input
//           type={'number'}
//           className={'px-2 py-4 bg-gray-100 rounded-2xl'}
//           min={0}
//           onChange={handleAmountChange}
//           value={amount}
//         />
//       </div>
//       <HorizontalLineBreak />
//       <div className={'text-left'}>
//         <h6>Details</h6>
//         <div className={'flex flex-row justify-between'}>
//           <span className={'text-title text-gray-500'}>Sending</span>
//           <span className={'text-title'}>
//             {amount ? (
//               <span>
//                 {amount} BTC{' '}
//                 <span className={'text-gray-500'}>{calculatePrice(amount, bitcoinPrice)}</span>
//               </span>
//             ) : (
//               <>{toAsset}</>
//             )}
//           </span>
//         </div>
//         <div className={'flex flex-row justify-between'}>
//           <span className={'text-title text-gray-500'}>To</span>
//           <span className={'text-title'}>{toAsset}</span>
//         </div>
//         <div className={'flex flex-row justify-between'}>
//           <span className={'text-title text-gray-500'}>Address</span>
//           <span className={'text-title'}>{shortenBlockchainAddress(userAddress)}</span>
//         </div>
//       </div>
//       <HorizontalLineBreak />
//       <div>
//         <h6>Fees</h6>
//         <div className={'flex flex-row justify-between'}>
//           <span className={'text-title text-gray-500'}>RenVM fee</span>
//           <span className={'text-title'}>
//             {amount ? (
//               <span>
//                 {renFees / 100} BTC{' '}
//                 <span className={'text-gray-500'}>
//                   {calculatePrice(renFees / 1000, bitcoinPrice)}
//                 </span>
//               </span>
//             ) : (
//               <>{renFees} BTC</>
//             )}
//           </span>
//         </div>
//         <div className={'flex flex-row justify-between'}>
//           <span className={'text-title text-gray-500'}>Bitcoin miner fee</span>
//           <span className={'text-title'}>{bitcoinFees}</span>
//         </div>
//         <div className={'flex flex-row justify-between'}>
//           <span className={'text-title text-gray-500'}>Address</span>
//           <span className={'text-title'}>{shortenBlockchainAddress(userAddress)}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

function RenBridge() {
  const provider = useSelector((state: AppState) => state.web3.provider);
  const userAddress = useSelector((state: AppState) => state.web3.userAddress);
  const isConnected = useSelector((state: AppState) => state.web3.isConnected);
  const [message, setMessage] = React.useState('');
  const [assetsSelected, setAssetsSelected] = React.useState(false);

  const [gatewayAddress, setGatewayAddress] = React.useState('');
  const [transactionSigned, setTransactionSigned] = React.useState(false);
  const [tokensMinted, setTokensMinted] = React.useState(false);
  const [balance, setBalance] = React.useState(0);
  const [transactionError, setTransactionError] = React.useState('');
  const [transactionExplorerLink, setTransactionExplorerLink] = React.useState('');
  const [numberOfConfirmedTransactions, setNumberOfConfirmedTransactions] = React.useState(0);
  const [transactionConfirmationTarget, setTransactionConfirmationTarget] = React.useState(0);
  const [transactionStatus, setTransactionStatus] = React.useState('');
  const [transactionHash, setTransactionHash] = React.useState('');

  const deposit = async () => {
    // @ts-ignore
    // console.log('userAddress', userAddress);
    // logError(""); // Reset error
    // log(`Generating deposit address...`);
    if (provider) {
      const signer = provider.getSigner();
      const web3Provider: EthProvider = {
        signer,
        provider
      };
      // const amount = 0.003; // BTC
      // 0x880Ad65DC5B3F33123382416351Eef98B4aAd7F1
      // await addTokenToWallet(mumbaiBtc, provider);
      const mint = await renJS.lockAndMint({
        // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
        asset: 'BTC',
        from: Bitcoin(),
        to: Polygon(web3Provider, 'testnet').Account({
          address: userAddress
        })
      });
      console.log('mint', mint);

      // Show the gateway address to the user so that they can transfer their BTC to it.
      // log(`Deposit ${amount} BTC to ${mint.gatewayAddress}`);

      //  @ts-ignore
      setGatewayAddress(mint.gatewayAddress);
      mint.on('deposit', async (deposit) => {
        // Details of the deposit are available from `deposit.depositDetails`.

        const hash = deposit.txHash();
        console.log('hash', hash);
        console.log('DEPOSOT STATUS', deposit.status);
        setTransactionStatus(deposit.status);

        console.log('number of confs', await deposit.confirmations());
        // const depositLog = (msg: string) =>
        //   log(
        //     `BTC deposit: ${Bitcoin.utils.transactionExplorerLink(
        //       deposit.depositDetails.transaction,
        //       'testnet'
        //     )}\n
        //   RenVM Hash: ${hash}\n
        //   Status: ${deposit.status}\n
        //   ${msg}`
        //   );

        await deposit
          .confirmed()
          .on('target', (target) => {
            console.log('IN TARGET');
            const link = Bitcoin.utils.transactionExplorerLink(
              deposit.depositDetails.transaction,
              'testnet'
            );
            console.log('TARGET', target);
            deposit.confirmations().then((confirmations) => {
              setNumberOfConfirmedTransactions(
                confirmations.current > target ? target : confirmations.current
              );
            });
            setTransactionConfirmationTarget(target);
            if (link) {
              setTransactionExplorerLink(link);
            }
            // depositLog(`0/${target} confirmations`)
          })
          .on('confirmation', (confs, target) => {
            console.log('IN  CONFIRMATION');
            // const link = Bitcoin.utils.transactionExplorerLink(deposit.depositDetails.transaction, 'testnet');
            console.log('CONFS', confs);
            console.log('TARGET', target);
            setNumberOfConfirmedTransactions(confs > target ? target : confs);
            // if (link) {
            //   setTransactionExplorerLink(link);
            // }
            // depositLog(`${confs}/${target} confirmations`)
          });

        await deposit
          .signed()
          .on('txHash', (txHash) => {
            console.log('IN SIGNED TX HASN');
            setTransactionSigned(true);
            // depositLog(`Transaction hash: ${txHash}`);
          })
          .on('status', (a) => {
            console.log('IN SIGNED STATUS');
            console.log('A', a);
            setTransactionStatus(a);
            // depositLog(`Signed: ${a}`);
          })
          // Print RenVM status - "pending", "confirming" or "done".
          // .on('status', (status) => {
          //   // console.log('SIGNED STATUS', status);
          //   // depositLog(`Status: ${status}`)
          // })
          .catch((e) => {
            console.log('SIGNED ERRRO');
            console.log(e);
            setTransactionError(e.message);
          });
        await deposit
          .mint()
          // Print Ethereum transaction hash.
          .on('transactionHash', (txHash) => {
            console.log('IN TRANSACTION HASH');
            console.log('TX HASH', txHash);
            setTransactionSigned(true);
            setTransactionHash(txHash);
            setTokensMinted(true);
          })
          .catch((e) => {
            logError('ERROR ON MINT ' + e.message);
            setTransactionError(e.message);
          });
        //
        // log(`Deposited ${amount} BTC.`);
      });
    }
  };

  useEffect(() => {
    if (userAddress && provider && !gatewayAddress) {
      deposit();
    }
  });

  const updateBalance = async () => {
    // const { web3 } = this.state;
    // const contract = new web3.eth.Contract(ABI, contractAddress);
    // const balance = await contract.methods.balance().call();
    // setBalance(parseInt(balance.toString()) / 10 ** 8);
  };

  const logError = (error: string) => {
    console.log('error', error);
    if (error && error != '') {
      // setError(error);
    }
    // this.setState({ error: String((error || {}).message || error) });
  };

  const log = (message: string) => {
    setMessage(message);
  };

  return (
    <>
      <div className="rounded-2xl bg-white flex flex-col">
        <div className={'flex flex-row items-center justify-end'}>
          <PoweredByLink url={'https://bridge.renproject.io/'} logo={renLogo} />
        </div>
        <span className={''}>
          <span>Send your BTC to this address</span>
          <CopyableText text={gatewayAddress} />
        </span>
        <TransactionStep
          show={gatewayAddress !== ''}
          stepComplete={gatewayAddress !== ''}
          transactionError={transactionError}
        >
          Gateway created
        </TransactionStep>
        <TransactionStep
          show={gatewayAddress !== ''}
          stepComplete={transactionExplorerLink !== ''}
          transactionError={transactionError}
        >
          Bitcoin deposited
          {transactionExplorerLink && (
            <a
              target="_blank"
              href={transactionExplorerLink}
              className={
                'flex text-title-tab-bar px-2 py-1 ml-2 cursor-pointer rounded-full bg-gray-200'
              }
              rel="noreferrer"
            >
              View on explorer
            </a>
          )}
        </TransactionStep>
        <TransactionStep
          show={transactionExplorerLink !== ''}
          transactionError={transactionError}
          stepComplete={
            transactionConfirmationTarget > 0 &&
            numberOfConfirmedTransactions === transactionConfirmationTarget
          }
        >
          {numberOfConfirmedTransactions}/{transactionConfirmationTarget} confirmations
        </TransactionStep>
        <TransactionStep
          showTransition={false}
          show={
            transactionConfirmationTarget > 0 &&
            numberOfConfirmedTransactions === transactionConfirmationTarget
          }
          transactionError={transactionError}
          stepComplete={tokensMinted}
        >
          Tokens minted
          <BlockExplorerLink transactionHash={transactionHash} />
        </TransactionStep>
        <div
          className={
            'flex flex-row items-center justify-between bg-gray-200 px-2 py-4 my-2 rounded-2xl'
          }
        >
          <div>Transaction status</div>
          <div>{transactionStatus}</div>
        </div>
        <TransactionError transactionError={transactionError} />
        <div className={'text-lg mt-2 font-bold'}>
          {message.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
          {transactionError ? <p style={{ color: 'red' }}>{transactionError}</p> : null}
        </div>
      </div>
    </>
  );
}

export default RenBridge;
