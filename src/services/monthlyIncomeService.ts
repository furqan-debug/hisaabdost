
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export class MonthlyIncomeService {
  /**
   * Get monthly income for a specific month
   */
  static async getMonthlyIncome(
    userId: string, 
    monthDate: Date, 
    familyId?: string | null, 
    isPersonalMode?: boolean
  ): Promise<number> {
    const monthKey = format(monthDate, 'yyyy-MM');
    
    try {
      console.log("Fetching monthly income for:", userId, monthKey, "Mode:", isPersonalMode ? 'personal' : `family: ${familyId}`);
      
      // First check the new monthly_incomes table
      let monthlyIncomeData, monthlyError;
      
      // Filter by family context
      if (isPersonalMode) {
        const result = await supabase
          .from('monthly_incomes')
          .select('income_amount')
          .eq('user_id', userId)
          .is('family_id', null)
          .eq('month_year', monthKey)
          .maybeSingle();
        monthlyIncomeData = result.data;
        monthlyError = result.error;
      } else if (familyId) {
        const result = await supabase
          .from('monthly_incomes')
          .select('income_amount')
          .eq('family_id', familyId as string)
          .eq('month_year', monthKey)
          .maybeSingle();
        monthlyIncomeData = result.data;
        monthlyError = result.error;
      } else {
        const result = await supabase
          .from('monthly_incomes')
          .select('income_amount')
          .eq('user_id', userId)
          .eq('month_year', monthKey)
          .maybeSingle();
        monthlyIncomeData = result.data;
        monthlyError = result.error;
      }
        
      if (!monthlyError && monthlyIncomeData?.income_amount) {
        console.log("Found monthly income:", monthlyIncomeData.income_amount);
        return Number(monthlyIncomeData.income_amount);
      }
      
      // Fallback to profiles table for current month
      const currentMonth = format(new Date(), 'yyyy-MM');
      if (monthKey === currentMonth) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('monthly_income')
          .eq('id', userId)
          .maybeSingle();
          
        if (!profileError && profileData?.monthly_income) {
          // Copy to monthly_incomes table for future use
          await this.setMonthlyIncome(userId, monthDate, Number(profileData.monthly_income));
          return Number(profileData.monthly_income);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching monthly income:', error);
      return 0;
    }
  }

  /**
   * Set monthly income for a specific month
   */
  static async setMonthlyIncome(
    userId: string, 
    monthDate: Date, 
    amount: number, 
    familyId?: string | null
  ): Promise<boolean> {
    const monthKey = format(monthDate, 'yyyy-MM');
    
    try {
      console.log("Setting monthly income:", userId, monthKey, amount, "Family:", familyId);
      
      // Update in monthly_incomes table using proper upsert with onConflict
      const upsertData: any = {
        user_id: userId,
        month_year: monthKey,
        income_amount: amount,
        updated_at: new Date().toISOString()
      };
      
      // Add family_id if in family mode
      if (familyId) {
        upsertData.family_id = familyId;
      }
      
      const { error: monthlyError } = await supabase
        .from('monthly_incomes')
        .upsert(upsertData, {
          onConflict: 'user_id,month_year'
        });

      if (monthlyError) {
        console.error('Error updating monthly income:', monthlyError);
        return false;
      }

      // Also update profiles table if it's the current month
      const currentMonth = format(new Date(), 'yyyy-MM');
      if (monthKey === currentMonth) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ monthly_income: amount })
          .eq('id', userId);
          
        if (profileError) {
          console.warn('Could not update profiles table:', profileError);
        }
      }

      // Trigger UI refresh
      window.dispatchEvent(new CustomEvent('income-updated', { 
        detail: { userId, monthKey, amount } 
      }));

      return true;
    } catch (error) {
      console.error('Error setting monthly income:', error);
      return false;
    }
  }

  /**
   * Get all monthly incomes for a user
   */
  static async getAllMonthlyIncomes(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('monthly_incomes')
        .select('month_year, income_amount')
        .eq('user_id', userId)
        .order('month_year', { ascending: false });

      if (error) {
        console.error('Error fetching all monthly incomes:', error);
        return {};
      }

      const incomes: Record<string, number> = {};
      data?.forEach(item => {
        incomes[item.month_year] = Number(item.income_amount);
      });

      return incomes;
    } catch (error) {
      console.error('Error fetching all monthly incomes:', error);
      return {};
    }
  }
}
