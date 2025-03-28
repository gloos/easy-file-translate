
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MoreHorizontal, Plus, Search, Trash, UserPlus } from 'lucide-react';

// Mock user data
const INITIAL_USERS = [
  { id: '1', username: 'user', role: 'user' as const, dateCreated: new Date(2023, 0, 15) },
  { id: '2', username: 'admin', role: 'admin' as const, dateCreated: new Date(2023, 0, 10) },
  { id: '3', username: 'john.doe', role: 'user' as const, dateCreated: new Date(2023, 2, 20) },
  { id: '4', username: 'jane.smith', role: 'user' as const, dateCreated: new Date(2023, 3, 5) },
  { id: '5', username: 'tech.lead', role: 'admin' as const, dateCreated: new Date(2023, 1, 25) },
];

type User = {
  id: string;
  username: string;
  role: 'user' | 'admin';
  dateCreated: Date;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  
  // Filter users by search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddUser = () => {
    if (!newUsername.trim()) {
      toast.error('Username is required');
      return;
    }
    
    // Check if username already exists
    if (users.some(user => user.username === newUsername)) {
      toast.error('Username already exists');
      return;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      username: newUsername,
      role: newUserRole,
      dateCreated: new Date()
    };
    
    setUsers([...users, newUser]);
    setNewUserDialogOpen(false);
    setNewUsername('');
    setNewUserRole('user');
    
    toast.success(`User ${newUsername} created successfully`);
  };
  
  const handleChangeRole = (userId: string, newRole: 'user' | 'admin') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(`${user.username}'s role updated to ${newRole}`);
    }
  };
  
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    // Don't allow deleting the current admin (id: 2)
    if (userId === '2') {
      toast.error("You cannot delete your own admin account");
      return;
    }
    
    setUsers(users.filter(user => user.id !== userId));
    
    if (user) {
      toast.success(`User ${user.username} deleted successfully`);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage user accounts and roles</p>
        </div>
        <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus size={16} />
              <span>Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with the specified role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(value: 'user' | 'admin') => setNewUserRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">Username</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Date Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`capitalize ${
                    user.role === 'admin' ? 'text-status-translating font-medium' : ''
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {formatDate(user.dateCreated)}
                </td>
                <td className="py-3 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleChangeRole(user.id, user.role === 'user' ? 'admin' : 'user')}
                        disabled={user.id === '2'} // Prevent changing the main admin
                      >
                        Change to {user.role === 'user' ? 'Admin' : 'User'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === '2'} // Prevent deleting the main admin
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <p className="text-gray-500">No users found matching your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
