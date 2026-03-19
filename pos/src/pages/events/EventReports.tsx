import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, DollarSign, Download, Filter, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

interface ReportStats {
    totalEvents: number;
    totalRevenue: number;
    totalGuests: number;
    averageRevenuePerEvent: number;
    upcomingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
}

interface MonthlyData {
    month: string;
    events: number;
    revenue: number;
    guests: number;
}

interface EventTypeData {
    eventType: string;
    count: number;
    revenue: number;
    percentage: number;
}

const EventReports: React.FC = () => {
    const [stats, setStats] = useState<ReportStats>({
        totalEvents: 0,
        totalRevenue: 0,
        totalGuests: 0,
        averageRevenuePerEvent: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [eventTypeData, setEventTypeData] = useState<EventTypeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            const fromDate = dateRange.from;
            const toDate = dateRange.to;

            const eventsResponse = await fetch(
                `/api/resource/Event?fields=["name","subject","starts_on","ends_on","status","custom_event_purpose","event_type","custom_capacity","custom_final_amount","custom_amount","custom_rate","custom_daywise_rate","event_category","custom_customer","custom_room","custom_event_charges","send_reminder","all_day","custom_accessories"]&filters=[["starts_on",">=","${fromDate}"],["starts_on","<=","${toDate}"]]&order_by=creation desc&limit=1000`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Frappe-CSRF-Token': (window as any).csrf_token ?? ''
                    }
                }
            );

            const eventsData = await eventsResponse.json();
            const events = Array.isArray(eventsData.data) ? eventsData.data : [];

            const totalEvents = events.length;
            const completedEvents = events.filter((event: any) => event.status === 'Completed').length;
            const upcomingEvents = events.filter((event: any) => event.status === 'Open').length;
            const cancelledEvents = events.filter((event: any) => event.status === 'Cancelled').length;
            const totalRevenue = events.reduce((sum: number, event: any) => sum + (event.custom_final_amount || 0), 0);
            const totalGuests = events.reduce((sum: number, event: any) => sum + (parseInt(event.custom_capacity) || 0), 0);
            const averageRevenuePerEvent = totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0;

            const calculatedStats: ReportStats = {
                totalEvents, totalRevenue, totalGuests, averageRevenuePerEvent,
                upcomingEvents, completedEvents, cancelledEvents
            };

            const monthlyMap: Record<string, MonthlyData> = {};
            events.forEach((event: any) => {
                if (!event.starts_on) return;
                const date = new Date(event.starts_on);
                const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (!monthlyMap[monthKey]) {
                    monthlyMap[monthKey] = { month: monthKey, events: 0, revenue: 0, guests: 0 };
                }
                monthlyMap[monthKey].events += 1;
                monthlyMap[monthKey].revenue += event.custom_final_amount || 0;
                monthlyMap[monthKey].guests += parseInt(event.custom_capacity) || 0;
            });
            const calculatedMonthlyData = Object.values(monthlyMap).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

            const eventTypeMap: Record<string, EventTypeData> = {};
            events.forEach((event: any) => {
                const eventType = event.custom_event_purpose || event.event_type || 'Unknown';
                if (!eventTypeMap[eventType]) {
                    eventTypeMap[eventType] = { eventType, count: 0, revenue: 0, percentage: 0 };
                }
                eventTypeMap[eventType].count += 1;
                eventTypeMap[eventType].revenue += event.custom_final_amount || 0;
            });
            const totalEventTypeRevenue = Object.values(eventTypeMap).reduce((sum: number, type: EventTypeData) => sum + type.revenue, 0);
            Object.values(eventTypeMap).forEach((type: EventTypeData) => {
                type.percentage = totalEventTypeRevenue > 0 ? Math.round((type.revenue / totalEventTypeRevenue) * 100) : 0;
            });
            const calculatedEventTypeData = Object.values(eventTypeMap).sort((a, b) => b.revenue - a.revenue);

            setStats(calculatedStats);
            setMonthlyData(calculatedMonthlyData);
            setEventTypeData(calculatedEventTypeData);
        } catch (error) {
            console.error('Error fetching report data:', error);
            setStats({ totalEvents: 0, totalRevenue: 0, totalGuests: 0, averageRevenuePerEvent: 0, upcomingEvents: 0, completedEvents: 0, cancelledEvents: 0 });
            setMonthlyData([]);
            setEventTypeData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = (format: 'pdf' | 'excel') => {
        console.log(`Exporting report as ${format}`);
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
                        <p className="mt-3 text-sm text-gray-400 font-medium">Loading reports…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#2D2A26] tracking-tight">Event Reports</h1>
                    <p className="text-sm text-gray-400 mt-1">Comprehensive analytics and insights for your events</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => exportReport('excel')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm">
                        <Download className="h-4 w-4" /> Export Excel
                    </button>
                    <button onClick={() => exportReport('pdf')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm">
                        <Download className="h-4 w-4" /> Export PDF
                    </button>
                </div>
            </div>

            {/* ── Date Range Filter ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-4">Filter Period</p>
                <div className="flex items-center gap-4 flex-wrap">
                    <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-600">Date Range:</span>
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 transition-colors"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 transition-colors"
                    />
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Events — accent */}
                <div className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#E4B315] to-[#C69A11] shadow-md shadow-[#E4B315]/20 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold tracking-wider uppercase text-white/80">Total Events</span>
                        <span className="p-2 rounded-xl bg-white/20 text-white"><Calendar className="w-4 h-4" /></span>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-white">{stats.totalEvents}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white">{stats.completedEvents} Completed</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white">{stats.upcomingEvents} Upcoming</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="relative rounded-2xl p-5 overflow-hidden bg-white border border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Total Revenue</span>
                        <span className="p-2 rounded-xl bg-[#E4B315]/10 text-[#C69A11]"><DollarSign className="w-4 h-4" /></span>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-[#2D2A26]">KSh {stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Avg: KSh {stats.averageRevenuePerEvent.toLocaleString()}/event</p>
                </div>

                {/* Total Guests */}
                <div className="relative rounded-2xl p-5 overflow-hidden bg-white border border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Total Guests</span>
                        <span className="p-2 rounded-xl bg-[#E4B315]/10 text-[#C69A11]"><Users className="w-4 h-4" /></span>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-[#2D2A26]">{stats.totalGuests.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Avg: {stats.totalEvents > 0 ? Math.round(stats.totalGuests / stats.totalEvents) : 0} guests/event
                    </p>
                </div>

                {/* Success Rate — alert if cancelled */}
                <div className="relative rounded-2xl p-5 overflow-hidden bg-white border border-gray-100 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Success Rate</span>
                        <span className="p-2 rounded-xl bg-[#E4B315]/10 text-[#C69A11]"><Activity className="w-4 h-4" /></span>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-[#2D2A26]">
                        {stats.totalEvents > stats.upcomingEvents
                            ? Math.round((stats.completedEvents / (stats.totalEvents - stats.upcomingEvents)) * 100)
                            : 0}%
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 mt-1">
                        {stats.cancelledEvents} Cancelled
                    </span>
                </div>
            </div>

            {/* ── Monthly Trends + Event Type Distribution ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Monthly Trends */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#C69A11]" />
                        <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Monthly Trends</p>
                    </div>
                    <div className="p-5 space-y-3">
                        {monthlyData.slice(-6).map((data, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[#E4B315]/5 rounded-xl border border-[#E4B315]/10">
                                <div>
                                    <p className="text-sm font-semibold text-[#2D2A26]">{data.month}</p>
                                    <p className="text-xs text-gray-400">{data.events} events</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#2D2A26]">KSh {data.revenue.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400">{data.guests} guests</p>
                                </div>
                            </div>
                        ))}
                        {monthlyData.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-6">No data in selected period</p>
                        )}
                    </div>
                </div>

                {/* Event Type Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-[#C69A11]" />
                        <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Event Type Distribution</p>
                    </div>
                    <div className="p-5 space-y-4">
                        {eventTypeData.map((data, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#2D2A26]">{data.eventType}</span>
                                    <span className="text-xs text-gray-500">
                                        {data.count} events ({data.percentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-[#E4B315] to-[#C69A11] h-2 rounded-full transition-all"
                                        style={{ width: `${data.percentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">KSh {data.revenue.toLocaleString()} revenue</p>
                            </div>
                        ))}
                        {eventTypeData.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-6">No data in selected period</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Performance Metrics ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#C69A11]" />
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">Performance Metrics</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="text-center p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Best Performing Month</p>
                            {monthlyData.length > 0 ? (
                                <>
                                    <p className="text-2xl font-extrabold text-[#C69A11]">
                                        {monthlyData.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyData[0]).month}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {monthlyData.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyData[0]).events} events ·{' '}
                                        KSh {monthlyData.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyData[0]).revenue.toLocaleString()}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl font-extrabold text-gray-300">No Data</p>
                                    <p className="text-xs text-gray-400 mt-1">No events in selected period</p>
                                </>
                            )}
                        </div>

                        <div className="text-center p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Most Popular Event Type</p>
                            {eventTypeData.length > 0 ? (
                                <>
                                    <p className="text-2xl font-extrabold text-[#C69A11]">{eventTypeData[0].eventType}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {eventTypeData[0].count} events · KSh {eventTypeData[0].revenue.toLocaleString()}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl font-extrabold text-gray-300">No Data</p>
                                    <p className="text-xs text-gray-400 mt-1">No events in selected period</p>
                                </>
                            )}
                        </div>

                        <div className="text-center p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Average Event Size</p>
                            <p className="text-2xl font-extrabold text-[#C69A11]">
                                {stats.totalEvents > 0 ? Math.round(stats.totalGuests / stats.totalEvents) : 0} guests
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Per event</p>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default EventReports;