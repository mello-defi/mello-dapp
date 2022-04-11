import { useEffect, useRef } from 'react';

export default function useInterval(callback: () => void, delay: number) {
  const intervalRef = useRef<any>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => callbackRef.current(), delay);

    return () => window.clearInterval(intervalRef.current);
  }, [delay]);

  return intervalRef;
}
