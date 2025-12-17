import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, LayoutDashboard, LogOut, User } from 'lucide-react';

const SecretaryHeader = ({ selectedDoctor, onDoctorChange, doctors }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/secretary-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/secretary/schedule', label: 'Schedule', icon: Calendar },
        { path: '/secretary/payments', label: 'Payments', icon: Calendar },
        { path: '/secretary/chat', label: 'Chat', icon: Users },
    ];

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/');
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-indigo-600">DMS</h1>
                        <span className="ml-2 text-sm text-gray-500">Secretary</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-4">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Doctor Filter & Profile */}
                    <div className="flex items-center space-x-4">
                        {/* Doctor Dropdown */}
                        <select
                            value={selectedDoctor}
                            onChange={(e) => onDoctorChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Doctors</option>
                            {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>
                                    Dr. {doc.fullName}
                                </option>
                            ))}
                        </select>

                        {/* Profile Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100">
                                <User className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{user?.fullName || 'Secretary'}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <button
                                    onClick={() => navigate('/secretary/profile')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default SecretaryHeader;
