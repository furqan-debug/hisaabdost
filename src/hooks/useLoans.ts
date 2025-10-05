import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type LoanType = 'i_gave' | 'i_took';
export type LoanStatus = 'active' | 'partially_paid' | 'fully_paid';

export interface Loan {
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  loan_type: LoanType;
  status: LoanStatus;
  due_date: string | null;
  note: string | null;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
}

export interface LoanInput {
  person_name: string;
  amount: number;
  loan_type: LoanType;
  due_date?: string;
  note?: string;
  installments?: {
    count: number;
    frequency: 'weekly' | 'bi-weekly' | 'monthly';
  };
}

interface LoanFilters {
  type?: LoanType;
  status?: LoanStatus;
}

export const useLoans = (filters?: LoanFilters) => {
  return useQuery({
    queryKey: ['loans', filters],
    queryFn: async () => {
      let query = supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('loan_type', filters.type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Loan[];
    },
  });
};

export const useLoanSummary = () => {
  return useQuery({
    queryKey: ['loan-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('loan_type, remaining_amount, status');

      if (error) throw error;

      const activeLoans = data.filter(loan => loan.status !== 'fully_paid');
      
      const youWillReceive = activeLoans
        .filter(loan => loan.loan_type === 'i_gave')
        .reduce((sum, loan) => sum + Number(loan.remaining_amount), 0);

      const youOwe = activeLoans
        .filter(loan => loan.loan_type === 'i_took')
        .reduce((sum, loan) => sum + Number(loan.remaining_amount), 0);

      const netBalance = youWillReceive - youOwe;

      return {
        youWillReceive,
        youOwe,
        netBalance,
        totalActive: activeLoans.length,
      };
    },
  });
};

export const useAddLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoanInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const loanData = {
        user_id: user.id,
        person_name: input.person_name,
        amount: input.amount,
        loan_type: input.loan_type,
        due_date: input.due_date || null,
        note: input.note || null,
        remaining_amount: input.amount,
        status: 'active' as LoanStatus,
      };

      const { data: loan, error } = await supabase
        .from('loans')
        .insert(loanData)
        .select()
        .single();

      if (error) throw error;

      // If installments are requested, create them
      if (input.installments && input.installments.count > 1 && loan) {
        const installmentAmount = input.amount / input.installments.count;
        const { frequency, count } = input.installments;
        
        const installments = [];
        const baseDate = input.due_date ? new Date(input.due_date) : new Date();
        
        for (let i = 0; i < count; i++) {
          const dueDate = new Date(baseDate);
          
          if (frequency === 'weekly') {
            dueDate.setDate(dueDate.getDate() + (i * 7));
          } else if (frequency === 'bi-weekly') {
            dueDate.setDate(dueDate.getDate() + (i * 14));
          } else {
            dueDate.setMonth(dueDate.getMonth() + i);
          }

          installments.push({
            loan_id: loan.id,
            installment_number: i + 1,
            amount: installmentAmount,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pending',
          });
        }

        const { error: installmentError } = await supabase
          .from('loan_installments')
          .insert(installments);

        if (installmentError) throw installmentError;
      }

      return loan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-summary'] });
      toast.success('Loan added successfully');
    },
    onError: (error) => {
      console.error('Error adding loan:', error);
      toast.error('Failed to add loan');
    },
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Loan> }) => {
      const { data, error } = await supabase
        .from('loans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-summary'] });
      toast.success('Loan updated successfully');
    },
    onError: () => {
      toast.error('Failed to update loan');
    },
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-summary'] });
      toast.success('Loan deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete loan');
    },
  });
};
