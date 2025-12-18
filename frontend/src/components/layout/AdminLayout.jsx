import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Stethoscope, 
    Settings, 
    LogOut, 
    Users, 
    Shield, 
    BarChart2, 
    Calendar, 
    Mail,
    Phone,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/patients', icon: Users, label: 'Patients' },
        { path: '/admin/blocked-phones', icon: Phone, label: 'Blocked Phones' },
        { path: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
        { path: '/admin/reports', icon: BarChart2, label: 'Reports' },
        { path: '/admin/schedule', icon: Calendar, label: 'Schedule' },
        { path: '/admin/treatments', icon: Stethoscope, label: 'Treatments' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
        { path: '/admin/email-templates', icon: Mail, label: 'Email Templates' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside 
                className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out fixed h-screen z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    {!isCollapsed && (
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-gray-800 text-lg truncate"
                        >
                            Admin Panel
                        </motion.span>
                    )}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                                isActive(item.path) 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon size={20} className={`flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'group-hover:text-blue-600'}`} />
                            {!isCollapsed && (
                                <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`flex items-center space-x-3 px-3 py-2.5 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all group relative ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                        {!isCollapsed && <span className="font-bold text-sm">Sign Out</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                Sign Out
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
                        >
                            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                                <span className="font-bold text-gray-800 text-lg">Admin Panel</span>
                                <button 
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-1.5 rounded-lg bg-gray-50 text-gray-400"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                            isActive(item.path) 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <item.icon size={20} />
                                        <span className="font-bold text-sm">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                            <div className="p-4 bg-gray-50 m-4 rounded-2xl border border-gray-100">
                                <button
                                    onClick={() => {
                                        setIsMobileOpen(false);
                                        setShowLogoutModal(true);
                                    }}
                                    className="flex items-center space-x-3 px-4 py-3 w-full text-red-500 hover:bg-white rounded-xl transition-all font-bold text-sm"
                                >
                                    <LogOut size={20} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Mobile Header */}
                <header className="h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
                    <button 
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-800">Admin Panel</span>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                        A
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutModal(false)}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                                <LogOut size={40} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                            <p className="text-gray-500 mb-8 font-medium px-4">
                                Are you sure you want to log out from the admin dashboard?
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={logout}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Yes, Log Me Out
                                </button>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLayout;
