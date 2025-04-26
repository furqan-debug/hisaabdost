
import { Edit, Save } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { PercentageChange } from "./PercentageChange";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface EditableIncomeCardProps {
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  percentageChange: number;
  formatCurrency: (value: number, currencyCode?: string) => string;
  currencyCode: string;
}

export const EditableIncomeCard = ({
  monthlyIncome,
  setMonthlyIncome,
  percentageChange,
  formatCurrency,
  currencyCode
}: EditableIncomeCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome);
  const { user } = useAuth();

  const handleIncomeChange = (value: number) => {
    setTempIncome(value);
  };

  const saveIncome = async () => {
    try {
      if (!user) return;
      
      const { data: existingBudgets, error: fetchError } = await supabase
        .from('budgets')
        .select('id, monthly_income')
        .eq('user_id', user.id)
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (existingBudgets && existingBudgets.length > 0) {
        const { error } = await supabase
          .from('budgets')
          .update({ monthly_income: tempIncome })
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category: 'General',
            amount: 0,
            period: 'monthly',
            monthly_income: tempIncome
          });
          
        if (error) throw error;
      }
      
      setMonthlyIncome(tempIncome);
      setIsEditing(false);
      
      toast.success("Monthly income updated successfully");
    } catch (error) {
      console.error("Error saving monthly income:", error);
      toast.error("Failed to save monthly income");
    }
  };

  return (
    <StatCard
      title="Monthly Income"
      value={isEditing ? "" : formatCurrency(monthlyIncome, currencyCode)}
      icon={Edit} 
      className="cursor-pointer"
    >
      {isEditing ? (
        <div className="space-y-2">
          <Input
            type="number"
            value={tempIncome || 0}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleIncomeChange(value ? parseInt(value, 10) : 0);
            }}
            className="h-8 text-base pr-2"
            min={0}
            autoFocus
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="w-full h-7 text-xs" 
              onClick={saveIncome}
            >
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-7 text-xs" 
              onClick={() => {
                setIsEditing(false);
                setTempIncome(monthlyIncome);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PercentageChange value={percentageChange} />
          <div 
            className="absolute top-3 right-3 cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} />
          </div>
        </>
      )}
    </StatCard>
  );
};
