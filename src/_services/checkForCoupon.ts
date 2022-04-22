import axios, { AxiosError } from 'axios';

// remove param from url
const removeParamFromUrl = (param: string) => {
  const currentUrlParams = window.location.search;
  const params = new URLSearchParams(currentUrlParams);
  params.delete(param);
  const newUrl = window.location.origin + window.location.pathname + '?' + params.toString();
  window.history.pushState({}, '', newUrl);
};

export const checkForCouponAndRedeem = async (
  userAddress: string,
  isOnboardingComplete: boolean
): Promise<boolean> => {
  const currentUrlParams = window.location.search;
  const params = new URLSearchParams(currentUrlParams);
  const couponCode = params.get('coupon');
  if (couponCode && userAddress && !isOnboardingComplete) {
    let isSuccess = false;
    try {
      const response = await axios.post('https://coupon-pinger.mellodefi.workers.dev/', {
        coupon: couponCode,
        wallet: userAddress
      });
      console.log(response.statusText);
      isSuccess = true;
    } catch (err) {
      const errors = err as Error | AxiosError;
      if (!axios.isAxiosError(errors)) {
        console.error(errors);
      } else {
        console.log(errors.response?.data.message);
      }
    }
    removeParamFromUrl('coupon');
    return isSuccess;
  }
  return false;
};
