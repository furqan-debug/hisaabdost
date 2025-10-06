import { useState } from 'react';
import { useFamilyContext } from '@/hooks/useFamilyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Mail, Trash2, Crown, Shield, User } from 'lucide-react';
import { PendingInvitations } from '@/components/family/PendingInvitations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';

export default function Family() {
  const { userFamilies, familyMembers, currentFamily, refetch } = useFamilyContext();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const createFamilyMutation = useMutation({
    mutationFn: async (name: string) => {
      // Explicit authentication check
      if (!user?.id) {
        console.error('User not authenticated:', user);
        throw new Error('You must be logged in to create a family');
      }

      console.log('Creating family with user:', user.id);
      
      // Call the edge function to create the family
      const { data, error } = await supabase.functions.invoke('create-family', {
        body: { name },
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create family');
      }

      if (!data?.family) {
        throw new Error('No family data returned');
      }

      console.log('Family created successfully:', data.family);
      return data.family;
    },
    onSuccess: () => {
      toast.success('Family created successfully!');
      setNewFamilyName('');
      setCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to create family');
      console.error('Create family error:', error);
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!currentFamily?.id) throw new Error('No family selected');
      const { data, error } = await supabase.functions.invoke('invite-family-member', {
        body: { familyId: currentFamily.id, email },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Member added successfully!');
      setInviteEmail('');
      setInviteDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add member');
      console.error('Invite member error:', error);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('family_members')
        .update({ is_active: false })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member removed successfully');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to remove member');
      console.error('Remove member error:', error);
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Family Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your family accounts for shared expense tracking
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Family</DialogTitle>
                <DialogDescription>
                  Create a family account to share expenses with other members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="family-name">Family Name</Label>
                  <Input
                    id="family-name"
                    placeholder="e.g., Smith Family"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createFamilyMutation.mutate(newFamilyName)}
                  disabled={!newFamilyName.trim() || createFamilyMutation.isPending}
                >
                  Create Family
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Invitations */}
        <PendingInvitations />

        {/* Your Families */}
        <Card>
          <CardHeader>
            <CardTitle>Your Families</CardTitle>
            <CardDescription>
              {userFamilies.length === 0
                ? 'You are not part of any family yet'
                : `You are part of ${userFamilies.length} ${userFamilies.length === 1 ? 'family' : 'families'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userFamilies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create your first family to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userFamilies.map((family) => (
                  <div
                    key={family.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{family.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(family.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {currentFamily?.id === family.id && (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Family Members */}
        {currentFamily && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentFamily.name} Members</CardTitle>
                  <CardDescription>
                    {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'}
                  </CardDescription>
                </div>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Family Member</DialogTitle>
                      <DialogDescription>
                        Enter the email address of an existing Hisaab Dost user to add them to {currentFamily.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="member@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => inviteMemberMutation.mutate(inviteEmail)}
                        disabled={!inviteEmail.trim() || inviteMemberMutation.isPending}
                      >
                        Add Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(member.profile?.display_name || member.profile?.full_name || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profile?.display_name || member.profile?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                      {member.role !== 'owner' && member.user_id !== user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this member from the family?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeMemberMutation.mutate(member.id)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
