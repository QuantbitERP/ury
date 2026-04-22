import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  Save,
  X,
  Trash2,
  RefreshCw,
  Edit,
  Plus,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui';
import { showToast } from '../components/ui/toast';
import PageLayout from '../components/PageLayout';

// Types based on URY Room doctype
interface PrinterSettings {
  name?: string;
  bill?: number;
  custom_kot_print?: number;
  printer?: string;
  custom_kot_print_format?: string;
  custom_block_takeaway_kot?: number;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
  doctype?: string;
}

interface AvailableFacilities {
  docstatus?: number;
  doctype?: string;
  name?: string;
  __unsaved?: number;
  owner?: string;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
  idx?: number;
  facilities?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
}

interface Room {
  name?: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: number;
  idx?: number;
  branch?: string;
  room_type?: string;
  custom_rate?: number;
  custom_daywise_rate?: number;
  custom_capacity?: number;
  doctype?: string;
  printer_settings?: PrinterSettings[];
  custom_facilities?: AvailableFacilities[];
}

const RoomSetup: React.FC = () => {
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showPrinterSettingsModal, setShowPrinterSettingsModal] = useState(false);
  const [currentRoomForModal, setCurrentRoomForModal] = useState<Room | null>(null);
  const [availablePrinters, setAvailablePrinters] = useState<any[]>([]);
  const [availablePrintFormats, setAvailablePrintFormats] = useState<any[]>([]);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newRoom, setNewRoom] = useState<Room>({
    name: '',
    branch: '',
    room_type: 'AC',
    custom_rate: 0,
    custom_daywise_rate: 0,
    custom_capacity: 0,
    printer_settings: [],
    custom_facilities: []
  });

  // Fetch existing rooms
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Room',
          fields: ['name', 'branch', 'room_type', 'custom_rate', 'custom_daywise_rate', 'custom_capacity', 'creation', 'modified', 'modified_by', 'owner'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        const roomsList = data.message || [];

        // Fetch full details for each room
        const roomsWithDetails = await Promise.all(
          roomsList.map(async (room: Room) => {
            try {
              const detailResponse = await fetch('/api/method/frappe.client.get', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  doctype: 'URY Room',
                  name: room.name
                })
              });

              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                return detailData.message || room;
              }
              return room;
            } catch (error) {
              console.error('Error fetching room details:', error);
              return room;
            }
          })
        );

        setRooms(roomsWithDetails);
      } else {
        showToast.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showToast.error('Error fetching rooms');
    } finally {
      setLoading(false);
    }
  };

  // Handle room input changes
  const handleRoomInputChange = (field: keyof Room, value: any) => {
    setNewRoom(prev => ({ ...prev, [field]: value }));
  };

  // Create or update room
  const saveRoom = async () => {
    if (!newRoom.name?.trim()) {
      showToast.error('Room name is required');
      return;
    }

    setSaving(true);
    try {
      const isUpdate = !!selectedRoom?.name;
      const endpoint = isUpdate
        ? '/api/method/quantbit_ury_customization.ury_customization.ury_room_management.update_room'
        : '/api/method/quantbit_ury_customization.ury_customization.ury_room_management.create_room';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_data: newRoom,
          room_name: selectedRoom?.name
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Room save result:', result);

        if (result.success) {
          showToast.success(result.message);
          fetchRooms();
          resetForm();
        } else {
          showToast.error(result.message);
        }
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to save room');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      showToast.error('Error saving room');
    } finally {
      setSaving(false);
    }
  };

  // Delete room
  const deleteRoom = async (roomName: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch('/api/method/quantbit_ury_customization.ury_customization.ury_room_management.delete_room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: roomName
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast.success(result.message);
          fetchRooms();
          if (selectedRoom?.name === roomName) {
            resetForm();
          }
        } else {
          showToast.error(result.message);
        }
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      showToast.error('Error deleting room');
    }
  };

  // Edit room
  const editRoom = (room: Room) => {
    setSelectedRoom(room);
    setNewRoom({
      name: room.name || '',
      branch: room.branch || '',
      room_type: room.room_type || 'AC',
      custom_rate: room.custom_rate || 0,
      custom_daywise_rate: room.custom_daywise_rate || 0,
      custom_capacity: room.custom_capacity || 0,
      printer_settings: room.printer_settings || [],
      custom_facilities: room.custom_facilities || []
    });
    setShowCreateRoomForm(true);
  };

  // Manage facilities
  const manageFacilities = (room: Room) => {
    setCurrentRoomForModal(room);
    setShowFacilitiesModal(true);
  };

  // Manage printer settings
  const managePrinterSettings = (room: Room) => {
    setCurrentRoomForModal(room);
    setShowPrinterSettingsModal(true);
  };

  // Add facility
  const addFacility = () => {
    if (!currentRoomForModal) return;
    setNewFacilityName('');
    setShowAddFacilityModal(true);
  };

  const confirmAddFacility = () => {
    if (!currentRoomForModal) return;

    if (newFacilityName && newFacilityName.trim()) {
      const updatedRoom = { ...currentRoomForModal };
      if (!updatedRoom.custom_facilities) {
        updatedRoom.custom_facilities = [];
      }
      updatedRoom.custom_facilities.push({
        facilities: newFacilityName.trim(),
        docstatus: 0,
        doctype: 'Available Facilities',
        __unsaved: 1,
        owner: 'kiranupadhye@erpdata.in',
        parent: updatedRoom.name,
        parentfield: 'custom_facilities',
        parenttype: 'URY Room',
        idx: updatedRoom.custom_facilities.length + 1,
        creation: new Date().toISOString(),
        modified: new Date().toISOString(),
        modified_by: 'kiranupadhye@erpdata.in'
      });
      setCurrentRoomForModal(updatedRoom);
      setShowAddFacilityModal(false);
      setNewFacilityName('');
    } else {
      showToast.error('Facility name is required');
    }
  };

  // Remove facility
  const removeFacility = (index: number) => {
    if (!currentRoomForModal) return;

    const updatedRoom = { ...currentRoomForModal };
    updatedRoom.custom_facilities = updatedRoom.custom_facilities?.filter((_, i) => i !== index) || [];
    setCurrentRoomForModal(updatedRoom);
  };

  // Add printer setting
  const addPrinterSetting = () => {
    if (!currentRoomForModal) return;

    const updatedRoom = { ...currentRoomForModal };
    if (!updatedRoom.printer_settings) {
      updatedRoom.printer_settings = [];
    }
    updatedRoom.printer_settings.push({
      bill: 1,
      custom_kot_print: 1,
      printer: '',
      custom_kot_print_format: '',
      custom_block_takeaway_kot: 0,
      parent: updatedRoom.name,
      parentfield: 'printer_settings',
      parenttype: 'URY Room',
      doctype: 'URY Printer Settings'
    });
    setCurrentRoomForModal(updatedRoom);
  };

  // Remove printer setting
  const removePrinterSetting = (index: number) => {
    if (!currentRoomForModal) return;

    const updatedRoom = { ...currentRoomForModal };
    updatedRoom.printer_settings = updatedRoom.printer_settings?.filter((_, i) => i !== index) || [];
    setCurrentRoomForModal(updatedRoom);
  };

  // Update printer setting field
  const updatePrinterSetting = (index: number, field: keyof PrinterSettings, value: any) => {
    if (!currentRoomForModal) return;

    const updatedRoom = { ...currentRoomForModal };
    if (!updatedRoom.printer_settings) {
      updatedRoom.printer_settings = [];
    }
    updatedRoom.printer_settings[index] = {
      ...updatedRoom.printer_settings[index],
      [field]: value
    };
    setCurrentRoomForModal(updatedRoom);
  };

  // Save facilities and printer settings
  const saveRoomDetails = async () => {
    if (!currentRoomForModal) return;

    setSaving(true);
    try {
      const response = await fetch('/api/method/quantbit_ury_customization.ury_customization.ury_room_management.update_room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_data: currentRoomForModal,
          room_name: currentRoomForModal.name
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast.success(result.message);
          fetchRooms();
          setShowFacilitiesModal(false);
          setShowPrinterSettingsModal(false);
          setCurrentRoomForModal(null);
        } else {
          showToast.error(result.message);
        }
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error saving room details:', error);
      showToast.error('Error saving room details');
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewRoom({
      name: '',
      branch: '',
      room_type: 'AC',
      custom_rate: 0,
      custom_daywise_rate: 0,
      custom_capacity: 0,
      printer_settings: [],
      custom_facilities: []
    });
    setSelectedRoom(null);
    setShowCreateRoomForm(false);
  };

  // Initialize
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch available branches
  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Branch',
          fields: ['name'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableBranches(data.message || []);
      } else {
        console.error('Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Fetch available printers
  const fetchPrinters = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Network Printer Settings',
          fields: ['name', 'name'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailablePrinters(data.message || []);
      } else {
        console.error('Failed to fetch printers');
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
    }
  };

  // Fetch available print formats
  const fetchPrintFormats = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Print Format',
          fields: ['name', 'name', 'module'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailablePrintFormats(data.message || []);
      } else {
        console.error('Failed to fetch print formats');
      }
    } catch (error) {
      console.error('Error fetching print formats:', error);
    }
  };

  // Fetch printers and formats when printer settings modal opens
  useEffect(() => {
    if (showPrinterSettingsModal) {
      fetchPrinters();
      fetchPrintFormats();
      fetchBranches();
    }
  }, [showPrinterSettingsModal]);

  // Fetch branches when create room form opens
  useEffect(() => {
    if (showCreateRoomForm) {
      fetchBranches();
    }
  }, [showCreateRoomForm]);

  return (
    <PageLayout
      title="Room Setup & Management"
      actions={
        <>
          <Button
            variant="outline"
            onClick={fetchRooms}
            disabled={loading}
            className="flex items-center space-x-2 border-gray-200 text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateRoomForm(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </Button>
        </>
      }
    >
      <div className="flex flex-col h-full bg-gray-50/80 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 qs-card flex-1 min-h-0 overflow-hidden">
          {/* Rooms List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">Rooms</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Room Name
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {rooms.map((room) => (
                      <tr key={room.name} className="hover:bg-[#E4B315]/3 transition-colors qs-row">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#E4B315]/15 rounded-full flex items-center justify-center">
                              <DoorOpen className="w-4 h-4 text-[#C69A11]" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{room.name}</div>
                              <div className="text-xs text-gray-400">Created: {new Date(room.creation || '').toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {room.branch || 'Not Set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${room.room_type === 'AC'
                              ? 'bg-[#E4B315]/15 text-[#C69A11]'
                              : room.room_type === 'NON-AC'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                            {room.room_type === 'NON-AC' ? 'Non-AC' : room.room_type || 'Standard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {room.custom_capacity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{room.custom_rate || 0}
                          {room.custom_daywise_rate && <span className="text-gray-500">/day</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editRoom(room)}
                              className="border-gray-200 text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11]"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => manageFacilities(room)}
                              className="border-[#E4B315]/40 text-[#C69A11] hover:border-[#E4B315] hover:text-[#C69A11]"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => managePrinterSettings(room)}
                              className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRoom(room.name!)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rooms.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No rooms found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Room Form */}
          <div className="lg:col-span-1">
            {showCreateRoomForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">
                    {selectedRoom ? 'Edit Room' : 'New Room'}
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
                      Room Name *
                    </label>
                    <input
                      type="text"
                      value={newRoom.name}
                      onChange={(e) => handleRoomInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                      required
                      disabled={!!selectedRoom}
                    />
                  </div>

                  <div>
                    {/* <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={newRoom.branch}
                      onChange={(e) => handleRoomInputChange('branch', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                      placeholder="e.g., 00"
                    /> */}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                      Room Type
                    </label>
                    <select
                      value={newRoom.room_type}
                      onChange={(e) => handleRoomInputChange('room_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                    >
                      <option value="AC">AC</option>
                      <option value="NON-AC">Non-AC</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Hourly Rate
                      </label>
                      <input
                        type="number"
                        value={newRoom.custom_rate}
                        onChange={(e) => handleRoomInputChange('custom_rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Daily Rate
                      </label>
                      <input
                        type="number"
                        value={newRoom.custom_daywise_rate}
                        onChange={(e) => handleRoomInputChange('custom_daywise_rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={newRoom.custom_capacity}
                        onChange={(e) => handleRoomInputChange('custom_capacity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Branch
                      </label>
                      <select
                        value={newRoom.branch}
                        onChange={(e) => handleRoomInputChange('branch', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                      >
                        <option value="">Select Branch</option>
                        {availableBranches.map((branch: any) => (
                          <option key={branch.name} value={branch.name}>
                            {branch.branch_name || branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={saveRoom}
                      disabled={saving}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : (selectedRoom ? 'Update Room' : 'Create Room')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facilities Modal */}
      {showFacilitiesModal && currentRoomForModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">
                Manage Facilities - {currentRoomForModal.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFacilitiesModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <Button
                  onClick={addFacility}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Facility</span>
                </Button>
              </div>
              <div className="space-y-2">
                {currentRoomForModal.custom_facilities?.map((facility, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{facility.facilities}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFacility(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {(!currentRoomForModal.custom_facilities || currentRoomForModal.custom_facilities.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No facilities added yet. Click "Add Facility" to add one.
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFacilitiesModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveRoomDetails}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Facilities'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {showAddFacilityModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">
                Add Facility
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddFacilityModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      confirmAddFacility();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                  placeholder="Enter facility name"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddFacilityModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAddFacility}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Add Facility</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printer Settings Modal */}
      {showPrinterSettingsModal && currentRoomForModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">
                Printer Settings - {currentRoomForModal.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrinterSettingsModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <Button
                  onClick={addPrinterSetting}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Printer Setting</span>
                </Button>
              </div>
              <div className="space-y-4">
                {currentRoomForModal.printer_settings?.map((printer, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">Printer</label>
                        <select
                          value={printer.printer || ''}
                          onChange={(e) => updatePrinterSetting(index, 'printer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        >
                          <option value="">Select Printer</option>
                          {availablePrinters.map((printerOption: any) => (
                            <option key={printerOption.name} value={printerOption.name}>
                              {printerOption.name || printerOption.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">KOT Print Format</label>
                        <select
                          value={printer.custom_kot_print_format || ''}
                          onChange={(e) => updatePrinterSetting(index, 'custom_kot_print_format', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        >
                          <option value="">Select Print Format</option>
                          {availablePrintFormats.map((format: any) => (
                            <option key={format.name} value={format.name}>
                              {format.name || format.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={printer.bill === 1}
                          onChange={(e) => updatePrinterSetting(index, 'bill', e.target.checked ? 1 : 0)}
                          className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                        />
                        <label className="ml-2 text-sm text-gray-700">Enable Bill Printing</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={printer.custom_kot_print === 1}
                          onChange={(e) => updatePrinterSetting(index, 'custom_kot_print', e.target.checked ? 1 : 0)}
                          className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                        />
                        <label className="ml-2 text-sm text-gray-700">Enable KOT Printing</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={printer.custom_block_takeaway_kot === 1}
                          onChange={(e) => updatePrinterSetting(index, 'custom_block_takeaway_kot', e.target.checked ? 1 : 0)}
                          className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                        />
                        <label className="ml-2 text-sm text-gray-700">Block Takeaway KOT</label>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePrinterSetting(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {(!currentRoomForModal.printer_settings || currentRoomForModal.printer_settings.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No printer settings added yet. Click "Add Printer Setting" to add one.
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPrinterSettingsModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveRoomDetails}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Printer Settings'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default RoomSetup;