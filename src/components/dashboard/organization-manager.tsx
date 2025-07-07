
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Mail, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  createOrganization,
  getOrganizations,
  getOrganizationMembers,
  inviteUserToOrganization,
  updateMemberRole,
  removeMember
} from '@/lib/organization-api';

interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  status: string;
  created_at: string;
}

export function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadMembers(selectedOrg.id);
    }
  }, [selectedOrg]);

  const loadOrganizations = async () => {
    setLoading(true);
    const orgs = await getOrganizations();
    setOrganizations(orgs);
    if (orgs.length > 0 && !selectedOrg) {
      setSelectedOrg(orgs[0]);
    }
    setLoading(false);
  };

  const loadMembers = async (orgId: string) => {
    const orgMembers = await getOrganizationMembers(orgId);
    setMembers(orgMembers);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    const org = await createOrganization(newOrgName, newOrgDescription);
    if (org) {
      toast.success('Organization created successfully');
      setNewOrgName('');
      setNewOrgDescription('');
      setShowCreateDialog(false);
      loadOrganizations();
    } else {
      toast.error('Failed to create organization');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !selectedOrg) {
      toast.error('Email and organization are required');
      return;
    }

    const success = await inviteUserToOrganization(selectedOrg.id, inviteEmail, inviteRole);
    if (success) {
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteDialog(false);
    } else {
      toast.error('Failed to send invitation');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    const success = await updateMemberRole(memberId, newRole);
    if (success) {
      toast.success('Role updated successfully');
      if (selectedOrg) {
        loadMembers(selectedOrg.id);
      }
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await removeMember(memberId);
    if (success) {
      toast.success('Member removed successfully');
      if (selectedOrg) {
        loadMembers(selectedOrg.id);
      }
    } else {
      toast.error('Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'editor': return <Edit className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading organizations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organization Management</h2>
          <p className="text-gray-600">Manage your organizations and team members</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new organization to collaborate with your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <Label htmlFor="org-description">Description (Optional)</Label>
                <Input
                  id="org-description"
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  placeholder="Enter organization description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrganization}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Organizations</h3>
            <p className="text-gray-600 mb-4">Create your first organization to start collaborating.</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={selectedOrg?.id} onValueChange={(value) => {
          const org = organizations.find(o => o.id === value);
          if (org) setSelectedOrg(org);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-auto">
            {organizations.map((org) => (
              <TabsTrigger key={org.id} value={org.id}>
                {org.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {organizations.map((org) => (
            <TabsContent key={org.id} value={org.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {org.name}
                      </CardTitle>
                      {org.description && (
                        <CardDescription>{org.description}</CardDescription>
                      )}
                    </div>
                    
                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Mail className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                          <DialogDescription>
                            Send an invitation to join {org.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="invite-role">Role</Label>
                            <Select value={inviteRole} onValueChange={(value: 'admin' | 'editor' | 'viewer') => setInviteRole(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">
                                  <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Viewer - Can only view reports
                                  </div>
                                </SelectItem>
                                <SelectItem value="editor">
                                  <div className="flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Editor - Can scan and optimize
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Admin - Full access
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleInviteUser}>Send Invitation</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Team Members ({members.length})</h4>
                    
                    {members.length === 0 ? (
                      <p className="text-gray-600">No members in this organization yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                {getRoleIcon(member.role)}
                              </div>
                              <div>
                                <p className="font-medium">User {member.user_id.slice(0, 8)}...</p>
                                <Badge className={getRoleColor(member.role)}>
                                  {member.role}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Select
                                value={member.role}
                                onValueChange={(value: 'admin' | 'editor' | 'viewer') => 
                                  handleRoleChange(member.id, value)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
