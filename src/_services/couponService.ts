import axios from 'axios';

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
) => {
  const currentUrlParams = window.location.search;
  const params = new URLSearchParams(currentUrlParams);
  const couponCode = params.get('coupon');
  if (couponCode && userAddress && !isOnboardingComplete) {
    const response = await axios.post('https://coupon-pinger.mellodefi.workers.dev/', {
      coupon: couponCode,
      wallet: userAddress
    });
    console.log(response);
    removeParamFromUrl('coupon');
  }
};
