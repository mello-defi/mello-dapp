import { createClient } from '@supabase/supabase-js';
import { Transaction, TransactionAction } from '_interfaces/db';
import { TransactionServices } from '_enums/db';

// @ts-ignore
const supabaseUrl: string = process.env.REACT_APP_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey: string = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function logTransaction(
  hash: string,
  chainId: number,
  service: TransactionServices,
  action: TransactionAction,
  amount?: string,
  symbol?: string
) {
  const transaction: Transaction = {
    hash: hash.toLowerCase(),
    chain_id: chainId,
    service,
    action,
    amount,
    symbol
  };
  try {
    await supabase
      .from<Transaction>('transactions')
      .insert([transaction])
      .then((data) => {
        console.log(data);
      });
  } catch (error) {
    console.error(error);
  }
}
