import React, { useState, useEffect } from 'react';
import {
  Users,
  Save,
  X,
  Trash2,
  RefreshCw,
  Edit,
  Shield,
  UserPlus,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui';
import { showToast } from '../components/ui/toast';

// Types based on Frappe User doctype
interface UserRole {
  role: string;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
}

interface User {
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  mobile_no?: string;
  enabled?: number;
  user_type?: string;
  roles?: UserRole[];
  new_password?: string;
  confirm_password?: string;
}

interface Role {
  name: string;
  role_name: string;
  desk_access?: number;
  is_custom?: number;
  disabled?: number;
}

const UserSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // ── Enhanced CSS animations injected at component level ──────────────────
  React.useEffect(() => {
    const id = 'qs-setup-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @keyframes qs-fadeIn    { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes qs-slideRight{ from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:none; } }
        @keyframes qs-popIn     { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
        .qs-card       { animation: qs-fadeIn .28s ease both; }
        .qs-slide-r    { animation: qs-slideRight .25s ease both; }
        .qs-pop        { animation: qs-popIn .22s cubic-bezier(.34,1.56,.64,1) both; }
        .qs-row        { transition: background .15s, box-shadow .15s; }
        .qs-row:hover  { box-shadow: inset 3px 0 0 #E4B315; }
        .qs-input:focus{ box-shadow: 0 0 0 3px rgba(228,179,21,.15); }
        ::-webkit-scrollbar       { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#f0e8c8; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:#E4B315; }
      `;
      document.head.appendChild(s);
    }
    return () => { };
  }, []);

  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false);
  const [newRole, setNewRole] = useState({
    role_name: '',
    desk_access: 1,
    is_custom: 0,
    disabled: 0,
    two_factor_auth: 0
  });

  // Handle role input changes safely
  const handleRoleInputChange = (field: keyof typeof newRole, value: any) => {
    if (field === 'role_name' && typeof value === 'string') {
      setNewRole(prev => ({ ...prev, role_name: value }));
    } else if (field === 'desk_access' || field === 'is_custom' || field === 'disabled' || field === 'two_factor_auth') {
      setNewRole(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
    }
  };
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    first_name: '',
    last_name: '',
    full_name: '',
    phone: '',
    mobile_no: '',
    enabled: 1,
    user_type: 'System User',
    roles: [],
    new_password: '',
    confirm_password: ''
  });

  // Tab configuration
  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  ];

  // Fetch existing users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'User',
          fields: ['name', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'mobile_no', 'enabled', 'user_type'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        const usersList = data.message || [];

        // Fetch roles for each user
        const usersWithRoles = await Promise.all(
          usersList.map(async (user: User) => {
            try {
              const roleResponse = await fetch('/api/method/frappe.client.get_list', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  doctype: 'Has Role',
                  fields: ['role'],
                  filters: { parent: user.name },
                  limit_page_length: 50
                })
              });

              if (roleResponse.ok) {
                const roleData = await roleResponse.json();
                user.roles = roleData.message || [];
              }
              return user;
            } catch (error) {
              console.error('Error fetching roles for user:', error);
              return user;
            }
          })
        );

        setUsers(usersWithRoles);
      } else {
        showToast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Role',
          fields: ['name', 'role_name', 'desk_access', 'is_custom', 'disabled'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.message || []);
      } else {
        showToast.error('Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast.error('Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full user details
  const fetchUserDetails = async (userName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'User',
          name: userName
        })
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.message;

        // Fetch user roles
        const roleResponse = await fetch('/api/method/quantbit_ury_customization.ury_customization.ury_user_management.get_user_roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userName
          })
        });

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          const roleList = Array.isArray(roleData.message) ? roleData.message : [];
          userData.roles = roleList.map((role: string) => ({ role: role }));
          console.log('Fetched user roles:', userData.roles);
        } else {
          console.error('Failed to fetch user roles:', await roleResponse.text());
        }

        setFormData(userData);
        setSelectedUser(userData);
      } else {
        showToast.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showToast.error('Error fetching user details');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle role selection
  const handleRoleToggle = (roleName: string) => {
    const currentRoles = formData.roles || [];
    const existingRoleIndex = currentRoles.findIndex(r => r.role === roleName);

    if (existingRoleIndex >= 0) {
      // Remove role
      setFormData(prev => ({
        ...prev,
        roles: currentRoles.filter(r => r.role !== roleName)
      }));
    } else {
      // Add role
      setFormData(prev => ({
        ...prev,
        roles: [...currentRoles, { role: roleName }]
      }));
    }
  };

  // Save user
  const saveUser = async () => {
    setSaving(true);
    try {
      const isUpdate = !!formData.name;

      if (isUpdate) {
        // Update user using set_value for each field
        const updateFields = [
          { fieldname: 'email', value: formData.email },
          { fieldname: 'first_name', value: formData.first_name },
          { fieldname: 'last_name', value: formData.last_name },
          { fieldname: 'full_name', value: formData.full_name || `${formData.first_name} ${formData.last_name}` },
          { fieldname: 'phone', value: formData.phone },
          { fieldname: 'mobile_no', value: formData.mobile_no },
          { fieldname: 'enabled', value: formData.enabled },
          { fieldname: 'user_type', value: formData.user_type }
        ];

        // Update each field individually
        for (const field of updateFields) {
          await fetch('/api/method/frappe.client.set_value', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              doctype: 'User',
              name: formData.name,
              fieldname: field.fieldname,
              value: field.value
            })
          });
        }

        const savedUser = { name: formData.name };

        // Update roles if changed
        if (formData.roles && formData.name) {
          const newRoleNames = formData.roles.map(r => r.role);
          console.log('New roles to assign:', newRoleNames);
          console.log('User name for role assignment:', formData.name);

          // Use custom Python method for role assignment
          try {
            const roleAssignmentResponse = await fetch('/api/method/quantbit_ury_customization.ury_customization.ury_user_management.assign_user_roles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: formData.name,
                roles: newRoleNames
              })
            });

            if (roleAssignmentResponse.ok) {
              const result = await roleAssignmentResponse.json();
              console.log('Role assignment result:', result);

              if (result.success) {
                console.log('Roles assigned successfully:', result.message);
                showToast.success(result.message);
              } else {
                console.error('Role assignment failed:', result.message);
                showToast.error(result.message);
              }
            } else {
              const errorText = await roleAssignmentResponse.text();
              console.error('Failed to call role assignment method:', errorText);
              showToast.error('Failed to assign roles');
            }
          } catch (error) {
            console.error('Error in role assignment:', error);
            showToast.error('Error assigning roles');
          }
        }

        // Set password if provided
        if (formData.new_password && formData.new_password === formData.confirm_password) {
          try {
            const passwordResponse = await fetch('/api/method/quantbit_ury_customization.ury_customization.ury_user_management.update_user_password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: savedUser.name,
                new_password: formData.new_password
              })
            });

            if (passwordResponse.ok) {
              const passwordResult = await passwordResponse.json();
              console.log('Password update result:', passwordResult);

              if (passwordResult.success) {
                console.log('Password updated successfully:', passwordResult.message);
                showToast.success(passwordResult.message);
              } else {
                console.error('Password update failed:', passwordResult.message);
                showToast.error(passwordResult.message);
              }
            } else {
              const errorText = await passwordResponse.text();
              console.error('Failed to update password:', errorText);
              showToast.error('Failed to update password');
            }
          } catch (error) {
            console.error('Error updating password:', error);
            showToast.error('Error updating password');
          }
        }

        showToast.success('User updated successfully');
        fetchUsers();
        resetForm();
      } else {
        // Create new user using custom Python method
        const userData = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          full_name: formData.full_name || `${formData.first_name} ${formData.last_name}`,
          phone: formData.phone || undefined,
          mobile_no: formData.mobile_no || undefined,
          enabled: formData.enabled,
          user_type: formData.user_type || 'System User',
          send_welcome_email: 1,
          new_password: formData.new_password
        };

        // Get role names if any are selected
        const roleNames = formData.roles ? formData.roles.map(r => r.role) : [];

        console.log('Creating user with data:', userData);
        console.log('Roles to assign:', roleNames);

        const response = await fetch('/api/method/quantbit_ury_customization.ury_customization.ury_user_management.create_user_with_roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_data: userData,
            roles: roleNames
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('User creation result:', result);

          if (result.success) {
            showToast.success(result.message);
            fetchUsers();
            resetForm();
          } else {
            showToast.error(result.message);
          }
        } else {
          const errorData = await response.json();
          showToast.error(errorData.message || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast.error('Error saving user');
    } finally {
      setSaving(false);
    }
  };

  // Delete user
  const deleteUser = async (userName: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // First, delete all roles associated with the user
      const rolesResponse = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Has Role',
          filters: { parent: userName },
          fields: ['name']
        })
      });

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        const userRoles = rolesData.message || [];

        // Delete each role
        for (const role of userRoles) {
          await fetch('/api/method/frappe.client.delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              doctype: 'Has Role',
              name: role.name
            })
          }).catch(() => { }); // Ignore errors for role deletion
        }
      }

      // Now delete the user
      const response = await fetch('/api/method/frappe.client.delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'User',
          name: userName
        })
      });

      if (response.ok) {
        showToast.success('User deleted successfully');
        fetchUsers();
        if (selectedUser?.name === userName) {
          resetForm();
        }
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast.error('Error deleting user');
    }
  };

  // Create new role
  const createRole = async () => {
    if (!newRole.role_name.trim()) {
      showToast.error('Role name is required');
      return;
    }

    try {
      const response = await fetch('/api/method/quantbit_ury_customization.ury_customization.ury_user_management.create_role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role_data: newRole
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Role creation result:', result);

        if (result.message.success) {
          showToast.success(result.message.message);
          // Add new role to the roles list
          setRoles(prev => [...prev, {
            name: result.role_name,
            role_name: result.role_data.role_name,
            desk_access: result.role_data.desk_access,
            is_custom: result.role_data.is_custom,
            disabled: result.role_data.disabled
          }]);

          // Reset form
          setNewRole({
            role_name: '',
            desk_access: 1,
            is_custom: 0,
            disabled: 0,
            two_factor_auth: 0
          });
          setShowCreateRoleForm(false);

          // Reload page after successful role creation
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast.error(result.message.message);
        }
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showToast.error('Error creating role');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      first_name: '',
      last_name: '',
      full_name: '',
      phone: '',
      mobile_no: '',
      enabled: 1,
      user_type: 'System User',
      roles: [],
      new_password: '',
      confirm_password: ''
    });
    setSelectedUser(null);
    setShowPasswordForm(false);
    setShowPasswordSection(false);
    setShowCreateRoleForm(false);
    setNewRole({
      role_name: '',
      desk_access: 1,
      is_custom: 0,
      disabled: 0,
      two_factor_auth: 0
    });
  };

  // Initialize
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'roles') {
      fetchRoles();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-gray-50/80">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-[#C69A11]" />
            <h1 className="text-lg font-extrabold text-[#2D2A26] tracking-tight">User Setup & Role Management</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={activeTab === 'users' ? fetchUsers : fetchRoles}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {activeTab === 'users' && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowPasswordForm(true);
                }}
                className="flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New User</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-[#E4B315] text-[#C69A11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 qs-card">
            {/* Users List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr key={user.name} className="hover:bg-[#E4B315]/3 transition-colors qs-row">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-[#E4B315]/15 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-[#C69A11]" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-xs text-gray-400">{user.user_type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {user.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchUserDetails(user.name!)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteUser(user.name!)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Form */}
            <div className="lg:col-span-1">
              {(selectedUser || showPasswordForm) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">
                      {selectedUser ? 'Edit User' : 'New User'}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        required
                        disabled={!!selectedUser}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        name="mobile_no"
                        value={formData.mobile_no}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        User Type
                      </label>
                      <select
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                      >
                        <option value="System User">System User</option>
                        <option value="Website User">Website User</option>
                        <option value="API User">API User</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="enabled"
                        checked={formData.enabled === 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked ? 1 : 0 }))}
                        className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                      />
                      <label className="ml-2 text-sm text-gray-700">Enabled</label>
                    </div>

                    {/* Password Fields */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Password</h3>
                        {selectedUser && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                          >
                            {showPasswordSection ? 'Hide' : 'Change Password'}
                          </Button>
                        )}
                      </div>

                      {(!selectedUser || showPasswordSection) && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                              {selectedUser ? 'New Password' : 'Password'}
                            </label>
                            <input
                              type="password"
                              name="new_password"
                              value={formData.new_password}
                              onChange={handleInputChange}
                              placeholder={selectedUser ? 'Enter new password (leave blank to keep current)' : 'Enter password'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              name="confirm_password"
                              value={formData.confirm_password}
                              onChange={handleInputChange}
                              placeholder={selectedUser ? 'Confirm new password' : 'Confirm password'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Roles */}
                    <div className="border-t pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-3">Roles</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {roles.map((role) => (
                          <label key={role.name} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.roles?.some(r => r.role === role.role_name)}
                              onChange={() => handleRoleToggle(role.role_name)}
                              className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                            />
                            <span className="ml-2 text-sm text-gray-700">{role.role_name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={saveUser}
                        disabled={saving}
                        className="flex-1"
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {selectedUser ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">Available Roles</h2>
              <Button
                onClick={() => setShowCreateRoleForm(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Role
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Desk Access
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Custom Role
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {roles.map((role) => (
                    <tr key={role.name} className="hover:bg-[#E4B315]/3 transition-colors qs-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-[#C69A11] mr-2" />
                          <span className="text-sm font-medium text-gray-900">{role.role_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.desk_access
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {role.desk_access ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.is_custom
                            ? 'bg-[#E4B315]/15 text-[#C69A11]'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {role.is_custom ? 'Custom' : 'System'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.disabled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {role.disabled ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {roles.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No roles found</p>
                </div>
              )}

              {/* Create Role Form Modal */}
              {showCreateRoleForm && (
                <div className="fixed inset-0 bg-gray-900/80 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">Create New Role</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCreateRoleForm(false);
                          setNewRole({
                            role_name: '',
                            desk_access: 1,
                            is_custom: 0,
                            disabled: 0,
                            two_factor_auth: 0
                          });
                        }}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                          Role Name *
                        </label>
                        <input
                          type="text"
                          value={newRole.role_name || ''}
                          onChange={(e) => handleRoleInputChange('role_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          placeholder="Enter role name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                            Desk Access
                          </label>
                          <select
                            value={newRole.desk_access}
                            onChange={(e) => handleRoleInputChange('desk_access', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                            Custom Role
                          </label>
                          <select
                            value={newRole.is_custom}
                            onChange={(e) => handleRoleInputChange('is_custom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                            Two Factor Auth
                          </label>
                          <select
                            value={newRole.two_factor_auth}
                            onChange={(e) => handleRoleInputChange('two_factor_auth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                            Disabled
                          </label>
                          <select
                            value={newRole.disabled}
                            onChange={(e) => handleRoleInputChange('disabled', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          >
                            <option value={0}>Active</option>
                            <option value={1}>Disabled</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button
                          onClick={createRole}
                          disabled={saving || !newRole.role_name.trim()}
                          className="flex-1"
                        >
                          {saving ? (
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Create Role
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateRoleForm(false);
                            setNewRole({
                              role_name: '',
                              desk_access: 1,
                              is_custom: 0,
                              disabled: 0,
                              two_factor_auth: 0
                            });
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSetup;