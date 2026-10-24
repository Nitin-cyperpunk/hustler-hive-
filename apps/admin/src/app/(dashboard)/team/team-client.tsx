"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Shield,
  ShieldCheck,
  Users,
  User,
  MoreHorizontal,
  Mail,
  Clock,
  Ban,
  RotateCcw,
  Search,
} from "lucide-react";
import type { AdminSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  inviteTeamMember,
  revokeInvitation,
  changeTeamMemberRole,
  deactivateTeamMember,
  reactivateTeamMember,
} from "./actions";

interface TeamMember {
  userId: string;
  role: string;
  status: string;
  createdAt: string;
  fullName: string;
  avatarUrl: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  full_name: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const ROLE_META: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  super_admin: { label: "Super Admin", icon: ShieldCheck, color: "text-amber-400" },
  core_team: { label: "Core Team", icon: Shield, color: "text-brand-cyan" },
  volunteer: { label: "Volunteer", icon: Users, color: "text-green-400" },
  member: { label: "Member", icon: User, color: "text-brand-muted" },
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  invited: "secondary",
  deactivated: "destructive",
};

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role] ?? ROLE_META.member;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${meta.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

export function TeamClient({
  session,
  members,
  invitations,
}: {
  session: AdminSession;
  members: TeamMember[];
  invitations: Invitation[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [roleChangeTarget, setRoleChangeTarget] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState("");
  const [deactivateTarget, setDeactivateTarget] = useState<TeamMember | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<TeamMember | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);

  const canInvite = session.permissions.includes("users.invite");
  const canChangeRole = session.permissions.includes("users.update_role");
  const canDeactivate = session.permissions.includes("users.deactivate");

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.userId.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  function handleInvite(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await inviteTeamMember(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setInviteOpen(false);
        setError(null);
        router.refresh();
      }
    });
  }

  function handleRoleChange() {
    if (!roleChangeTarget || !newRole) return;
    setError(null);
    startTransition(async () => {
      const result = await changeTeamMemberRole(roleChangeTarget.userId, newRole);
      if (result.error) {
        setError(result.error);
      } else {
        setRoleChangeTarget(null);
        setNewRole("");
        router.refresh();
      }
    });
  }

  function handleDeactivate() {
    if (!deactivateTarget) return;
    startTransition(async () => {
      const result = await deactivateTeamMember(deactivateTarget.userId);
      if (result.error) {
        setError(result.error);
      } else {
        setDeactivateTarget(null);
        router.refresh();
      }
    });
  }

  function handleReactivate() {
    if (!reactivateTarget) return;
    startTransition(async () => {
      const result = await reactivateTeamMember(reactivateTarget.userId);
      if (result.error) {
        setError(result.error);
      } else {
        setReactivateTarget(null);
        router.refresh();
      }
    });
  }

  function handleRevoke() {
    if (!revokeTarget) return;
    startTransition(async () => {
      const result = await revokeInvitation(revokeTarget.id);
      if (result.error) {
        setError(result.error);
      } else {
        setRevokeTarget(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-text">Team Management</h1>
          <p className="text-sm text-brand-muted">
            Manage team members, roles, and invitations.
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => { setInviteOpen(true); setError(null); }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Team Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations ({pendingInvitations.length})
          </TabsTrigger>
        </TabsList>

        {/* Members tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="core_team">Core Team</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-brand-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-brand-muted">
                      No team members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cyan/10 text-xs font-bold text-brand-cyan">
                            {member.fullName[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-brand-text">
                              {member.fullName}
                              {member.userId === session.userId && (
                                <span className="ml-2 text-xs text-brand-muted">(you)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[member.status] ?? "outline"}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-brand-muted">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {member.userId !== session.userId &&
                          member.role !== "super_admin" &&
                          (canChangeRole || canDeactivate) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {canChangeRole && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRoleChangeTarget(member);
                                      setNewRole(member.role);
                                      setError(null);
                                    }}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Change role
                                  </DropdownMenuItem>
                                )}
                                {canDeactivate && member.status === "active" && (
                                  <DropdownMenuItem
                                    onClick={() => { setDeactivateTarget(member); setError(null); }}
                                    className="text-red-400"
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                                {canDeactivate && member.status === "deactivated" && (
                                  <DropdownMenuItem
                                    onClick={() => { setReactivateTarget(member); setError(null); }}
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Invitations tab */}
        <TabsContent value="invitations" className="space-y-4">
          <div className="rounded-lg border border-brand-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-brand-muted">
                      No invitations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.full_name}</TableCell>
                      <TableCell className="text-sm text-brand-muted">{inv.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={inv.role} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === "pending"
                              ? "secondary"
                              : inv.status === "accepted"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {inv.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                          {inv.status === "accepted" && <Mail className="mr-1 h-3 w-3" />}
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-brand-muted">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {inv.status === "pending" && canInvite && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setRevokeTarget(inv); setError(null); }}
                            className="text-red-400 hover:text-red-300"
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join the Hustlers Hive team. They will receive
              an email to set up their account.
            </DialogDescription>
          </DialogHeader>
          <form action={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" required placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="volunteer">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core_team">Core Team</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role change dialog */}
      <Dialog
        open={!!roleChangeTarget}
        onOpenChange={(open) => { if (!open) setRoleChangeTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Change the role for {roleChangeTarget?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core_team">Core Team</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isPending}>
              {isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke {deactivateTarget?.fullName}&apos;s access to the admin
              dashboard. They can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate confirmation */}
      <AlertDialog
        open={!!reactivateTarget}
        onOpenChange={(open) => { if (!open) setReactivateTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore {reactivateTarget?.fullName}&apos;s access to the admin
              dashboard with their current role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivate}>
              {isPending ? "Reactivating..." : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke invitation confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the pending invitation for {revokeTarget?.email}. They
              will not be able to join the team using this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Revoking..." : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
