import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DoctorHeader from './DoctorHeader';
import { useAuth } from '../../contexts/AuthContext';
import FloatingDotsBackground from '../ui/FloatingDotsBackground';

const DoctorLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    // Desktop: Sidebar pushes content (layout shift)
    // Mobile: Sidebar overlays (handled by Sidebar component specific logic + backdrop)

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Navigation items based on user role
    const getNavItems = () => {
        // ... Logic from Header.jsx ...
        // Reusing the same list for now
        return [
            { name: 'Dashboard', href: '/doctor/dashboard' },
            { name: 'Appointments', href: '/doctor/appointments' },
            { name: 'Calendar', href: '/doctor/calendar' },
            { name: 'Patients', href: '/doctor/patients' },
            { name: 'Profit Analytics', href: '/doctor/profit' },
            { name: 'Off Days', href: '/doctor/offdays' },
        ];
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative">
            <FloatingDotsBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header always fixed at top */}
                <DoctorHeader
                    onToggleSidebar={toggleSidebar}
                    user={user}
                    onLogout={logout}
                />

                {/* Main content area below header (pt-16 = 64px) */}
                <div className="flex flex-1 pt-16">

                    {/* Sidebar Wrapper */}
                    {/* 
                   We control the width here for the push effect.
                   If isOpen, width is 16rem (w-64). If closed, width is 0.
                   This creates the "push" effect on the sibling main content.
                   
                   Note: The Sidebar component itself needs to NOT be position:fixed on desktop for this to work.
                   We will update Sidebar to accept a 'mode' or similar, or just styling props.
                */}
                    <div
                        className={`hidden md:block transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-0'
                            } overflow-hidden`}
                    >
                        {/* 
                       Render Sidebar but trick it into thinking it's always "open" visually inside this container,
                       or pass `isOpen` and let it handle animation?
                       
                       Better approach: Pass `isOpen={true}` to Sidebar so it renders its content, 
                       but we clip it with the parent div width. 
                       BUT Sidebar currently has `fixed inset-0` or `fixed top-16`. 
                       We need to tell Sidebar to be RELATIVE/STATIC on desktop.
                     */}
                        <div className="h-full w-64 border-r border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                            <Sidebar
                                isOpen={true} // Always "open" internally, parent toggles visibility
                                onClose={closeSidebar}
                                navItems={navItems}
                                variant="desktop" // New prop to disable fixed positioning
                            />
                        </div>
                    </div>

                    {/* Mobile Sidebar (fixed overlay) */}
                    <div className="md:hidden">
                        <Sidebar
                            isOpen={isSidebarOpen}
                            onClose={closeSidebar}
                            navItems={navItems}
                            variant="mobile"
                        />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 overflow-x-hidden p-6 transition-all duration-300">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DoctorLayout;
