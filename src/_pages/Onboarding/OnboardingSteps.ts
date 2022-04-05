import AaveReserveRow from '_components/aave/AaveReserveRow';
import { AaveSection } from '_enums/aave';
import { CryptoCurrencySymbol } from '_enums/currency';
import Swap from '_pages/Swap/Swap';
import FiatOnboarding from '_pages/Fund/FiatOnboarding';
import SignTestMessage from '_pages/Onboarding/SignTestMessage';
import TermsAndConditions from '_pages/Onboarding/TermsAndConditions';
import { FunctionComponent } from 'react';
import StepConnectWallet from '_pages/Onboarding/StepDescriptions/StepConnectWallet';
import StepSignMessage from '_pages/Onboarding/StepDescriptions/StepSignMessage';
import StepAddGasToken from '_pages/Onboarding/StepDescriptions/StepAddGasToken';
import StepSwap from '_pages/Onboarding/StepDescriptions/StepSwap';
import StepDepositAave from '_pages/Onboarding/StepDescriptions/StepDepositAave';
import StepBorrowAave from '_pages/Onboarding/StepDescriptions/StepBorrowAave';
import StepMintNft from '_pages/Onboarding/StepDescriptions/StepMintNft';
import StepTermsAndConditions from '_pages/Onboarding/StepDescriptions/StepTermsAndConditions';
import MintNft from '_pages/Onboarding/MintNft';
import PoolRow from '_components/balancer/PoolRow';
import StepInvestBalancer from '_pages/Onboarding/StepDescriptions/StepInvestBalancer';
import StepComplete from '_pages/Onboarding/StepDescriptions/StepComplete';
import CompleteOnboarding from '_pages/Onboarding/CompleteOnboarding';

export interface OnboardingStep {
  number: number;
  title: string;
  nextStep: OnboardingStep | null;
  actionComponent?: FunctionComponent<any>;
  actionComponentProps?: any;
  descriptionComponent: FunctionComponent<any>;
}
export const stepCompleteOnboarding: OnboardingStep = {
  number: 10,
  title: 'Complete',
  nextStep: null,
  actionComponent: CompleteOnboarding,
  descriptionComponent: StepComplete
};
export const stepMintNft: OnboardingStep = {
  number: 9,
  title: 'Mint mello NFT',
  nextStep: stepCompleteOnboarding,
  actionComponent: MintNft,
  descriptionComponent: StepMintNft
};
export const stepInvestBalancer: OnboardingStep = {
  number: 8,
  title: 'Invest USDC',
  nextStep: stepMintNft,
  actionComponent: PoolRow,
  actionComponentProps: {
    poolId: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012',
  },
  descriptionComponent: StepInvestBalancer
};
export const stepBorrowAave: OnboardingStep = {
  number: 7,
  title: 'Borrow USDC from Aave',
  nextStep: stepInvestBalancer,
  actionComponent: AaveReserveRow,
  actionComponentProps: {
    aaveSection: AaveSection.Borrow,
    reserveSymbol: CryptoCurrencySymbol.USDC
  },
  descriptionComponent: StepBorrowAave
};

export const stepDepositAave: OnboardingStep = {
  number: 6,
  title: 'Supply WBTC to Aave',
  nextStep: stepBorrowAave,
  actionComponent: AaveReserveRow,
  actionComponentProps: {
    aaveSection: AaveSection.Deposit,
    reserveSymbol: CryptoCurrencySymbol.WBTC
  },
  descriptionComponent: StepDepositAave
};

export const stepPerformSwap: OnboardingStep = {
  number: 5,
  title: 'Swap gas token for WBTC',
  nextStep: stepDepositAave,
  actionComponent: Swap,
  actionComponentProps: {
    initialSourceTokenSymbol: CryptoCurrencySymbol.MATIC,
    initialDestinationTokenSymbol: CryptoCurrencySymbol.WBTC
  },
  descriptionComponent: StepSwap
};
export const stepAddGasToWallet: OnboardingStep = {
  number: 4,
  title: 'Add gas token to fuel wallet',
  nextStep: stepPerformSwap,
  actionComponent: FiatOnboarding,
  descriptionComponent: StepAddGasToken
};
export const stepSignMessage: OnboardingStep = {
  number: 3,
  title: 'Sign test transaction',
  nextStep: stepAddGasToWallet,
  actionComponent: SignTestMessage,
  descriptionComponent: StepSignMessage
};
export const stepConnectWallet: OnboardingStep = {
  number: 2,
  title: 'Connect wallet',
  nextStep: stepSignMessage,
  descriptionComponent: StepConnectWallet
};
export const stepTermsAndConditions: OnboardingStep = {
  number: 1,
  title: 'Housekeeping',
  nextStep: stepConnectWallet,
  actionComponent: TermsAndConditions,
  descriptionComponent: StepTermsAndConditions
};

export const steps: OnboardingStep[] = [
  stepTermsAndConditions,
  stepConnectWallet,
  stepSignMessage,
  stepAddGasToWallet,
  stepPerformSwap,
  stepDepositAave,
  stepBorrowAave,
  stepInvestBalancer,
  stepMintNft,
  stepCompleteOnboarding
];
