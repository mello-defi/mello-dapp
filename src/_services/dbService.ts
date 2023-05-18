// import { createClient } from '@supabase/supabase-js';
import { Transaction, TransactionAction } from '_interfaces/db';
import { TransactionServices } from '_enums/db';


export async function logTransaction(hash: string, chainId: number, service: TransactionServices, action: TransactionAction, amount?: string, symbol?: string) {
  // const transaction: Transaction = {
  //   hash: hash.toLowerCase(),
  //   chain_id: chainId,
  //   service,
  //   action,
  //   amount,
  //   symbol,
  // };
  // try {
  //   await supabase
  //     .from<Transaction>('transactions')
  //     .insert([transaction])
  //     .then((data) => {
  //       console.log(data);
  //     });
  // } catch (error) {
  //   console.error(error);
  // }
}
