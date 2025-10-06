import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface PendingInvitation {
  id: string;
  family_id: string;
  family_name: string;
  inviter_name: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

export const usePendingInvitations = () => {
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("family_invitations")
        .select("id, family_id, family_name, inviter_name, invited_by, expires_at, created_at")
        .eq("invited_user_id", user.id)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PendingInvitation[];
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.functions.invoke("accept-family-invitation", {
        body: { token: invitationId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["families"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "You've joined the family successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive",
      });
    },
  });

  const rejectInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.functions.invoke("reject-family-invitation", {
        body: { invitationId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      toast({
        title: "Invitation Declined",
        description: "You've declined the family invitation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject invitation",
        variant: "destructive",
      });
    },
  });

  return {
    invitations,
    isLoading,
    acceptInvitation: acceptInvitation.mutate,
    rejectInvitation: rejectInvitation.mutate,
    isAccepting: acceptInvitation.isPending,
    isRejecting: rejectInvitation.isPending,
  };
};
