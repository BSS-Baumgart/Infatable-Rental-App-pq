"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { users as initialUsers } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Plus, Search, Trash, UserIcon } from "lucide-react";
import type { User, UserRole } from "@/app/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/translation-context";

export default function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "employee",
  });
  const [roles, setRoles] = useState<UserRole[]>([
    "admin",
    "employee",
    "manager",
    "viewer",
  ]);
  const [newRole, setNewRole] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const { toast } = useToast();

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      setCurrentUser(null);
      setFormData({
        name: "",
        email: "",
        role: "employee",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleOpenRoleModal = () => {
    setNewRole("");
    setNewRoleDescription("");
    setIsRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? ({ ...u, ...formData } as User) : u
        )
      );
      toast({
        title: "User updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Create new user
      const newUser = {
        ...formData,
        id: `user-${Math.floor(Math.random() * 10000)}`,
      } as User;

      setUsers((prev) => [...prev, newUser]);
      toast({
        title: "User created",
        description: `${formData.name} has been created successfully.`,
      });
    }

    handleCloseModal();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm(t("settings.confirmDelete"))) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      });
    }
  };

  const handleAddRole = () => {
    if (!newRole.trim()) {
      toast({
        title: "Error",
        description: "Role name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (roles.includes(newRole as UserRole)) {
      toast({
        title: "Error",
        description: "Role already exists",
        variant: "destructive",
      });
      return;
    }

    // Add the new role
    setRoles((prev) => [...prev, newRole as UserRole]);

    toast({
      title: "Role added",
      description: `${newRole} role has been added successfully.`,
    });

    handleCloseRoleModal();
  };

  return (
    <>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("settings.users")}</CardTitle>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                {t("settings.addUser")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left font-medium p-2">
                        {t("common.name")}
                      </th>
                      <th className="text-left font-medium p-2">Email</th>
                      <th className="text-left font-medium p-2">
                        {t("settings.roles")}
                      </th>
                      <th className="text-right font-medium p-2">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="font-medium">{user.name}</div>
                          </div>
                        </td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2 capitalize">{user.role}</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Role Management</CardTitle>
              <Button onClick={handleOpenRoleModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left font-medium p-2">Role Name</th>
                      <th className="text-left font-medium p-2">Users</th>
                      <th className="text-right font-medium p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr
                        key={role}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="p-2 capitalize">{role}</td>
                        <td className="p-2">
                          {users.filter((user) => user.role === role).length}
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={role === "admin" || role === "employee"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                role === "admin" ||
                                role === "employee" ||
                                users.some((user) => user.role === role)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!currentUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to generate random password"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  User will be prompted to change password on first login
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentUser ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleModalOpen} onOpenChange={handleCloseRoleModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddRole();
            }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description (Optional)</Label>
              <Textarea
                id="roleDescription"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Describe the permissions and responsibilities of this role"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseRoleModal}
              >
                Cancel
              </Button>
              <Button type="submit">Create Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
