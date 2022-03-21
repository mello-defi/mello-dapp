import { createClient } from '@supabase/supabase-js';
import { Transaction } from '_interfaces/db';

// @ts-ignore
const supabaseUrl: string = process.env.REACT_APP_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey: string = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function logTransactionHash (hash: string, chainId: number) {
  const transaction: Transaction = {
    hash: hash.toLowerCase(),
    chain_id: chainId
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