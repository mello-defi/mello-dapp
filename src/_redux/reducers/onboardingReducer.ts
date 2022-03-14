import {
  OnboardingActionTypes,
  OnboardingState,
  OnboardingStep,
  SET_IS_COMPLETE,
  SET_IS_ONGOING,
  SET_STEP
} from '_redux/types/onboardingTypes';
import { AaveSection } from '_enums/aave';
import Swap from '_pages/swap/Swap';
import AaveReserve from '_components/aave/AaveReserve';
import { CryptoCurrencySymbol } from '_enums/currency';
import FiatOnboarding from '_pages/fund/FiatOnboarding';

export const stepMintNft: OnboardingStep = {
  number: 7,
  title: 'Mint NFT',
  nextStep: null,
  description: {
    whatIsRequired: 'Mint your course completion NFT',
    whyIsRequired:
      'Congrats, you have made it this far. To complete the course, please mint your reward badge. This NFT will allow us to exclude you from this tutorial when logging onto our platform in future'
  }
};
export const stepBorrowAave: OnboardingStep = {
  number: 6,
  title: 'Borrow Aave',
  nextStep: stepMintNft,
  component: AaveReserve,
  componentProps: {
    aaveSection: AaveSection.Borrow,
    reserveSymbol: CryptoCurrencySymbol.USDC
  },
  description: {
    whatIsRequired: 'Borrow USDC from Aave',
    whyIsRequired:
      'By using your deposited $wBTC as collateral, you can now borrow against it from Aave<br/><br/><a href="https://docs.mellodefi.com/">Learn more about Aave here</a>'
  }
};

export const stepDepositAave: OnboardingStep = {
  number: 5,
  title: 'Deposit Aave',
  nextStep: stepBorrowAave,
  component: AaveReserve,
  componentProps: {
    aaveSection: AaveSection.Deposit,
    reserveSymbol: CryptoCurrencySymbol.WBTC
  },
  description: {
    whatIsRequired: 'Deposit your newly swapped $wBTC into the Aave lending protocol',
    whyIsRequired:
      'By depositing your tokens into Aave you can passively earn interest, and borrow from Aave while using the deposited tokens as collateral.<br/><br/><a href="https://docs.mellodefi.com/">Learn more about Aave here</a>'
  }
};

export const stepPerformSwap: OnboardingStep = {
  number: 4,
  title: 'Swap gas token for $wBTC',
  nextStep: stepDepositAave,
  component: Swap,
  componentProps: {
    initialSourceTokenSymbol: CryptoCurrencySymbol.MATIC,
    initialDestinationTokenSymbol: CryptoCurrencySymbol.WBTC
  },
  description: {
    whatIsRequired: 'Swap your $MATIC for $wBTC',
    whyIsRequired:
      'A token swap is the exchanging of one token for another. This allows you to easily exchange tokens when you require a token that you don\'t currently have.<br/><br/><a href="https://docs.mellodefi.com/">Learn more about token swaps here</a>'
  }
};
export const stepAddGasToWallet: OnboardingStep = {
  number: 3,
  title: 'Add gas to Wallet',
  nextStep: stepPerformSwap,
  component: FiatOnboarding,
  description: {
    whatIsRequired: 'Deposit some $MATIC into your wallet',
    whyIsRequired:
      "In order to transact on mello you need to have some $MATIC to pay for transaction fees on the Polygon network. These fees are minuscule (<$0.01) but without them you can't authorise transactions.<br/><strong>We recommend at least $5 worth</strong>",
    notes: 'We recommend Mt Pellerin for EU customers and Ramp for all non-EU customers'
  }
};
// REVIEW - hack, too tightly coupled
export const stepConnectWallet: OnboardingStep = {
  number: 2,
  title: 'Connect Wallet',
  nextStep: stepAddGasToWallet,
  description: {
    whatIsRequired: 'Connect your non-custodial wallet to mello',
    whyIsRequired: `By creating your wallet, and then connecting it to mello you can utilise our platform<br/>
    Don't have a wallet? No problem, follow the links to one of our how to guides:
    <br/>
    <ul>
    <li>
      <a href='https://docs.mellodefi.com/mello-information/technology-stack/wallet-services'>Metamask - How to sign up (Gitbook Link)</a>
    </li>
    <li>
    <a href='https://docs.mellodefi.com/mello-information/technology-stack/wallet-services'>Social Login - How to sign up (Gitbook Link)</a>
    </li>
    <li>
    <a href='https://docs.mellodefi.com/mello-information/technology-stack/wallet-services'>WalletConnect - How to sign up (Gitbook Link)</a>
    </li>
</ul>
    `,
    notes: "Store seedphrases and passwords securely, mello can't access or control your wallet!"
  }
};
export const stepTermsAndConditions: OnboardingStep = {
  number: 1,
  title: 'Accept Terms and Conditions',
  nextStep: stepConnectWallet,
  description: {
    text: `Do you agree to the terms of service, its policies, and the privacy policy? <a href='https://docs.mellodefi.com/'>See more</a>
<br/>
Disclaimer: Nothing given is financial advice, use mello at your own risk. Further disclaimer <a href='https://docs.mellodefi.com/disclaimer'>https://docs.mellodefi.com/disclaimer</a>
<br/>
`
  }
};

const steps: OnboardingStep[] = [
  {
    ...stepTermsAndConditions,
    nextStep: stepConnectWallet
  },
  {
    ...stepConnectWallet,
    nextStep: stepAddGasToWallet
  },
  {
    ...stepAddGasToWallet,
    nextStep: stepPerformSwap
  },
  {
    ...stepPerformSwap,
    nextStep: stepDepositAave
  },
  {
    ...stepDepositAave,
    nextStep: stepBorrowAave
  },
  {
    ...stepBorrowAave,
    nextStep: stepMintNft
  },
  {
    ...stepMintNft
  }
];
const initialState: OnboardingState = {
  steps,
  complete: false,
  ongoing: false,
  currentStep: stepConnectWallet
};

export const getOnboardingReducer = (
  state: OnboardingState = initialState,
  action: OnboardingActionTypes
): OnboardingState => {
  switch (action.type) {
    case SET_STEP:
      return {
        ...state,
        currentStep: action.payload.step
      };
    case SET_IS_COMPLETE:
      return {
        ...state,
        complete: action.payload.complete
      };
    case SET_IS_ONGOING:
      return {
        ...state,
        ongoing: action.payload.ongoing
      };
    default:
      return state;
  }
};
