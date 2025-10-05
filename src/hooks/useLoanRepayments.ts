import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LoanRepayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at: string;
}

export interface RepaymentInput {
  loan_id: string;
  amount: number;
  payment_date?: string;
  note?: string;
}

export const useLoanRepayments = (loanId: string) => {
  return useQuery({
    queryKey: ['loan-repayments', loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as LoanRepayment[];
    },
    enabled: !!loanId,
  });
};

export const useAddRepayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RepaymentInput) => {
      // Get current loan data
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', input.loan_id)
        .single();

      if (loanError) throw loanError;

      // Validate payment amount
      if (input.amount > loan.remaining_amount) {
        throw new Error('Payment amount exceeds remaining balance');
      }

      // Insert repayment
      const { data: repayment, error: repaymentError } = await supabase
        .from('loan_repayments')
        .insert({
          loan_id: input.loan_id,
          amount: input.amount,
          payment_date: input.payment_date || new Date().toISOString().split('T')[0],
          note: input.note || null,
        })
        .select()
        .single();

      if (repaymentError) throw repaymentError;

      // Update loan's remaining amount and status
      const newRemainingAmount = loan.remaining_amount - input.amount;
      const newStatus = newRemainingAmount === 0 
        ? 'fully_paid' 
        : newRemainingAmount < loan.amount 
          ? 'partially_paid' 
          : 'active';

      const { error: updateError } = await supabase
        .from('loans')
        .update({
          remaining_amount: newRemainingAmount,
          status: newStatus,
        })
        .eq('id', input.loan_id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: loan.user_id,
        action_type: 'loan_repayment',
        action_description: `Repaid ₨${input.amount} to ${loan.person_name}`,
        amount: input.amount,
        metadata: { loan_id: input.loan_id, person_name: loan.person_name },
      });

      return repayment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loan-repayments', variables.loan_id] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-summary'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
};

export const useDeleteRepayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, loanId }: { id: string; loanId: string }) => {
      // Get repayment data
      const { data: repayment, error: repaymentError } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('id', id)
        .single();

      if (repaymentError) throw repaymentError;

      // Delete repayment
      const { error: deleteError } = await supabase
        .from('loan_repayments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Get loan data
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loanError) throw loanError;

      // Restore the amount back to loan
      const newRemainingAmount = loan.remaining_amount + repayment.amount;
      const newStatus = newRemainingAmount >= loan.amount 
        ? 'active' 
        : newRemainingAmount > 0 
          ? 'partially_paid' 
          : 'fully_paid';

      const { error: updateError } = await supabase
        .from('loans')
        .update({
          remaining_amount: newRemainingAmount,
          status: newStatus,
        })
        .eq('id', loanId);

      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loan-repayments', variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-summary'] });
      toast.success('Payment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete payment');
    },
  });
};
