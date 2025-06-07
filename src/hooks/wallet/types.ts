
export type WalletAddition = {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  fund_type?: 'manual' | 'carryover';
  carryover_month?: string;
  is_deleted_by_user?: boolean;
};

export type WalletAdditionInput = {
  amount: number;
  description?: string;
  date?: string;
  fund_type?: 'manual' | 'carryover';
  carryover_month?: string;
};
