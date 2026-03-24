import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { PageLayout } from '../../components/PageLayout';

interface Event {
    name: string;
    subject: string;
    starts_on: string;
    ends_on: string;
    status: string;
    custom_event_purpose: string;
    event_type: string;
    custom_capacity: string;
    custom_final_amount: number;
    event_category: string;
    customer?: string;
    deposit_status?: string;
    custom_room?: string;
    custom_amount?: number;
    custom_rate?: string;
    custom_daywise_rate?: number;
    custom_event_charges?: string;
    send_reminder?: number;
    repeat_this_event?: number;
    all_day?: number;
    sync_with_google_calendar?: number;
    add_video_conferencing?: number;
    pulled_from_google_calendar?: number;
    custom_accessories?: Array<{
        name: string;
        accessories_type: string;
        accessories: string;
        qty: number;
        rate: number;
        amount: number;
    }>;
}

interface MonthStats {
    total_events: number;
    confirmed: number;
    pending: number;
    revenue: number;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusMap: Record<string, string> = {
    'Completed': 'bg-green-50 text-green-700 border-green-200',
    'Open': 'bg-[#E4B315]/10 text-[#C69A11] border-[#E4B315]/30',
    'Confirmed': 'bg-green-50 text-green-700 border-green-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    'Closed': 'bg-sky-50 text-sky-700 border-sky-200',
};

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMap[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        {status}
    </span>
);

const EventCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [monthStats, setMonthStats] = useState<MonthStats>({ total_events: 0, confirmed: 0, pending: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const getFirstDayOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/resource/Event?fields=["*"]', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': 'None' }
            });

            if (!response.ok) throw new Error('Failed to fetch events');

            const data = await response.json();
            console.log('Calendar API Response:', data);

            if (!data || !data.data) {
                setEvents([]);
                setMonthStats({ total_events: 0, confirmed: 0, pending: 0, revenue: 0 });
                return;
            }

            const eventsArray: Event[] = Array.isArray(data.data) ? data.data : [];
            setEvents(eventsArray);

            const stats = eventsArray.reduce((acc, event) => {
                acc.total_events++;
                if (event.status === "Confirmed") acc.confirmed++;
                else acc.pending++;
                acc.revenue += event.custom_final_amount || 0;
                return acc;
            }, { total_events: 0, confirmed: 0, pending: 0, revenue: 0 });

            setMonthStats(stats);
        } catch (error) {
            const mockEvents: Event[] = [{
                name: "EV00014", subject: "Birthday Party",
                starts_on: "2025-10-10 19:30:00", ends_on: "2025-10-10 23:00:00",
                status: "Open", custom_event_purpose: "birthday party",
                event_type: "Private", custom_capacity: "200",
                custom_final_amount: 17600, event_category: "Event"
            }];
            setEvents(mockEvents);
            const stats = mockEvents.reduce((acc, event) => {
                acc.total_events++;
                if (event.status === "Confirmed") acc.confirmed++;
                else acc.pending++;
                acc.revenue += event.custom_final_amount || 0;
                return acc;
            }, { total_events: 0, confirmed: 0, pending: 0, revenue: 0 });
            setMonthStats(stats);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, [currentDate]);

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => {
            if (!event.starts_on) return false;
            const eventDate = new Date(event.starts_on);
            if (isNaN(eventDate.getTime())) return false;
            return eventDate.toISOString().split('T')[0] === dateStr;
        });
    };

    const safeFormatTime = (dateString: string) => {
        if (!dateString) return 'Invalid time';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid time';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50/30" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDate(date);
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={[
                        'h-24 border p-2 cursor-pointer transition-colors',
                        isSelected
                            ? 'bg-[#E4B315]/10 border-[#E4B315]/40'
                            : isToday
                                ? 'bg-[#E4B315]/5 border-[#E4B315]/20'
                                : 'border-gray-100 hover:bg-gray-50',
                    ].join(' ')}
                >
                    <div className={`text-sm font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-gradient-to-br from-[#E4B315] to-[#C69A11] text-white' : isSelected ? 'text-[#C69A11]' : 'text-[#2D2A26]'}`}>
                        {day}
                    </div>
                    {dayEvents.length > 0 && (
                        <div className="space-y-0.5">
                            {dayEvents.slice(0, 2).map((event, idx) => (
                                <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate
                                    ${event.status === 'Confirmed' || event.status === 'Completed'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-[#E4B315]/15 text-[#C69A11]'}`}>
                                    {event.subject}
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div className="text-[10px] text-gray-400 font-medium">+{dayEvents.length - 2} more</div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const navigateMonth = (direction: number) =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));

    const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto">
                        <div className="absolute inset-0 rounded-full border-2 border-[#E4B315]/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin" />
                    </div>
                    <p className="mt-3 text-sm text-gray-400 font-medium">Loading calendar…</p>
                </div>
            </div>
        );
    }

    return (
        <PageLayout
            title="Event Calendar"
            subtitle="Manage and view all your events in one place"
            actions={
                <button
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm">
                    <ChevronLeft className="h-4 w-4" /> Back to POS
                </button>
            }
        >
            <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

                    {/* ── Calendar ── */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                        {/* Calendar nav */}
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-[#C69A11]" />
                                <p className="text-sm font-bold text-[#2D2A26]">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigateMonth(-1)}
                                    className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button onClick={() => navigateMonth(1)}
                                    className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => window.location.href = '/pos/events/all-events?action=new'}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/20 hover:opacity-90 transition-opacity ml-2">
                                    <Plus className="h-3.5 w-3.5" /> Add Event
                                </button>
                            </div>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 border-b border-gray-50">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-2.5 px-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7">
                            {renderCalendarDays()}
                        </div>

                        {/* Legend */}
                        <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#E4B315] to-[#C69A11]" /> Today
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#E4B315]/15" /> Event
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-green-50 border border-green-200" /> Confirmed
                            </span>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-4">

                        {/* Selected date detail */}
                        {selectedDate && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-gray-50">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="p-4">
                                    {selectedDateEvents.length === 0 ? (
                                        <div className="text-center py-6">
                                            <div className="w-10 h-10 rounded-2xl bg-[#E4B315]/10 flex items-center justify-center mx-auto mb-3">
                                                <AlertCircle className="h-5 w-5 text-[#C69A11]" />
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">No events for this date</p>
                                            <button
                                                onClick={() => window.location.href = `/pos/events/all-events?action=new&date=${selectedDate.toISOString().split('T')[0]}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm hover:opacity-90 transition-opacity">
                                                <Plus className="h-3.5 w-3.5" /> Add Event
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedDateEvents.map((event, idx) => (
                                                <div key={idx}
                                                    className="p-3 rounded-xl border border-gray-100 hover:border-[#E4B315]/30 hover:bg-[#E4B315]/5 cursor-pointer transition-colors"
                                                    onClick={() => window.location.href = `/pos/events/all-events?id=${event.name}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-semibold text-[#2D2A26]">{event.subject}</p>
                                                        <StatusBadge status={event.status} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Clock className="h-3 w-3 text-gray-400" />
                                                            {safeFormatTime(event.starts_on)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Users className="h-3 w-3 text-gray-400" />
                                                            {event.custom_capacity || '0'} guests
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C69A11]">
                                                            <DollarSign className="h-3 w-3" />
                                                            KSh {event.custom_final_amount ? event.custom_final_amount.toLocaleString() : '0'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Month Statistics */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">This Month</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Total Events</span>
                                    <span className="text-sm font-bold text-[#2D2A26]">{monthStats.total_events}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Confirmed</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                        {monthStats.confirmed}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Pending</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4B315]/10 text-[#C69A11] border border-[#E4B315]/30">
                                        {monthStats.pending}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-sm text-gray-500">Revenue</span>
                                    <span className="text-sm font-bold text-[#C69A11]">
                                        KSh {monthStats.revenue ? monthStats.revenue.toLocaleString() : '0'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default EventCalendar;