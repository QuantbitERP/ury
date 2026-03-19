import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Calendar, Clock, Users, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

interface Accessory {
    name?: string;
    accessories_type: string;
    accessories: string;
    qty: number;
    rate: number;
    amount: number;
}

interface Event {
    name?: string;
    subject: string;
    custom_event_purpose: string;
    event_category: string;
    event_type: string;
    starts_on: string;
    ends_on: string;
    status: string;
    send_reminder: boolean;
    repeat_this_event: boolean;
    all_day: boolean;
    sync_with_google_calendar: boolean;
    add_video_conferencing: boolean;
    custom_event_charges: string;
    custom_room: string;
    custom_capacity: string;
    custom_amount: number;
    custom_rate: string;
    custom_daywise_rate: number;
    custom_final_amount: number;
    custom_accessories: Accessory[];
}

// ─── Shared input / select classes (gold-themed) ─────────────────────────────
const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-[#2D2A26] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 transition-colors " +
    "placeholder-gray-400";

const selectCls =
    "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-[#2D2A26] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 transition-colors";

const EventForm: React.FC = () => {
    const { id, action } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<Event>({
        subject: '',
        custom_event_purpose: '',
        event_category: 'Event',
        event_type: 'Private',
        starts_on: '',
        ends_on: '',
        status: 'Open',
        send_reminder: true,
        repeat_this_event: false,
        all_day: false,
        sync_with_google_calendar: false,
        add_video_conferencing: false,
        custom_event_charges: 'Hourly',
        custom_room: '',
        custom_capacity: '',
        custom_amount: 0,
        custom_rate: '',
        custom_daywise_rate: 0,
        custom_final_amount: 0,
        custom_accessories: []
    });

    useEffect(() => {
        if (id && action !== 'new') fetchEvent(id);
    }, [id, action]);

    const fetchEvent = async (eventId: string) => {
        try {
            setLoading(true);
            const mockEvent: Event = {
                name: "EV00014",
                subject: "Birthday Party",
                custom_event_purpose: "brithday party",
                event_category: "Event",
                event_type: "Private",
                starts_on: "2025-10-10T19:30",
                ends_on: "2025-10-10T23:00",
                status: "Open",
                send_reminder: true,
                repeat_this_event: false,
                all_day: false,
                sync_with_google_calendar: false,
                add_video_conferencing: false,
                custom_event_charges: "Hourly",
                custom_room: "Party room",
                custom_capacity: "200",
                custom_amount: 17500,
                custom_rate: "5000",
                custom_daywise_rate: 10000,
                custom_final_amount: 17600,
                custom_accessories: [{
                    name: "k1mjd0ku15",
                    accessories_type: "Sound Equipment",
                    accessories: "Sound",
                    qty: 2,
                    rate: 50,
                    amount: 100
                }]
            };
            setEvent(mockEvent);
        } catch (error) {
            console.error('Error fetching event:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateFinalAmount = () => {
        let finalAmount = event.custom_amount;
        const accessoriesTotal = event.custom_accessories.reduce((sum, acc) => sum + acc.amount, 0);
        finalAmount += accessoriesTotal;
        if (event.custom_event_charges === 'Daily' && event.custom_daywise_rate > 0) {
            finalAmount = event.custom_daywise_rate;
        }
        setEvent({ ...event, custom_final_amount: finalAmount });
    };

    const handleInputChange = (field: keyof Event, value: any) => {
        const updatedEvent = { ...event, [field]: value };
        if (field === 'custom_amount' || field === 'custom_daywise_rate' || field === 'custom_event_charges') {
            calculateFinalAmount();
        } else {
            setEvent(updatedEvent);
        }
    };

    const addAccessory = () => {
        setEvent({
            ...event,
            custom_accessories: [...event.custom_accessories, { accessories_type: '', accessories: '', qty: 1, rate: 0, amount: 0 }]
        });
    };

    const updateAccessory = (index: number, field: keyof Accessory, value: any) => {
        const updatedAccessories = [...event.custom_accessories];
        updatedAccessories[index] = { ...updatedAccessories[index], [field]: value };
        if (field === 'qty' || field === 'rate') {
            updatedAccessories[index].amount = updatedAccessories[index].qty * updatedAccessories[index].rate;
        }
        setEvent({ ...event, custom_accessories: updatedAccessories });
    };

    const removeAccessory = (index: number) => {
        setEvent({ ...event, custom_accessories: event.custom_accessories.filter((_, idx) => idx !== index) });
        calculateFinalAmount();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formattedEvent = {
                ...event,
                starts_on: event.starts_on ? new Date(event.starts_on).toISOString() : '',
                ends_on: event.ends_on ? new Date(event.ends_on).toISOString() : ''
            };
            if (action === 'new' || !id) {
                console.log('Creating new event:', formattedEvent);
            } else {
                console.log('Updating event:', formattedEvent);
            }
            navigate('/events/all-events');
        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="relative w-10 h-10 mx-auto">
                            <div className="absolute inset-0 rounded-full border-2 border-[#E4B315]/20" />
                            <div className="absolute inset-0 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin" />
                        </div>
                        <p className="mt-3 text-sm text-gray-400 font-medium">Loading event…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/events/all-events')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to Events
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#2D2A26] tracking-tight">
                        {action === 'new' ? 'New Event' : 'Edit Event'}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {action === 'new' ? 'Create a new event' : 'Edit event details'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Main Column ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Event Details */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Event Details</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                                            Event Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            value={event.subject}
                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                            placeholder="e.g., Birthday Party, Wedding"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                                            Event Purpose
                                        </label>
                                        <input
                                            value={event.custom_event_purpose}
                                            onChange={(e) => handleInputChange('custom_event_purpose', e.target.value)}
                                            placeholder="e.g., Birthday celebration"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Event Category</label>
                                        <select value={event.event_category} onChange={(e) => handleInputChange('event_category', e.target.value)} className={selectCls}>
                                            <option value="Event">Event</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Task">Task</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Event Type</label>
                                        <select value={event.event_type} onChange={(e) => handleInputChange('event_type', e.target.value)} className={selectCls}>
                                            <option value="Private">Private</option>
                                            <option value="Public">Public</option>
                                            <option value="Corporate">Corporate</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Status</label>
                                        <select value={event.status} onChange={(e) => handleInputChange('status', e.target.value)} className={selectCls}>
                                            <option value="Open">Open</option>
                                            <option value="Inquiry">Inquiry</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                                            <Calendar className="inline h-3.5 w-3.5 mr-1 text-[#C69A11]" />
                                            Start Date & Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={event.starts_on}
                                            onChange={(e) => handleInputChange('starts_on', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                                            <Clock className="inline h-3.5 w-3.5 mr-1 text-[#C69A11]" />
                                            End Date & Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={event.ends_on}
                                            onChange={(e) => handleInputChange('ends_on', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={event.send_reminder}
                                            onChange={(e) => handleInputChange('send_reminder', e.target.checked)}
                                            className="rounded border-gray-300 text-[#E4B315] focus:ring-[#E4B315]/30"
                                        />
                                        <span className="text-sm text-gray-600">Send Reminder</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={event.all_day}
                                            onChange={(e) => handleInputChange('all_day', e.target.checked)}
                                            className="rounded border-gray-300 text-[#E4B315] focus:ring-[#E4B315]/30"
                                        />
                                        <span className="text-sm text-gray-600">All Day Event</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Venue & Capacity */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Venue & Capacity</p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Room / Venue</label>
                                        <input
                                            value={event.custom_room}
                                            onChange={(e) => handleInputChange('custom_room', e.target.value)}
                                            placeholder="e.g., Party room, Conference hall"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
                                            <Users className="inline h-3.5 w-3.5 mr-1 text-[#C69A11]" />
                                            Capacity
                                        </label>
                                        <input
                                            type="number"
                                            value={event.custom_capacity}
                                            onChange={(e) => handleInputChange('custom_capacity', e.target.value)}
                                            placeholder="Number of guests"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accessories */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Accessories & Equipment</p>
                                <button
                                    type="button"
                                    onClick={addAccessory}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C69A11] hover:text-[#E4B315] bg-[#E4B315]/10 hover:bg-[#E4B315]/15 px-3 py-1.5 rounded-lg transition-colors">
                                    <Plus className="h-3.5 w-3.5" /> Add Accessory
                                </button>
                            </div>
                            <div className="p-5">
                                {event.custom_accessories.length === 0 ? (
                                    <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
                                        <div className="w-10 h-10 rounded-2xl bg-[#E4B315]/10 flex items-center justify-center mx-auto mb-3">
                                            <Package className="h-5 w-5 text-[#C69A11]" />
                                        </div>
                                        <p className="text-sm text-gray-400">No accessories added yet</p>
                                        <button
                                            type="button"
                                            onClick={addAccessory}
                                            className="mt-2 text-xs text-[#C69A11] hover:underline font-semibold">
                                            + Add first accessory
                                        </button>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    {['Type','Item','Qty','Rate','Amount',''].map(h => (
                                                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {event.custom_accessories.map((accessory, index) => (
                                                    <tr key={index} className="border-t border-gray-50 hover:bg-[#E4B315]/5 transition-colors">
                                                        <td className="px-3 py-2">
                                                            <input
                                                                value={accessory.accessories_type}
                                                                onChange={(e) => updateAccessory(index, 'accessories_type', e.target.value)}
                                                                placeholder="e.g., Sound Equipment"
                                                                className={inputCls}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                value={accessory.accessories}
                                                                onChange={(e) => updateAccessory(index, 'accessories', e.target.value)}
                                                                placeholder="e.g., Sound system"
                                                                className={inputCls}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 w-20">
                                                            <input
                                                                type="number"
                                                                value={accessory.qty}
                                                                onChange={(e) => updateAccessory(index, 'qty', parseInt(e.target.value) || 0)}
                                                                className={inputCls + ' text-center'}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 w-28">
                                                            <input
                                                                type="number"
                                                                value={accessory.rate}
                                                                onChange={(e) => updateAccessory(index, 'rate', parseFloat(e.target.value) || 0)}
                                                                className={inputCls}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 w-28">
                                                            <input
                                                                type="number"
                                                                value={accessory.amount}
                                                                readOnly
                                                                className="w-full px-3 py-2 border border-gray-100 rounded-xl text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 w-10 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAccessory(index)}
                                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-gray-100 bg-gray-50">
                                                    <td colSpan={4} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Accessories Total</td>
                                                    <td className="px-4 py-2.5 text-sm font-bold text-[#2D2A26]">
                                                        KSh {event.custom_accessories.reduce((s, a) => s + a.amount, 0).toLocaleString()}
                                                    </td>
                                                    <td />
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-5">

                        {/* Pricing Details */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Pricing Details</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Event Charges</label>
                                    <select
                                        value={event.custom_event_charges}
                                        onChange={(e) => handleInputChange('custom_event_charges', e.target.value)}
                                        className={selectCls}>
                                        <option value="Hourly">Hourly</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Flat">Flat Rate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Base Amount (KSh)</label>
                                    <input
                                        type="number"
                                        value={event.custom_amount}
                                        onChange={(e) => handleInputChange('custom_amount', parseFloat(e.target.value) || 0)}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Rate</label>
                                    <input
                                        value={event.custom_rate}
                                        onChange={(e) => handleInputChange('custom_rate', e.target.value)}
                                        placeholder="e.g., 5000 per hour"
                                        className={inputCls}
                                    />
                                </div>
                                {event.custom_event_charges === 'Daily' && (
                                    <div>
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">Daywise Rate (KSh)</label>
                                        <input
                                            type="number"
                                            value={event.custom_daywise_rate}
                                            onChange={(e) => handleInputChange('custom_daywise_rate', parseFloat(e.target.value) || 0)}
                                            className={inputCls}
                                        />
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Base Amount</span>
                                        <span className="font-medium text-[#2D2A26]">KSh {event.custom_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Accessories</span>
                                        <span className="font-medium text-[#2D2A26]">
                                            KSh {event.custom_accessories.reduce((sum, acc) => sum + acc.amount, 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base font-extrabold pt-2 border-t border-gray-100">
                                        <span className="text-[#2D2A26]">Final Amount</span>
                                        <span className="text-[#C69A11]">KSh {event.custom_final_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Quick Actions</p>
                            </div>
                            <div className="p-5 space-y-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/20 hover:opacity-90 transition-opacity disabled:opacity-60">
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        <><Save className="h-4 w-4" /> Save Event</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/events/all-events')}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
};

export default EventForm;