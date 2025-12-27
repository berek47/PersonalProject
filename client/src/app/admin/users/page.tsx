"use client";

import { useState, useEffect } from "react";
import { getUsers, updateUserRole, banUser, unbanUser } from "@/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  SearchIcon,
  MoreVerticalIcon,
  ShieldIcon,
  UserIcon,
  GraduationCapIcon,
  BanIcon,
  CheckCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  bannedAt: Date | null;
  bannedReason: string | null;
  emailVerified: boolean;
  createdAt: Date;
  _count: {
    enrollments: number;
    instructorCourses: number;
    reviews: number;
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await getUsers({ search, role: roleFilter, page });
      setUsers(data.users as User[]);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  async function handleRoleChange(userId: string, newRole: "STUDENT" | "INSTRUCTOR" | "ADMIN") {
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  }

  async function handleBan() {
    if (!selectedUser || !banReason) return;

    try {
      await banUser(selectedUser.id, banReason);
      toast.success("User banned successfully");
      setBanDialogOpen(false);
      setBanReason("");
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
    }
  }

  async function handleUnban(userId: string) {
    try {
      await unbanUser(userId);
      toast.success("User unbanned successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to unban user");
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-100 text-red-700">Admin</Badge>;
      case "INSTRUCTOR":
        return <Badge className="bg-blue-100 text-blue-700">Instructor</Badge>;
      default:
        return <Badge variant="outline">Student</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all users on the platform</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="STUDENT">Students</SelectItem>
              <SelectItem value="INSTRUCTOR">Instructors</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>
            Click on the menu to manage user roles and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    user.banned ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="size-10 rounded-full" />
                      ) : (
                        <UserIcon className="size-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        {getRoleBadge(user.role)}
                        {user.banned && (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <span>{user._count.enrollments} enrollments</span>
                        {user.role === "INSTRUCTOR" && (
                          <span>{user._count.instructorCourses} courses</span>
                        )}
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, "STUDENT")}>
                        <UserIcon className="mr-2 size-4" />
                        Make Student
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, "INSTRUCTOR")}>
                        <GraduationCapIcon className="mr-2 size-4" />
                        Make Instructor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")}>
                        <ShieldIcon className="mr-2 size-4" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.banned ? (
                        <DropdownMenuItem onClick={() => handleUnban(user.id)}>
                          <CheckCircleIcon className="mr-2 size-4" />
                          Unban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setBanDialogOpen(true);
                          }}
                        >
                          <BanIcon className="mr-2 size-4" />
                          Ban User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.name}? They will be logged out and unable to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for ban</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for banning this user..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan} disabled={!banReason}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
