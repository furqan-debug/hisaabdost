import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export interface LoanInstallment {
  id: string;
  loan_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: InstallmentStatus;
  paid_at: string | null;
  created_at: string;
}

export const useLoanInstallments = (loanId: string) => {
  return useQuery({
    queryKey: ['loan-installments', loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_installments')
        .select('*')
        .eq('loan_id', loanId)
        .order('installment_number', { ascending: true });

      if (error) throw error;
      return data as LoanInstallment[];
    },
    enabled: !!loanId,
  });
};

export const useMarkInstallmentPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, loanId }: { id: string; loanId: string }) => {
      const { data, error } = await supabase
        .from('loan_installments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loan-installments', variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Installment marked as paid');
    },
    onError: () => {
      toast.error('Failed to update installment');
    },
  });
};
