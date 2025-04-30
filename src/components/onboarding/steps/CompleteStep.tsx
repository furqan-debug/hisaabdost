import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { useNavigate } from "react-router-dom";
 
 export function CompleteStep() {
   const navigate = useNavigate();
 
   return (
     <div className="space-y-6">
       <DialogHeader>
         <DialogTitle>You're all set! 🎉</DialogTitle>
         <DialogDescription>
           Thank you for completing the setup. Your personalized experience awaits!
         </DialogDescription>
       </DialogHeader>
 
       <div className="flex justify-end">
         <Button onClick={() => navigate("/app/dashboard")}>
           Get Started
         </Button>
       </div>
     </div>
   );
 }