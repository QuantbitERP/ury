import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Command,
  User,
  ChevronDown,
  Monitor,
  LogOut,
  RefreshCw,
  Utensils,
  Wine,
  Building,
  Users,
  DoorOpen,
  Table,
  Clock,
  Settings,
  Globe,
} from 'lucide-react';
import { Button, Input } from './ui';
import { useRootStore } from '../store/root-store';
import { usePOSStore } from '../store/pos-store';
import type { RootState } from '../store/root-store';
import { logout } from '../lib/auth-api';
import { showToast } from './ui/toast';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showClockSettings, setShowClockSettings] = useState(false);
  const [showClockPopup, setShowClockPopup] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const clockSettingsRef = useRef<HTMLDivElement>(null);
  const clockPopupRef = useRef<HTMLDivElement>(null);
  const user = useRootStore((state: RootState) => state.user);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { searchQuery, setSearchQuery } = usePOSStore();
  const { orderSearchQuery, setOrderSearchQuery } = useRootStore();
  const [orderSearchInput, setOrderSearchInput] = useState(orderSearchQuery);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockMode, setClockMode] = useState<'digital' | 'analog'>('digital');
  const [timezone, setTimezone] = useState(() => {
    // Load saved timezone from localStorage on initial render
    return localStorage.getItem('clockTimezone') || 'local';
  });

  // Save timezone to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('clockTimezone', timezone);
  }, [timezone]);

  // Timezone options
  const timezones = [
    { value: 'local', label: 'Local Time', offset: 0 },
    { value: 'UTC', label: 'UTC', offset: 0 },
    { value: 'America/New_York', label: 'New York', offset: -5 },
    { value: 'America/Los_Angeles', label: 'Los Angeles', offset: -8 },
    { value: 'Europe/London', label: 'London', offset: 0 },
    { value: 'Europe/Paris', label: 'Paris', offset: 1 },
    { value: 'Asia/Tokyo', label: 'Tokyo', offset: 9 },
    { value: 'Asia/Dubai', label: 'Dubai', offset: 4 },
    { value: 'Asia/Kolkata', label: 'India', offset: 5.5 },
    { value: 'Australia/Sydney', label: 'Sydney', offset: 11 },
  ];

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get timezone-adjusted time
  const getTimeInTimezone = (date: Date, tz: string) => {
    if (tz === 'local') {
      return date;
    }
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const timeString = date.toLocaleTimeString('en-US', options);
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      const adjustedDate = new Date(date);
      adjustedDate.setHours(hours, minutes, seconds);
      return adjustedDate;
    } catch {
      return date;
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    const adjustedDate = getTimeInTimezone(date, timezone);
    return adjustedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timezone === 'local' ? undefined : timezone
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get timezone label
  const getTimezoneLabel = () => {
    const tz = timezones.find(t => t.value === timezone);
    return tz ? tz.label : 'Local Time';
  };

  // Calculate clock hands for analog clock
  const getClockHands = (date: Date) => {
    const adjustedDate = getTimeInTimezone(date, timezone);
    const hours = adjustedDate.getHours() % 12;
    const minutes = adjustedDate.getMinutes();
    const seconds = adjustedDate.getSeconds();
    
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;
    
    return { hourAngle, minuteAngle, secondAngle };
  };

  // Determine placeholder and handlers based on route
  let searchPlaceholder = 'Search orders, menu items, or customers...';
  let searchValue: string | undefined = undefined;
  let searchOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined = undefined;
  if (location.pathname === '/orders') {
    searchPlaceholder = 'Search Orders';
    searchValue = orderSearchInput;
    searchOnChange = (e) => setOrderSearchInput(e.target.value);
  } else if (location.pathname === '/') {
    searchPlaceholder = 'Search Menu';
    searchValue = searchQuery;
    searchOnChange = (e) => setSearchQuery(e.target.value);
  }

  // Debounce order search
  useEffect(() => {
    if (location.pathname !== '/orders') return;
    const handler = setTimeout(() => {
      setOrderSearchQuery(orderSearchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [orderSearchInput, setOrderSearchQuery, location.pathname]);

  // Keep input in sync with store (if cleared elsewhere)
  useEffect(() => {
    if (location.pathname === '/orders') {
      setOrderSearchInput(orderSearchQuery);
    }
  }, [location.pathname, orderSearchQuery]);

  // Handle clicks outside of menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (clockSettingsRef.current && !clockSettingsRef.current.contains(event.target as Node)) {
        setShowClockSettings(false);
      }
      if (clockPopupRef.current && !clockPopupRef.current.contains(event.target as Node)) {
        setShowClockPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleClockSettingsToggle = () => {
    setShowClockSettings(!showClockSettings);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login?redirect-to=%2Fpos';
    } catch (error) {
      showToast.error('Failed to logout. Please try again.');
    }
  };

  const handleClearCache = () => {
    // Clear all local storage
    localStorage.clear();
    // Clear all session storage
    sessionStorage.clear();
    // Reload the page
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/assets/ury/pos/ury_pos.png" 
              alt="URY POS" 
              className="h-10 w-auto"
            />
          </Link>
          
          {/* Navigation Links */}
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              POS
            </Link>
            <Link
              to="/orders"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/orders' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Orders
            </Link>
            <Link
              to="/kot"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                location.pathname === '/kot' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>KOT System</span>
            </Link>
            <Link
              to="/bar-display"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                location.pathname === '/bar-display' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wine className="w-4 h-4" />
              <span>Bar Orders</span>
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2 flex-1 flex items-center max-w-2xl mx-8  bg-gray-50 hover:bg-gray-100 border border-input rounded-md">
            <Input
              ref={searchInputRef}
              placeholder={searchPlaceholder}
              className="h-fit p-0 w-full bg-transparent border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchValue}
              onChange={searchOnChange}
            />
            <div className="flex items-center gap-2 text-gray-400">
              <Command className="w-4 h-4" />
              <span>K</span>
            </div>
        </div>

        {/* Live Clock */}
        <div className="relative" ref={clockSettingsRef}>
          <div 
            className="flex items-center space-x-3 px-4 py-2 cursor-pointer hover:bg-gray-50/50 transition-colors" 
            onMouseEnter={() => setShowClockPopup(true)}
            onClick={handleClockSettingsToggle}
          >
            {clockMode === 'digital' ? (
              <>
                <Clock className="w-4 h-4 text-[#E4B315]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{formatTime(currentTime)}</span>
                  <span className="text-xs text-gray-500">{getTimezoneLabel()}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="19" fill="white" stroke="#E4B315" strokeWidth="2"/>
                    {[12, 3, 6, 9].map((hour) => {
                      const angle = (hour - 12) * 30;
                      const x = 20 + 15 * Math.sin(angle * Math.PI / 180);
                      const y = 20 - 15 * Math.cos(angle * Math.PI / 180);
                      return (
                        <text key={hour} x={x} y={y + 1} textAnchor="middle" fontSize="3" fill="#374151">
                          {hour}
                        </text>
                      );
                    })}
                    {(() => {
                      const { hourAngle, minuteAngle, secondAngle } = getClockHands(currentTime);
                      return (
                        <>
                          <line x1="20" y1="20" x2="20" y2="8" stroke="#374151" strokeWidth="2" strokeLinecap="round" transform={`rotate(${hourAngle} 20 20)`}/>
                          <line x1="20" y1="20" x2="20" y2="6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${minuteAngle} 20 20)`}/>
                          <line x1="20" y1="20" x2="20" y2="5" stroke="#E4B315" strokeWidth="1" strokeLinecap="round" transform={`rotate(${secondAngle} 20 20)`}/>
                          <circle cx="20" cy="20" r="1.5" fill="#E4B315"/>
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">{getTimezoneLabel()}</span>
                </div>
              </div>
            )}
            <Settings className="w-3 h-3 text-gray-400" />
          </div>

          {/* Enlarged Clock Popup */}
          {showClockPopup && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-6"
              ref={clockPopupRef}
              onMouseLeave={() => setShowClockPopup(false)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Clock</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setClockMode('digital')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      clockMode === 'digital'
                        ? 'bg-[#E4B315] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Digital
                  </button>
                  <button
                    onClick={() => setClockMode('analog')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      clockMode === 'analog'
                        ? 'bg-[#E4B315] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Analog
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center mb-4">
                {clockMode === 'digital' ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-lg text-gray-600 mb-1">
                      {formatDate(currentTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getTimezoneLabel()}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="95" fill="white" stroke="#E4B315" strokeWidth="4"/>
                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => {
                        const angle = (hour - 12) * 30;
                        const x = 100 + 75 * Math.sin(angle * Math.PI / 180);
                        const y = 100 - 75 * Math.cos(angle * Math.PI / 180);
                        return (
                          <text key={hour} x={x} y={y + 3} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="500">
                            {hour}
                          </text>
                        );
                      })}
                      {(() => {
                        const { hourAngle, minuteAngle, secondAngle } = getClockHands(currentTime);
                        return (
                          <>
                            <line x1="100" y1="100" x2="100" y2="40" stroke="#374151" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`}/>
                            <line x1="100" y1="100" x2="100" y2="30" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteAngle} 100 100)`}/>
                            <line x1="100" y1="100" x2="100" y2="25" stroke="#E4B315" strokeWidth="2" strokeLinecap="round" transform={`rotate(${secondAngle} 100 100)`}/>
                            <circle cx="100" cy="100" r="4" fill="#E4B315"/>
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Clock Settings Dropdown */}
          {showClockSettings && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Clock Settings</h3>
              </div>
              <div className="py-2">
                <div className="px-4 py-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Clock Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setClockMode('digital')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        clockMode === 'digital'
                          ? 'bg-[#E4B315] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Digital
                    </button>
                    <button
                      onClick={() => setClockMode('analog')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        clockMode === 'analog'
                          ? 'bg-[#E4B315] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Analog
                    </button>
                  </div>
                </div>
                <div className="px-4 py-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              onClick={handleUserMenuToggle}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">{user?.full_name || 'User'}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.name || ''}</p>
                </div>
                <div className="py-2">
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => window.location.href = '/app'}
                  >
                    <Monitor className="w-4 h-4 mr-3" />
                    Switch To Desk
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => window.location.href = '/pos/branch-setup'}
                  >
                    <Building className="w-4 h-4 mr-3" />
                    Branch Setup
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => window.location.href = '/pos/restaurant-setup'}
                  >
                    <Utensils className="w-4 h-4 mr-3" />
                    Restaurant Setup
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => window.location.href = '/pos/user-setup'}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    User Setup
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => window.location.href = '/pos/room-setup'}
                  >
                    <DoorOpen className="w-4 h-4 mr-3" />
                    Room Setup
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => window.location.href = '/pos/table-setup'}
                  >
                    <Table className="w-4 h-4 mr-3" />
                    Table Setup
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={handleClearCache}
                  >
                    <RefreshCw className="w-4 h-4 mr-3" />
                    Clear Cache
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 