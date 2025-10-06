import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePendingInvitations } from "@/hooks/usePendingInvitations";
import { UserPlus, Clock, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const PendingInvitations = () => {
  const { invitations, isLoading, acceptInvitation, rejectInvitation, isAccepting, isRejecting } = usePendingInvitations();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">Loading invitations...</p>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Family Invitations</CardTitle>
          <Badge variant="secondary">{invitations.length}</Badge>
        </div>
        <CardDescription>
          You have pending invitations to join families
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex-1">
              <p className="font-medium">
                {invitation.inviter_name} invited you to join
              </p>
              <p className="text-lg font-semibold text-primary">
                {invitation.family_name}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => acceptInvitation(invitation.id)}
                disabled={isAccepting || isRejecting}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectInvitation(invitation.id)}
                disabled={isAccepting || isRejecting}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
