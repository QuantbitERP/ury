// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Search, DollarSign, Users, UtensilsCrossed, Package, ArrowLeft } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
// import { Button } from '../../components/ui/button';
// import { Badge } from '../../components/ui/badge';
// import { Input } from '../../components/ui/input';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

// interface MenuPackage {
//     name: string;
//     package_name: string;
//     description?: string;
//     price_per_person: number;
//     minimum_guests: number;
//     maximum_guests: number;
//     includes_items: string[];
//     dietary_options: string[];
//     status: string;
// }

// const MenuPackages: React.FC = () => {
//     const [menuPackages, setMenuPackages] = useState<MenuPackage[]>([]);
//     const [filteredMenuPackages, setFilteredMenuPackages] = useState<MenuPackage[]>([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [showAddDialog, setShowAddDialog] = useState(false);
//     const [editingPackage, setEditingPackage] = useState<MenuPackage | null>(null);
//     const [formData, setFormData] = useState({
//         package_name: '',
//         description: '',
//         price_per_person: 0,
//         minimum_guests: 0,
//         maximum_guests: 0,
//         includes_items: '',
//         dietary_options: '',
//         status: 'Active'
//     });

//     useEffect(() => {
//         fetchMenuPackages();
//     }, []);

//     useEffect(() => {
//         filterMenuPackages();
//     }, [menuPackages, searchTerm]);

//     const fetchMenuPackages = async () => {
//         try {
//             // Mock API call - replace with actual Frappe API
//             const mockMenuPackages: MenuPackage[] = [
//                 {
//                     name: "premium-wedding-package",
//                     package_name: "Premium Wedding Package",
//                     description: "Complete wedding menu with appetizers, main course, dessert, and beverages",
//                     price_per_person: 2500,
//                     minimum_guests: 50,
//                     maximum_guests: 500,
//                     includes_items: ["Appetizers", "Main Course", "Desserts", "Soft Drinks", "Coffee/Tea"],
//                     dietary_options: ["Vegetarian", "Vegan", "Gluten-Free"],
//                     status: "Active"
//                 },
//                 {
//                     name: "birthday-basic-package",
//                     package_name: "Birthday Basic Package",
//                     description: "Perfect for birthday celebrations with cake and basic refreshments",
//                     price_per_person: 800,
//                     minimum_guests: 10,
//                     maximum_guests: 100,
//                     includes_items: ["Cake", "Snacks", "Soft Drinks", "Decorations"],
//                     dietary_options: ["Vegetarian"],
//                     status: "Active"
//                 },
//                 {
//                     name: "corporate-lunch-package",
//                     package_name: "Corporate Lunch Package",
//                     description: "Professional lunch menu for corporate events and meetings",
//                     price_per_person: 1200,
//                     minimum_guests: 20,
//                     maximum_guests: 200,
//                     includes_items: ["Soup", "Salad", "Main Course", "Dessert", "Tea/Coffee"],
//                     dietary_options: ["Vegetarian", "Non-Vegetarian", "Gluten-Free"],
//                     status: "Active"
//                 }
//             ];
//             setMenuPackages(mockMenuPackages);
//         } catch (error) {
//             console.error('Error fetching menu packages:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filterMenuPackages = () => {
//         let filtered = menuPackages;

//         if (searchTerm) {
//             filtered = filtered.filter(pkg =>
//                 pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         setFilteredMenuPackages(filtered);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             // Mock API call - replace with actual Frappe API
//             const packageData = {
//                 ...formData,
//                 includes_items: formData.includes_items.split(',').map(item => item.trim()).filter(item => item),
//                 dietary_options: formData.dietary_options.split(',').map(item => item.trim()).filter(item => item)
//             };

//             if (editingPackage) {
//                 console.log('Updating menu package:', packageData);
//                 setMenuPackages(menuPackages.map(pkg =>
//                     pkg.name === editingPackage.name
//                         ? { ...pkg, ...packageData }
//                         : pkg
//                 ));
//             } else {
//                 console.log('Creating new menu package:', packageData);
//                 const newPackage: MenuPackage = {
//                     name: formData.package_name.toLowerCase().replace(/\s+/g, '-'),
//                     ...packageData
//                 };
//                 setMenuPackages([...menuPackages, newPackage]);
//             }

//             // Reset form
//             setFormData({
//                 package_name: '',
//                 description: '',
//                 price_per_person: 0,
//                 minimum_guests: 0,
//                 maximum_guests: 0,
//                 includes_items: '',
//                 dietary_options: '',
//                 status: 'Active'
//             });
//             setShowAddDialog(false);
//             setEditingPackage(null);
//         } catch (error) {
//             console.error('Error saving menu package:', error);
//         }
//     };

//     const handleEdit = (pkg: MenuPackage) => {
//         setEditingPackage(pkg);
//         setFormData({
//             package_name: pkg.package_name,
//             description: pkg.description || '',
//             price_per_person: pkg.price_per_person,
//             minimum_guests: pkg.minimum_guests,
//             maximum_guests: pkg.maximum_guests,
//             includes_items: pkg.includes_items.join(', '),
//             dietary_options: pkg.dietary_options.join(', '),
//             status: pkg.status
//         });
//         setShowAddDialog(true);
//     };

//     const handleDelete = async (packageName: string) => {
//         if (window.confirm('Are you sure you want to delete this menu package?')) {
//             try {
//                 // Mock API call - replace with actual Frappe API
//                 console.log(`Deleting menu package: ${packageName}`);
//                 setMenuPackages(menuPackages.filter(pkg => pkg.name !== packageName));
//             } catch (error) {
//                 console.error('Error deleting menu package:', error);
//             }
//         }
//     };

//     const toggleStatus = async (pkg: MenuPackage) => {
//         try {
//             const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
//             // Mock API call - replace with actual Frappe API
//             console.log(`Updating ${pkg.name} status to ${newStatus}`);
//             setMenuPackages(menuPackages.map(p =>
//                 p.name === pkg.name ? { ...p, status: newStatus } : p
//             ));
//         } catch (error) {
//             console.error('Error updating package status:', error);
//         }
//     };

//     const calculateStats = () => {
//         const active = menuPackages.filter(pkg => pkg.status === 'Active').length;
//         const total = menuPackages.length;
//         const avgPrice = menuPackages.length > 0
//             ? Math.round(menuPackages.reduce((sum, pkg) => sum + pkg.price_per_person, 0) / menuPackages.length)
//             : 0;
//         const avgMinGuests = menuPackages.length > 0
//             ? Math.round(menuPackages.reduce((sum, pkg) => sum + pkg.minimum_guests, 0) / menuPackages.length)
//             : 0;

//         return { active, total, avgPrice, avgMinGuests };
//     };

//     const stats = calculateStats();

//     if (loading) {
//         return (
//             <div className="p-6">
//                 <div className="flex items-center justify-center h-64">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                         <p className="mt-2 text-gray-600">Loading menu packages...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6">
//             <div className="mb-6">
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900">Menu Packages</h1>
//                         <p className="text-gray-600 mt-2">Manage food and beverage packages for events</p>
//                     </div>
//                     <div className="flex gap-2">
//                         <button onClick={() => window.location.href = '/'} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
//                             <ArrowLeft className="h-4 w-4" />
//                             Back to POS
//                         </button>
//                         <Button onClick={() => {
//                             setEditingPackage(null);
//                             setFormData({
//                                 package_name: '',
//                                 description: '',
//                                 price_per_person: 0,
//                                 minimum_guests: 0,
//                                 maximum_guests: 0,
//                                 includes_items: '',
//                                 dietary_options: '',
//                                 status: 'Active'
//                             });
//                             setShowAddDialog(true);
//                         }}>
//                             <Plus className="h-4 w-4 mr-2" />
//                             Add Menu Package
//                         </Button>
//                     </div>
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Menu Package
//                     </Button>
//                 </div>
//                 <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
//                     <DialogContent className="sm:max-w-2xl">
//                         <DialogHeader>
//                             <DialogTitle>
//                                 {editingPackage ? 'Edit Menu Package' : 'Add New Menu Package'}
//                             </DialogTitle>
//                         </DialogHeader>
//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Package Name
//                                 </label>
//                                 <Input
//                                     required
//                                     value={formData.package_name}
//                                     onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
//                                     placeholder="e.g., Premium Wedding Package"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     rows={3}
//                                     value={formData.description}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     placeholder="Describe this menu package..."
//                                 />
//                             </div>
//                             <div className="grid grid-cols-3 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Price per Person (KSh)
//                                     </label>
//                                     <Input
//                                         type="number"
//                                         required
//                                         min="0"
//                                         value={formData.price_per_person || ''}
//                                         onChange={(e) => setFormData({ ...formData, price_per_person: parseInt(e.target.value) || 0 })}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Minimum Guests
//                                     </label>
//                                     <Input
//                                         type="number"
//                                         required
//                                         min="1"
//                                         value={formData.minimum_guests || ''}
//                                         onChange={(e) => setFormData({ ...formData, minimum_guests: parseInt(e.target.value) || 0 })}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Maximum Guests
//                                     </label>
//                                     <Input
//                                         type="number"
//                                         required
//                                         min="1"
//                                         value={formData.maximum_guests || ''}
//                                         onChange={(e) => setFormData({ ...formData, maximum_guests: parseInt(e.target.value) || 0 })}
//                                     />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Included Items (comma-separated)
//                                 </label>
//                                 <Input
//                                     value={formData.includes_items}
//                                     onChange={(e) => setFormData({ ...formData, includes_items: e.target.value })}
//                                     placeholder="e.g., Appetizers, Main Course, Desserts, Soft Drinks"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Dietary Options (comma-separated)
//                                 </label>
//                                 <Input
//                                     value={formData.dietary_options}
//                                     onChange={(e) => setFormData({ ...formData, dietary_options: e.target.value })}
//                                     placeholder="e.g., Vegetarian, Vegan, Gluten-Free"
//                                 />
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <input
//                                     type="checkbox"
//                                     id="status"
//                                     checked={formData.status === 'Active'}
//                                     onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
//                                     className="rounded border-gray-300"
//                                 />
//                                 <label htmlFor="status" className="text-sm font-medium text-gray-700">
//                                     Active (available for booking)
//                                 </label>
//                             </div>
//                             <div className="flex justify-end gap-2 pt-4">
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     onClick={() => setShowAddDialog(false)}
//                                 >
//                                     Cancel
//                                 </Button>
//                                 <Button type="submit">
//                                     {editingPackage ? 'Update' : 'Create'}
//                                 </Button>
//                             </div>
//                         </form>
//                     </DialogContent>
//                 </Dialog>
//             </div>
//         </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//                 <Card>
//                     <CardContent className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600">Active Packages</p>
//                                 <p className="text-2xl font-bold">{stats.active}/{stats.total}</p>
//                             </div>
//                             <Badge className="bg-green-100 text-green-800">
//                                 {Math.round((stats.active / stats.total) * 100)}%
//                             </Badge>
//                         </div>
//                     </CardContent>
//                 </Card>
//                 <Card>
//                     <CardContent className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600">Average Price</p>
//                                 <p className="text-2xl font-bold">KSh {stats.avgPrice.toLocaleString()}</p>
//                             </div>
//                             <DollarSign className="h-8 w-8 text-green-500" />
//                         </div>
//                     </CardContent>
//                 </Card>
//                 <Card>
//                     <CardContent className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600">Avg Min Guests</p>
//                                 <p className="text-2xl font-bold">{stats.avgMinGuests}</p>
//                             </div>
//                             <Users className="h-8 w-8 text-blue-500" />
//                         </div>
//                     </CardContent>
//                 </Card>
//                 <Card>
//                     <CardContent className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600">Total Packages</p>
//                                 <p className="text-2xl font-bold">{stats.total}</p>
//                             </div>
//                             <Package className="h-8 w-8 text-purple-500" />
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Search */}
//             <Card className="mb-6">
//                 <CardContent className="p-4">
//                     <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                         <Input
//                             placeholder="Search menu packages..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="pl-10"
//                         />
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Menu Packages Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         </Card>

//     {/* Search */ }
//     <Card className="mb-6">
//         <CardContent className="p-4">
//             <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                     placeholder="Search menu packages..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10"
//                 />
//             </div>
//         </CardContent>
//     </Card>

//     {/* Menu Packages Grid */ }
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredMenuPackages.map((pkg) => (
//             <Card key={pkg.name} className="hover:shadow-lg transition-shadow">
//                 <CardHeader>
//                     <div className="flex items-start justify-between">
//                         <div>
//                             <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
//                             <Badge
//                                 className={pkg.status === 'Active'
//                                     ? 'bg-green-100 text-green-800 mt-2'
//                                     : 'bg-gray-100 text-gray-800 mt-2'
//                                 }
//                             >
//                                 {pkg.status}
//                             </Badge>
//                         </div>
//                         <div className="flex gap-1">
//                             <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleEdit(pkg)}
//                             >
//                                 <Edit className="h-4 w-4" />
//                             </Button>
//                             <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="text-red-600 hover:text-red-700"
//                                 onClick={() => handleDelete(pkg.name)}
//                             >
//                                 <Trash2 className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     </div>
//                 </CardHeader>
//                 <CardContent>
//                     {pkg.description && (
//                         <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
//                     )}

//                     <div className="space-y-3">
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                                 <DollarSign className="h-4 w-4 text-gray-400" />
//                                 <span className="text-sm text-gray-600">Per Person</span>
//                             </div>
//                             <span className="font-semibold">KSh {pkg.price_per_person.toLocaleString()}</span>
//                         </div>

//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                                 <Users className="h-4 w-4 text-gray-400" />
//                                 <span className="text-sm text-gray-600">Guests</span>
//                             </div>
//                             <span className="text-sm">{pkg.minimum_guests} - {pkg.maximum_guests}</span>
//                         </div>

//                         {pkg.includes_items.length > 0 && (
//                             <div>
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <UtensilsCrossed className="h-4 w-4 text-gray-400" />
//                                     <span className="text-sm text-gray-600">Includes</span>
//                                 </div>
//                                 <div className="flex flex-wrap gap-1">
//                                     {pkg.includes_items.slice(0, 3).map((item, idx) => (
//                                         <Badge key={idx} variant="outline" className="text-xs">
//                                             {item}
//                                         </Badge>
//                                     ))}
//                                     {pkg.includes_items.length > 3 && (
//                                         <Badge variant="outline" className="text-xs">
//                                             +{pkg.includes_items.length - 3} more
//                                         </Badge>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {pkg.dietary_options.length > 0 && (
//                             <div>
//                                 <span className="text-sm text-gray-600">Dietary Options:</span>
//                                 <div className="flex flex-wrap gap-1 mt-1">
//                                     {pkg.dietary_options.map((option, idx) => (
//                                         <Badge key={idx} variant="secondary" className="text-xs">
//                                             {option}
//                                         </Badge>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </CardContent>
//             </Card>
//         ))}
//     </div>

//     {
//         filteredMenuPackages.length === 0 && (
//             <div className="text-center py-12">
//                 <UtensilsCrossed className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No menu packages found</h3>
//                 <p className="text-gray-500 mb-4">
//                     {searchTerm
//                         ? 'Try adjusting your search'
//                         : 'Get started by creating your first menu package'}
//                 </p>
//                 <Button onClick={() => setShowAddDialog(true)}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Menu Package
//                 </Button>
//             </div>
//     );
// };

// export default MenuPackages;
