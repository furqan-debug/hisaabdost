
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useFinny } from "@/components/finny/FinnyProvider";

export function DangerZone() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { resetChat } = useFinny(); // Get resetChat from Finny context

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to reset your data");
        setIsResetting(false);
        return;
      }
      
      // Delete expenses
      await supabase.from('expenses').delete().eq('user_id', user.id);
      toast.info("Deleting expenses...");
      
      // Delete budget data
      await supabase.from('budgets').delete().eq('user_id', user.id);
      
      // Delete budget alerts
      await supabase.from('budget_alerts').delete().eq('user_id', user.id);
      
      // Delete goals
      await supabase.from('goals').delete().eq('user_id', user.id);
      
      // First, find all receipt extraction IDs for this user
      toast.info("Deleting receipt data...");
      const { data: receipts } = await supabase
        .from('receipt_extractions')
        .select('id')
        .eq('user_id', user.id);
      
      // Delete receipt items for each receipt extraction
      if (receipts && receipts.length > 0) {
        // Create an array of receipt IDs for the IN clause
        const receiptIds = receipts.map(receipt => receipt.id);
        
        // Batch delete all receipt items using the IN clause
        await supabase
          .from('receipt_items')
          .delete()
          .in('receipt_id', receiptIds);
          
        console.log(`Deleted receipt items for ${receiptIds.length} receipts`);
      }
      
      // Now delete all receipt extractions for this user
      await supabase
        .from('receipt_extractions')
        .delete()
        .eq('user_id', user.id);
      
      // Delete stored files in the 'receipts' storage bucket if it exists
      try {
        // Get list of files in user's folder in storage
        const { data: files } = await supabase.storage
          .from('receipts')
          .list(`users/${user.id}`);
          
        if (files && files.length > 0) {
          // Delete each file in the user's storage folder
          for (const file of files) {
            await supabase.storage
              .from('receipts')
              .remove([`users/${user.id}/${file.name}`]);
          }
          console.log(`Deleted ${files.length} receipt files from storage`);
        }
      } catch (storageError) {
        // If bucket doesn't exist or other storage error, just log and continue
        console.log("Storage cleanup skipped:", storageError);
      }
      
      // Reset profile to initial state (keep profile but mark onboarding as incomplete)
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null
        })
        .eq('id', user.id);
      
      // Clear local storage data
      localStorage.removeItem('monthsData');
      localStorage.removeItem('currency');
      localStorage.removeItem('theme');
      
      // Reset Finny chat history
      localStorage.removeItem('finny_chat_messages');
      
      // Explicitly reset the Finny chat state
      if (resetChat) {
        resetChat();
      }
      
      toast.success("All data has been successfully reset");
      
      // Close dialog and navigate to dashboard
      setIsResetDialogOpen(false);
      
      // First navigate to dashboard
      navigate('/app/dashboard');
      
      // Then reload the page after a short delay to ensure navigation completes
      setTimeout(() => {
        window.location.reload();
      }, 300);
      
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("There was an error resetting your data");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="border-t p-4">
      <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Actions here can't be undone. Be careful.
      </p>
      
      <Button 
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => setIsResetDialogOpen(true)}
      >
        Reset App Data
      </Button>
      
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all your data including expenses, budgets, goals, and uploaded receipts. 
              Your account will remain, but you'll need to go through the onboarding process again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleResetData();
              }}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? "Resetting..." : "Yes, reset everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
