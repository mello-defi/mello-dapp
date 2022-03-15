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
import SignTestMessage from '_pages/onboarding/SignTestMessage';
import TermsAndConditions from '_pages/onboarding/TermsAndConditions';

export const stepMintNft: OnboardingStep = {
  number: 8,
  title: 'Mint mello NFT',
  nextStep: null,
  description: {
    whatIsRequired: 'Mint your course completion NFT',
    whyIsRequired: 'This NFT will prove you have completed the onboarding so won\'t have to do it again in future.<br/><br/>View the NFT here'
  }
};
export const stepBorrowAave: OnboardingStep = {
  number: 7,
  title: 'Borrow $USDC from Aave',
  nextStep: stepMintNft,
  component: AaveReserve,
  componentProps: {
    aaveSection: AaveSection.Borrow,
    reserveSymbol: CryptoCurrencySymbol.USDC
  },
  description: {
    whatIsRequired: 'Borrow $USDC from Aave',
    whyIsRequired:
      'Now that you have deposited $wBTC as collateral, you can now borrow against it.<br/><br/>Learn more about Aave <a href="https://docs.mellodefi.com/introduction/onboarding/borrow-using-aave/">here</a>'
  }
};

export const stepDepositAave: OnboardingStep = {
  number: 6,
  title: 'Deposit $wBTC into Aave',
  nextStep: stepBorrowAave,
  component: AaveReserve,
  componentProps: {
    aaveSection: AaveSection.Deposit,
    reserveSymbol: CryptoCurrencySymbol.WBTC
  },
  description: {
    whatIsRequired: 'Deposit your newly swapped $wBTC into the Aave lending protocol',
    whyIsRequired:
      'By depositing your tokens into Aave you can passively earn interest, and use deposits as collateral to take our loans against.<br/><br/>Learn more about Aave <a href="https://docs.mellodefi.com/introduction/onboarding/deposit-into-aave /">here</a>'
  }
};

export const stepPerformSwap: OnboardingStep = {
  number: 5,
  title: 'Swap gas token for $wBTC',
  nextStep: stepDepositAave,
  component: Swap,
  componentProps: {
    initialSourceTokenSymbol: CryptoCurrencySymbol.MATIC,
    initialDestinationTokenSymbol: CryptoCurrencySymbol.WBTC
  },
  description: {
    whatIsRequired: 'Swap some $MATIC for $wBTC',
    whyIsRequired:
      'A token swap is the exchanging of one token for another. This allows you to easily exchange tokens when you require a token that you don\'t currently have.<br/><br/>Learn more about token swaps <a href="https://docs.mellodefi.com/introduction/onboarding/swap-tokens/">here</a>'
  }
};
export const stepAddGasToWallet: OnboardingStep = {
  number: 4,
  title: 'Add gas token to wallet',
  nextStep: stepPerformSwap,
  component: FiatOnboarding,
  description: {
    whatIsRequired: 'Deposit some $MATIC into your wallet',
    whyIsRequired:
      "Gas is required to perform transactions on the Polygon network. These fees are minuscule (~$.001) but without them, you can't authorise transactions. mello recommends keeping $5 worth of $MATIC in your wallet at all times.<br/><br/>Learn more about gas tokens <a href='https://docs.mellodefi.com/introduction/onboarding/add-gas-to-wallet/'>here</a>",
    notes: 'We recommend Mt Pellerin for EU customers and Ramp for all non-EU customers'
  }
};
export const stepSignMessage: OnboardingStep = {
  number: 3,
  title: 'Sign test transaction',
  nextStep: stepAddGasToWallet,
  component: SignTestMessage,
  description: {
    whatIsRequired: 'Sign a test transaction',
    whyIsRequired: 'In order to authorize transactions from your crypto wallet, you have to sign them via a popup window. Please click the button below to sign a test transaction',
    notes: 'This transaction doesn\'t incur a gas fee. However, in future signing transactions will incur gas fees that are paid for in the network\'s native token.'
  }
};
// REVIEW - hack, too tightly coupled
export const stepConnectWallet: OnboardingStep = {
  number: 2,
  title: 'Connect Wallet',
  nextStep: stepSignMessage,
  description: {
    whatIsRequired: `Connect your non-custodial wallet to mello.
    <br/>
    Don't have a wallet? No problem, follow the links to one of our how-to guides:
    <br/>
    <ul>
      <li>
      <a
        target="_blank"
        rel="noreferrer"
        href='https://docs.mellodefi.com/resources/how-to-guides/wallet-setup-and-use-social-login'>Social Login - How to sign up</a>
      </li>
      <li>
        <a
        target="_blank"
        rel="noreferrer"
        href='https://docs.mellodefi.com/resources/how-to-guides/wallet-setup-and-use-metamask'>Metamask - How to sign up</a>
      </li>
      <li>
      <a
        target="_blank"
        rel="noreferrer"
      href='https://docs.mellodefi.com/resources/how-to-guides/wallet-use-walletconnect'>WalletConnect - How to sign up</ap>
      </li>
  </ul>
    `,
    whyIsRequired: `A wallet is required to interact with the blockchain and access your assets.`,
    notes: "Store seed phrases and passwords securely, mello will never be able to access them!"
  }
};
export const stepTermsAndConditions: OnboardingStep = {
  number: 1,
  title: 'Housekeeping',
  nextStep: stepConnectWallet,
  component: TermsAndConditions,
  description: {
    text: `By connecting a wallet, you agree to mello's <a href='https://docs.mellodefi.com'>Terms of Service</a> and acknowledge that you have read and understand the mello <a href='https://docs.mellodefi.com/disclaimer'>Disclaimer.</a>`
  }
};

const steps: OnboardingStep[] = [
  stepTermsAndConditions,
  stepConnectWallet,
  stepSignMessage,
  stepAddGasToWallet,
  stepPerformSwap,
  stepDepositAave,
  stepBorrowAave,
  stepMintNft,
];
const initialState: OnboardingState = {
  steps,
  complete: false,
  ongoing: false,
  currentStep: stepTermsAndConditions
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
