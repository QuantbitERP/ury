// Event Service - Handles API calls to Frappe backend for Event Management

const API_BASE_URL = 'http://103.219.1.138:4414';

export interface Event {
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

export interface Accessory {
    name?: string;
    accessories_type: string;
    accessories: string;
    qty: number;
    rate: number;
    amount: number;
}

export interface EventType {
    name: string;
    event_type_name: string;
    description?: string;
    default_duration: number;
    default_price: number;
    average_guests: number;
    status: string;
}

export interface MenuPackage {
    name: string;
    package_name: string;
    description?: string;
    price_per_person: number;
    minimum_guests: number;
    maximum_guests: number;
    includes_items: string[];
    dietary_options: string[];
    status: string;
}

// Get API credentials from localStorage or context
const getAuthHeaders = () => {
    const apiKey = localStorage.getItem('apiKey') || '';
    const apiSecret = localStorage.getItem('apiSecret') || '';
    
    return {
        'Authorization': `token ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json'
    };
};

// Event API calls
export const eventService = {
    // Get all events
    async getEvents(filters?: any): Promise<Event[]> {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value as string);
                });
            }
            
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event?${params.toString()}`,
                {
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Get single event by name
    async getEvent(name: string): Promise<Event> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event/${name}`,
                {
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    },

    // Create new event
    async createEvent(event: Partial<Event>): Promise<Event> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(event)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    // Update existing event
    async updateEvent(name: string, event: Partial<Event>): Promise<Event> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event/${name}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(event)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    // Delete event
    async deleteEvent(name: string): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event/${name}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    // Get events for a specific date range
    async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event?filters=[["starts_on",">=","${startDate}"],["starts_on","<=","${endDate}"]]`,
                {
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching events by date range:', error);
            throw error;
        }
    }
};

// Event Type API calls
export const eventTypeService = {
    // Get all event types
    async getEventTypes(): Promise<EventType[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event%20Type`,
                {
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching event types:', error);
            throw error;
        }
    },

    // Create new event type
    async createEventType(eventType: Partial<EventType>): Promise<EventType> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event%20Type`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(eventType)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error creating event type:', error);
            throw error;
        }
    },

    // Update event type
    async updateEventType(name: string, eventType: Partial<EventType>): Promise<EventType> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event%20Type/${name}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(eventType)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error updating event type:', error);
            throw error;
        }
    },

    // Delete event type
    async deleteEventType(name: string): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Event%20Type/${name}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting event type:', error);
            throw error;
        }
    }
};

// Menu Package API calls
export const menuPackageService = {
    // Get all menu packages
    async getMenuPackages(): Promise<MenuPackage[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Menu%20Package`,
                {
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching menu packages:', error);
            throw error;
        }
    },

    // Create new menu package
    async createMenuPackage(menuPackage: Partial<MenuPackage>): Promise<MenuPackage> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Menu%20Package`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(menuPackage)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error creating menu package:', error);
            throw error;
        }
    },

    // Update menu package
    async updateMenuPackage(name: string, menuPackage: Partial<MenuPackage>): Promise<MenuPackage> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Menu%20Package/${name}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(menuPackage)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error updating menu package:', error);
            throw error;
        }
    },

    // Delete menu package
    async deleteMenuPackage(name: string): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Menu%20Package/${name}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting menu package:', error);
            throw error;
        }
    }
};

// Reports API calls
export const reportService = {
    // Get event statistics
    async getEventStats(dateRange?: { from: string; to: string }): Promise<any> {
        try {
            // This would typically call a custom Frappe method
            const response = await fetch(
                `${API_BASE_URL}/api/method/ury.events.get_event_stats`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ date_range: dateRange })
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.message || {};
        } catch (error) {
            console.error('Error fetching event stats:', error);
            throw error;
        }
    },

    // Get monthly event data
    async getMonthlyEventData(year: number): Promise<any[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/method/ury.events.get_monthly_event_data`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ year })
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.message || [];
        } catch (error) {
            console.error('Error fetching monthly event data:', error);
            throw error;
        }
    },

    // Get event type distribution
    async getEventTypeDistribution(dateRange?: { from: string; to: string }): Promise<any[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/method/ury.events.get_event_type_distribution`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ date_range: dateRange })
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.message || [];
        } catch (error) {
            console.error('Error fetching event type distribution:', error);
            throw error;
        }
    }
};

export default {
    eventService,
    eventTypeService,
    menuPackageService,
    reportService
};
