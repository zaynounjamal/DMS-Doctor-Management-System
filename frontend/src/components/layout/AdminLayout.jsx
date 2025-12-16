import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Settings, LogOut, Users, Shield, BarChart2, Calendar, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/dashboard') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/users"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/users') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Users size={20} />
                        <span className="font-medium">Users</span>
                    </Link>

                    <Link
                        to="/admin/patients"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/patients') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Users size={20} />
                        <span className="font-medium">Patients</span>
                    </Link>

                    <Link
                        to="/admin/audit-logs"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/audit-logs') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Shield size={20} />
                        <span className="font-medium">Audit Logs</span>
                    </Link>

                    <Link
                        to="/admin/reports"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/reports') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <BarChart2 size={20} />
                        <span className="font-medium">Reports</span>
                    </Link>

                    <Link
                        to="/admin/schedule"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/schedule') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Calendar size={20} />
                        <span className="font-medium">Schedule</span>
                    </Link>

                    <Link
                        to="/admin/treatments"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/treatments') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Stethoscope size={20} />
                        <span className="font-medium">Treatments</span>
                    </Link>

                    <Link
                        to="/admin/settings"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/settings') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings (Footer)</span>
                    </Link>

                    <Link
                        to="/admin/email-templates"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/email-templates') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Mail size={20} />
                        <span className="font-medium">Email Templates</span>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
