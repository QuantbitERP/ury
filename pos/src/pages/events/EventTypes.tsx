import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, DollarSign, Users, ToggleLeft, ToggleRight, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

interface EventType {
    name: string;
    event_type_name: string;
    description?: string;
    default_duration: number;
    default_price: number;
    average_guests: number;
    status: string;
}

const EventTypes: React.FC = () => {
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [filteredEventTypes, setFilteredEventTypes] = useState<EventType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
    const [formData, setFormData] = useState({
        event_type_name: '',
        description: '',
        default_duration: 0,
        default_price: 0,
        average_guests: 0,
        status: 'Active'
    });

    useEffect(() => {
        fetchEventTypes();
    }, []);

    useEffect(() => {
        filterEventTypes();
    }, [eventTypes, searchTerm]);

    const fetchEventTypes = async () => {
        try {
            // Mock API call - replace with actual Frappe API
            const mockEventTypes: EventType[] = [
                {
                    name: "camping-event-type",
                    event_type_name: "Camping",
                    description: "Outdoor camping events with tents and bonfire",
                    default_duration: 24,
                    default_price: 1500,
                    average_guests: 50,
                    status: "Active"
                },
                {
                    name: "wedding-event-type",
                    event_type_name: "Wedding",
                    description: "Traditional wedding ceremonies and receptions",
                    default_duration: 16,
                    default_price: 3500,
                    average_guests: 150,
                    status: "Active"
                }
            ];
            setEventTypes(mockEventTypes);
        } catch (error) {
            console.error('Error fetching event types:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEventTypes = () => {
        let filtered = eventTypes;

        if (searchTerm) {
            filtered = filtered.filter(eventType =>
                eventType.event_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                eventType.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEventTypes(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Mock API call - replace with actual Frappe API
            if (editingEventType) {
                console.log('Updating event type:', formData);
                setEventTypes(eventTypes.map(et => 
                    et.name === editingEventType.name 
                        ? { ...et, ...formData }
                        : et
                ));
            } else {
                console.log('Creating new event type:', formData);
                const newEventType: EventType = {
                    name: formData.event_type_name.toLowerCase().replace(/\s+/g, '-'),
                    ...formData
                };
                setEventTypes([...eventTypes, newEventType]);
            }

            // Reset form
            setFormData({
                event_type_name: '',
                description: '',
                default_duration: 0,
                default_price: 0,
                average_guests: 0,
                status: 'Active'
            });
            setShowAddDialog(false);
            setEditingEventType(null);
        } catch (error) {
            console.error('Error saving event type:', error);
        }
    };

    const handleEdit = (eventType: EventType) => {
        setEditingEventType(eventType);
        setFormData({
            event_type_name: eventType.event_type_name,
            description: eventType.description || '',
            default_duration: eventType.default_duration,
            default_price: eventType.default_price,
            average_guests: eventType.average_guests,
            status: eventType.status
        });
        setShowAddDialog(true);
    };

    const handleDelete = async (eventTypeName: string) => {
        if (window.confirm('Are you sure you want to delete this event type?')) {
            try {
                // Mock API call - replace with actual Frappe API
                console.log(`Deleting event type: ${eventTypeName}`);
                setEventTypes(eventTypes.filter(et => et.name !== eventTypeName));
            } catch (error) {
                console.error('Error deleting event type:', error);
            }
        }
    };

    const toggleStatus = async (eventType: EventType) => {
        try {
            const newStatus = eventType.status === 'Active' ? 'Inactive' : 'Active';
            // Mock API call - replace with actual Frappe API
            console.log(`Updating ${eventType.name} status to ${newStatus}`);
            setEventTypes(eventTypes.map(et => 
                et.name === eventType.name ? { ...et, status: newStatus } : et
            ));
        } catch (error) {
            console.error('Error updating event type status:', error);
        }
    };

    const calculateStats = () => {
        const active = eventTypes.filter(et => et.status === 'Active').length;
        const total = eventTypes.length;
        const avgDuration = eventTypes.length > 0 
            ? Math.round(eventTypes.reduce((sum, et) => sum + et.default_duration, 0) / eventTypes.length)
            : 0;
        const avgPrice = eventTypes.length > 0
            ? Math.round(eventTypes.reduce((sum, et) => sum + et.default_price, 0) / eventTypes.length)
            : 0;

        return { active, total, avgDuration, avgPrice };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading event types...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Event Types</h1>
                        <p className="text-gray-600 mt-2">Manage different types of events your venue can host</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.location.href = '/'} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to POS
                        </button>
                        <Button onClick={() => {
                            setEditingEventType(null);
                            setFormData({
                                event_type_name: '',
                                description: '',
                                default_duration: 0,
                                default_price: 0,
                                average_guests: 0,
                                status: 'Active'
                            });
                            setShowAddDialog(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Event Type
                        </Button>
                    </div>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingEventType ? 'Edit Event Type' : 'Add New Event Type'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Type Name
                                </label>
                                <Input
                                    required
                                    value={formData.event_type_name}
                                    onChange={(e) => setFormData({ ...formData, event_type_name: e.target.value })}
                                    placeholder="e.g., Wedding, Birthday Party"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this event type..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Default Duration (hours)
                                    </label>
                                    <Input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.default_duration || ''}
                                        onChange={(e) => setFormData({ ...formData, default_duration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Default Price (KSh)
                                    </label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.default_price || ''}
                                        onChange={(e) => setFormData({ ...formData, default_price: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Average Guests
                                </label>
                                <Input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.average_guests || ''}
                                    onChange={(e) => setFormData({ ...formData, average_guests: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="status"
                                    checked={formData.status === 'Active'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                                    Active (available for booking)
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingEventType ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>)
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Event Types</p>
                                <p className="text-2xl font-bold">{stats.active}/{stats.total}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                                {Math.round((stats.active / stats.total) * 100)}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Average Duration</p>
                                <p className="text-2xl font-bold">{stats.avgDuration}h</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Average Price</p>
                                <p className="text-2xl font-bold">KSh {stats.avgPrice.toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Types</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search event types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Event Types Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Types ({filteredEventTypes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Event Type</th>
                                    <th className="text-left py-3 px-4">Duration</th>
                                    <th className="text-left py-3 px-4">Base Price</th>
                                    <th className="text-left py-3 px-4">Average Guests</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEventTypes.map((eventType) => (
                                    <tr key={eventType.name} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium">{eventType.event_type_name}</div>
                                                {eventType.description && (
                                                    <div className="text-sm text-gray-500">{eventType.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                {eventType.default_duration}h
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                KSh {eventType.default_price.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                {eventType.average_guests}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge 
                                                className={eventType.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                                }
                                            >
                                                {eventType.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(eventType)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleStatus(eventType)}
                                                    className={eventType.status === 'Active' ? 'text-orange-600' : 'text-green-600'}
                                                >
                                                    {eventType.status === 'Active' ? (
                                                        <ToggleLeft className="h-4 w-4" />
                                                    ) : (
                                                        <ToggleRight className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(eventType.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredEventTypes.length === 0 && (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No event types found</h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm 
                                        ? 'Try adjusting your search' 
                                        : 'Get started by creating your first event type'}
                                </p>
                                <Button onClick={() => setShowAddDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Event Type
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EventTypes;
