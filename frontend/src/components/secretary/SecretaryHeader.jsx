import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, LayoutDashboard, LogOut, User, Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnreadCount } from '../../chatApi';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getChatHubConnection, isChatHubConnected, startChatHub } from '../../signalr/chatHub';

const SecretaryHeader = ({ selectedDoctor, onDoctorChange, doctors }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const { lang, toggle } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const [unreadSummary, setUnreadSummary] = React.useState({ unreadMessages: 0, unreadConversations: 0 });
    const prevUnreadMessagesRef = React.useRef(0);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const navItems = [
        { path: '/secretary-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/secretary/schedule', label: 'Schedule', icon: Calendar },
        { path: '/secretary/payments', label: 'Payments', icon: Calendar },
        { path: '/secretary/chat', label: 'Chat', icon: Users },
    ];

    React.useEffect(() => {
        let mounted = true;

        const refreshUnread = async (silent = true) => {
            try {
                const data = await getUnreadCount();
                if (!mounted) return;
                const next = data || { unreadMessages: 0, unreadConversations: 0 };
                
                // Frontend-only fix: For secretaries, filter out notifications for messages they sent
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userRole = (user.role || '').toLowerCase();
                
                if (userRole === 'secretary') {
                    // For secretaries, we need to be more careful about notifications
                    // Since the backend doesn't distinguish between sent/received messages,
                    // we'll use a conservative approach: only show notifications when
                    // the secretary is not actively in the chat interface
                    
                    const isInChatPage = window.location.pathname === '/secretary/chat';
                    
                    if (isInChatPage) {
                        // If secretary is actively in chat, don't show notifications in header
                        // They can see the unread counts in the chat interface itself
                        setUnreadSummary({ unreadMessages: 0, unreadConversations: 0 });
                    } else {
                        // If not in chat page, show notifications but be conservative
                        setUnreadSummary(next);
                    }
                } else {
                    // For patients and other roles, show notifications normally
                    setUnreadSummary(next);
                }

                const prevUnreadMessages = prevUnreadMessagesRef.current || 0;
                if (next.unreadMessages > prevUnreadMessages && !window.location.pathname.includes('/chat')) {
                    showToast('New chat message received', 'info');
                }
                prevUnreadMessagesRef.current = next.unreadMessages;
            } catch (e) {
                if (!silent) {
                    showToast(e.message || 'Failed to load unread count', 'error');
                }
            }
        };

        refreshUnread(true);
        const interval = setInterval(() => {
            if (!isChatHubConnected()) {
                refreshUnread(true);
            }
        }, 6000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [showToast]);

    React.useEffect(() => {
        let mounted = true;
        const conn = getChatHubConnection();

        const onUnread = (payload) => {
            if (!mounted) return;
            const next = payload || { unreadMessages: 0, unreadConversations: 0 };
            
            // Frontend-only fix: For secretaries, filter out notifications for messages they sent
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userRole = (user.role || '').toLowerCase();
            
            if (userRole === 'secretary') {
                // For secretaries, only show notifications when not in chat page
                const isInChatPage = window.location.pathname === '/secretary/chat';
                
                if (isInChatPage) {
                    // If secretary is actively in chat, don't show notifications in header
                    setUnreadSummary({ unreadMessages: 0, unreadConversations: 0 });
                } else {
                    // If not in chat page, show notifications
                    setUnreadSummary(next);
                }
            } else {
                // For patients and other roles, show notifications normally
                setUnreadSummary(next);
            }

            const prevUnreadMessages = prevUnreadMessagesRef.current || 0;
            if (Number(next.unreadMessages || 0) > prevUnreadMessages && !window.location.pathname.includes('/chat')) {
                showToast('New chat message received', 'info');
            }
            prevUnreadMessagesRef.current = Number(next.unreadMessages || 0);
        };

        startChatHub().catch(() => {
        });
        conn.on('chat:unread', onUnread);

        return () => {
            mounted = false;
            conn.off('chat:unread', onUnread);
        };
    }, [showToast]);

    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Logo and Mobile Menu Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 -ml-2 rounded-md md:hidden hover:bg-gray-100 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center cursor-pointer" onClick={() => navigate('/secretary-dashboard')}>
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                                D
                            </div>
                            <div className="ml-3 hidden sm:block">
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">DMS</h1>
                                <span className="text-xs text-indigo-600 font-medium font-mono uppercase tracking-wider">Secretary Panel</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Navigation Links (Desktop Only) */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            const isChat = item.path === '/secretary/chat';
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                                    <span className="relative">
                                        {item.label}
                                        {isChat && Number(unreadSummary.unreadConversations || 0) > 0 ? (
                                            <span className="absolute -top-2 -right-4 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                                {Number(unreadSummary.unreadConversations || 0)}
                                            </span>
                                        ) : null}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right: Doctor Filter & Profile */}
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-indigo-600" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={toggle}
                            className="px-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title="Language"
                            aria-label="Language"
                        >
                            {lang === 'ar' ? 'AR' : 'EN'}
                        </button>
                        <div className="hidden lg:block relative">
                            <select
                                value={selectedDoctor}
                                onChange={(e) => onDoctorChange(e.target.value)}
                                className="appearance-none pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.fullName}
                                    </option>
                                ))}
                            </select>
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {user?.fullName?.charAt(0) || 'S'}
                                </div>
                                <div className="hidden sm:block text-left mr-1">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{user?.fullName || 'Secretary'}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-none">Online</p>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsProfileMenuOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-40 py-1"
                                        >
                                            <button
                                                onClick={() => { navigate('/secretary/profile'); setIsProfileMenuOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                                                My Profile
                                            </button>
                                            <div className="h-px bg-gray-100 mx-4 my-1" />
                                            <button
                                                onClick={() => { handleLogout(); setIsProfileMenuOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col md:hidden"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">D</div>
                                    <span className="ml-2 font-bold text-gray-900 dark:text-white">Secretary</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-4 space-y-2 flex-1">
                                {navItems.map(item => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    const isChat = item.path === '/secretary/chat';
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                                            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                                            <span className="relative">
                                                {item.label}
                                                {isChat && Number(unreadSummary.unreadConversations || 0) > 0 ? (
                                                    <span className="absolute -top-2 -right-4 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                                        {Number(unreadSummary.unreadConversations || 0)}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 px-4 uppercase tracking-widest">Doctor Selection</p>
                                <select
                                    value={selectedDoctor}
                                    onChange={(e) => onDoctorChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none"
                                >
                                    <option value="">All Doctors</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>Dr. {doc.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                title="Confirm Logout"
                message="Are you sure you want to log out of the secretary panel? You'll need to sign in again to access the dashboard."
                onConfirm={() => {
                    setIsLogoutModalOpen(false);
                    logout();
                    navigate('/');
                }}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Logout"
                type="danger"
            />
        </header>
    );
};

export default SecretaryHeader;
