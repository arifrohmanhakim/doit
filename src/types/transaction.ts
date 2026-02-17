export type TransactionType = 'IN' | 'OUT';

export type Transaction = {
  id: number;
  categoryId: number;
  category: string;
  amount: number;
  date: string;
  type: TransactionType;
  description: string;
};
