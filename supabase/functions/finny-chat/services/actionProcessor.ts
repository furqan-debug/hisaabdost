
// Import Supabase client type
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get today's date in YYYY-MM-DD format
function getTodaysDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Validate and format date
function validateAndFormatDate(inputDate: string): string {
  if (!inputDate) return getTodaysDate();
  
  try {
    // Check if it's already in ISO format YYYY-MM-DD
    if (inputDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(inputDate);
      const year = date.getFullYear();
      
      // If the year is unreasonable (too old or far future), use current date
      if (year < 2020 || year > 2030) {
        console.log(`Year ${year} is out of reasonable range, using today's date`);
        return getTodaysDate();
      }
      
      return inputDate;
    }
    
    // Try to parse the date
    const date = new Date(inputDate);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      
      // If the year is unreasonable, use current date
      if (year < 2020 || year > 2030) {
        console.log(`Year ${year} is out of reasonable range, using today's date`);
        return getTodaysDate();
      }
      
      // Format as YYYY-MM-DD
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch (error) {
    console.error("Date validation error:", error);
  }
  
  // Default to today if parsing fails
  return getTodaysDate();
}

// Process user actions
export async function processAction(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  if (!action || !action.type) {
    throw new Error("Invalid action format");
  }

  console.log("Processing action:", action);

  try {
    switch (action.type) {
      case "add_expense": {
        // Validate and ensure correct date format
        const validatedDate = validateAndFormatDate(action.date);
        
        // Always log the final date being used
        console.log(`Adding expense with date: ${validatedDate} (Original input: ${action.date})`);
        
        // Insert the expense
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            user_id: userId,
            amount: action.amount,
            category: action.category,
            description: action.description || "",
            date: validatedDate,
            payment: action.paymentMethod || "Card",
            notes: action.notes || null,
            is_recurring: action.isRecurring || false,
          })
          .select();

        if (error) throw error;

        // Format response based on action details
        const formattedDate = validatedDate === getTodaysDate() 
          ? "today" 
          : `on ${validatedDate}`;
          
        return `I've added the ${action.category} expense of ${action.amount} for ${action.description || "your purchase"} ${formattedDate}.`;
      }

      case "update_expense": {
        const { id, ...updateData } = action;
        
        // Validate date if present in the update
        if (updateData.date) {
          updateData.date = validateAndFormatDate(updateData.date);
        }
        
        const { error } = await supabase
          .from("expenses")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId);

        if (error) throw error;

        return `I've updated the expense details for you.`;
      }

      case "delete_expense": {
        // Delete by exact ID if provided
        if (action.id) {
          const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", action.id)
            .eq("user_id", userId);

          if (error) throw error;

          return `I've deleted the expense for you.`;
        } 
        // Delete by category & date
        else if (action.category) {
          let query = supabase
            .from("expenses")
            .delete()
            .eq("user_id", userId)
            .eq("category", action.category);

          // Add date filter if provided
          if (action.date) {
            const validDate = validateAndFormatDate(action.date);
            query = query.eq("date", validDate);
          }

          const { error } = await query;
          if (error) throw error;

          const dateMsg = action.date ? ` from ${action.date}` : "";
          return `I've deleted the ${action.category} expense${dateMsg}.`;
        } else {
          throw new Error("Not enough information to delete an expense.");
        }
      }

      case "set_budget":
      case "update_budget": {
        // Check if budget exists
        const { data: existingBudget, error: fetchError } = await supabase
          .from("budgets")
          .select("id")
          .eq("user_id", userId)
          .eq("category", action.category)
          .maybeSingle();

        if (fetchError) throw fetchError;

        // Set default period to "monthly" if not specified
        const period = action.period || "monthly";

        // Update or insert based on existence
        if (existingBudget) {
          const { error } = await supabase
            .from("budgets")
            .update({ amount: action.amount, period: period })
            .eq("id", existingBudget.id);

          if (error) throw error;
          return `I've updated your ${action.category} budget to ${action.amount}.`;
        } else {
          const { error } = await supabase.from("budgets").insert({
            user_id: userId,
            category: action.category,
            amount: action.amount,
            period: period,
            carry_forward: false
          });

          if (error) throw error;
          return `I've set a budget of ${action.amount} for ${action.category}.`;
        }
      }

      case "delete_budget": {
        const { error } = await supabase
          .from("budgets")
          .delete()
          .eq("user_id", userId)
          .eq("category", action.category);

        if (error) throw error;

        return `I've deleted the ${action.category} budget.`;
      }

      case "set_goal": {
        // Parse and validate the deadline
        let deadlineDate: string | null = null;
        
        if (action.deadline) {
          try {
            // Handle natural language dates
            if (typeof action.deadline === 'string') {
              if (action.deadline.toLowerCase().includes('end of month') || 
                  action.deadline.toLowerCase().includes('month end')) {
                const today = new Date();
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                deadlineDate = lastDay.toISOString().split('T')[0];
              } 
              else if (action.deadline.toLowerCase().includes('end of year') || 
                       action.deadline.toLowerCase().includes('year end')) {
                const today = new Date();
                deadlineDate = `${today.getFullYear()}-12-31`;
              }
              else if (action.deadline.toLowerCase().includes('next month')) {
                const today = new Date();
                today.setMonth(today.getMonth() + 1);
                deadlineDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              }
              else {
                // Try to parse as date
                const date = new Date(action.deadline);
                if (!isNaN(date.getTime())) {
                  deadlineDate = date.toISOString().split('T')[0];
                }
              }
            }
          } catch (e) {
            console.error("Error parsing goal deadline:", e);
            deadlineDate = null;
          }
        }
        
        // Set a default deadline of 3 months from now if parsing failed
        if (!deadlineDate) {
          const threeMonthsLater = new Date();
          threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
          deadlineDate = threeMonthsLater.toISOString().split('T')[0];
        }

        // Insert the goal
        const { error } = await supabase.from("goals").insert({
          user_id: userId,
          title: action.title || "Savings Goal",
          target_amount: action.targetAmount,
          current_amount: 0, // Start with 0
          deadline: deadlineDate,
          category: action.category || "Savings",
        });

        if (error) throw error;

        return `I've created your ${action.title || 'savings'} goal of ${action.targetAmount} to reach by ${deadlineDate}.`;
      }

      case "update_goal": {
        const updateData: any = {};
        
        // Only include fields that are provided
        if (action.title) updateData.title = action.title;
        if (action.targetAmount !== undefined) updateData.target_amount = action.targetAmount;
        if (action.currentAmount !== undefined) updateData.current_amount = action.currentAmount;
        if (action.category) updateData.category = action.category;
        
        // Parse deadline if provided
        if (action.deadline) {
          try {
            const date = new Date(action.deadline);
            if (!isNaN(date.getTime())) {
              updateData.deadline = date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error("Error parsing updated goal deadline:", e);
          }
        }
        
        // Update the goal
        const { error } = await supabase
          .from("goals")
          .update(updateData)
          .eq("id", action.id)
          .eq("user_id", userId);

        if (error) throw error;
        
        return `I've updated your savings goal.`;
      }

      case "delete_goal": {
        let query = supabase
          .from("goals")
          .delete()
          .eq("user_id", userId);
          
        if (action.id) {
          query = query.eq("id", action.id);
        } else if (action.title) {
          query = query.ilike("title", `%${action.title}%`);
        } else {
          throw new Error("Please provide a goal ID or title to delete.");
        }
        
        const { error } = await query;
        if (error) throw error;
        
        return `I've deleted the goal for you.`;
      }

      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  } catch (error) {
    console.error(`Error processing ${action.type} action:`, error);
    throw new Error(`Failed to ${action.type.replace('_', ' ')}: ${error.message}`);
  }
}
