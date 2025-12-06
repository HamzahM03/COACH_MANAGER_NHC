export type Expense = {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount_cents: number;
  created_at: string;
};
