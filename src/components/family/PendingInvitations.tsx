import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePendingInvitations } from "@/hooks/usePendingInvitations";
import { UserPlus, Clock, Check, X, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PendingInvitations = () => {
  console.log("🔔 PendingInvitations component mounted");
  const { invitations, isLoading, error, refetch, acceptInvitation, rejectInvitation, isAccepting, isRejecting } = usePendingInvitations();
  
  console.log("🔔 PendingInvitations state:", { invitationsCount: invitations?.length, isLoading, error });

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading invitations...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("🔔 Error in PendingInvitations:", error);
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Error Loading Invitations</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load invitations"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    console.log("🔔 No pending invitations to display");
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle>Family Invitations</CardTitle>
            <Badge variant="secondary">{invitations.length}</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          You have pending invitations to join families
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.length > 1 && (
          <Alert>
            <AlertDescription>
              You have {invitations.length} pending invitations. Review each one carefully.
            </AlertDescription>
          </Alert>
        )}
        {invitations.map((invitation) => {
          const expiresAt = new Date(invitation.expires_at);
          const isExpiringSoon = expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000; // Less than 24 hours
          
          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  <span className="text-primary font-semibold">{invitation.inviter_name}</span> invited you to join
                </p>
                <p className="text-xl font-bold text-primary mt-1">
                  {invitation.family_name}
                </p>
                <div className={`flex items-center gap-1 mt-2 text-xs ${isExpiringSoon ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  <Clock className="h-3 w-3" />
                  <span>
                    {isExpiringSoon ? 'Expires soon: ' : 'Expires '}
                    {formatDistanceToNow(expiresAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => acceptInvitation(invitation.id)}
                  disabled={isAccepting || isRejecting}
                  className="gap-1.5"
                >
                  {isAccepting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rejectInvitation(invitation.id)}
                  disabled={isAccepting || isRejecting}
                  className="gap-1.5"
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Decline
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
