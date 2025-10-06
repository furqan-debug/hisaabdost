import { useState } from 'react';
import { useFamilyContext } from '@/hooks/useFamilyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Search } from 'lucide-react';
import { PendingInvitations } from '@/components/family/PendingInvitations';
import { SentInvitations } from '@/components/family/SentInvitations';
import { FamilyCard } from '@/components/family/FamilyCard';
import { MemberCard } from '@/components/family/MemberCard';
import { FamilyStats } from '@/components/family/FamilyStats';
import { FamilySwitcher } from '@/components/family/FamilySwitcher';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';

export default function Family() {
  const { userFamilies, familyMembers, currentFamily, refetch, switchToFamily } = useFamilyContext();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const createFamilyMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) {
        throw new Error('You must be logged in to create a family');
      }

      const { data, error } = await supabase.functions.invoke('create-family', {
        body: { name },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create family');
      }

      if (!data?.family) {
        throw new Error('No family data returned');
      }

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
    onSuccess: (_, email) => {
      toast.success(`Invitation sent to ${email}!`);
      toast.info('They will see the invitation in their Family page', { duration: 4000 });
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

  // Get member count for each family
  const getFamilyMemberCount = (familyId: string) => {
    // This would ideally come from a real query, but for now we use current family members
    if (currentFamily?.id === familyId) {
      return familyMembers.length;
    }
    return 0; // Placeholder - in production, fetch this per family
  };

  // Filter members based on search
  const filteredMembers = familyMembers.filter(member => {
    const displayName = member.profile?.display_name || member.profile?.full_name || '';
    return displayName.toLowerCase().includes(memberSearchQuery.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header with Context Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Family Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your families and shared expenses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FamilySwitcher />
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
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Family Stats */}
            {currentFamily && (
              <FamilyStats
                memberCount={familyMembers.length}
                familyName={currentFamily.name}
                createdAt={currentFamily.created_at}
              />
            )}

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
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No families yet</p>
                    <p className="text-sm">Create your first family to start tracking shared expenses</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userFamilies.map((family) => (
                      <FamilyCard
                        key={family.id}
                        family={family}
                        isActive={currentFamily?.id === family.id}
                        memberCount={getFamilyMemberCount(family.id)}
                        onSwitch={() => switchToFamily(family.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {currentFamily ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>{currentFamily.name} Members</CardTitle>
                        <CardDescription>
                          {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search members..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-[200px]"
                          />
                        </div>
                        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Family Member</DialogTitle>
                              <DialogDescription>
                                Enter the email address of an existing Hisaab Dost user
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
                                Send Invitation
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredMembers.map((member) => {
                        const canRemove = member.role !== 'owner' && member.user_id !== user?.id;
                        return (
                          <div key={member.id}>
                            {canRemove ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div>
                                    <MemberCard
                                      member={member}
                                      canRemove={canRemove}
                                      isCurrentUser={member.user_id === user?.id}
                                      onRemove={() => {}}
                                    />
                                  </div>
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
                            ) : (
                              <MemberCard
                                member={member}
                                canRemove={canRemove}
                                isCurrentUser={member.user_id === user?.id}
                                onRemove={() => {}}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No Family Selected</p>
                  <p className="text-sm text-muted-foreground">
                    Switch to a family context to view and manage members
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-6">
            <PendingInvitations />
            <SentInvitations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
