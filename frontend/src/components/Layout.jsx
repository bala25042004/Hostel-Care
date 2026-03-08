import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, LayoutDashboard, User, List, Settings, MessageSquareWarning } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error('Failed to logout');
        }
    };

    const navItems = (userData?.role === 'student') ? [
        { label: 'Student Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Track Complaints', icon: List, path: '/dashboard' },
        { label: 'My Profile', icon: User, path: '/dashboard/profile' },
    ] : [
        { label: 'Admin Overview', icon: LayoutDashboard, path: '/admin' },
        { label: 'Manage Complaints', icon: List, path: '/admin' },
        { label: 'My Profile', icon: User, path: '/admin/profile' },
        { label: 'Hostel Students', icon: User, path: '#' },
    ];

    return (
        <>
            {/* Sidebar for Desktop */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-primary-900 text-white transition-all duration-300 ease-in-out md:translate-x-0 shadow-2xl border-r border-primary-800",
                !isOpen && "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center px-6 h-20 border-b border-primary-800 bg-primary-950/50">
                        <div className="p-1 bg-white rounded-lg mr-3 shadow-lg shadow-accent-500/20">
                            <img src={logo} alt="Logo" className="w-8 h-8 rounded" />
                        </div>
                        <div>
                            <span className="text-xl font-bold block leading-tight">HostelCare</span>
                            <span className="text-[10px] uppercase tracking-widest text-primary-400 font-semibold">Management System</span>
                        </div>
                    </div>

                    <nav className="p-4 space-y-1.5 flex-grow mt-4 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    navigate(item.path);
                                    if (window.innerWidth < 768) setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    "text-primary-200 hover:text-white hover:bg-white/10 active:scale-95 group"
                                )}
                            >
                                <item.icon className="w-5 h-5 mr-3 text-primary-400 group-hover:text-accent-400 transition-colors" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 mt-auto border-t border-primary-800 bg-primary-950/30">
                        <div className="flex items-center p-3 mb-3 bg-white/5 rounded-2xl border border-white/5">
                            <img
                                src={userData?.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userData?.name}
                                alt="profile"
                                className="w-10 h-10 rounded-full ring-2 ring-primary-700 shadow-xl"
                            />
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-semibold truncate text-white">{userData?.name}</p>
                                <p className="text-[10px] text-accent-400 font-bold uppercase tracking-wider">{userData?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-300 hover:text-white hover:bg-red-500/20 transition-all active:scale-95"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { userData } = useAuth();

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-primary-100">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-primary-950/60 backdrop-blur-sm z-40 md:hidden transition-all duration-500"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="md:pl-72 flex flex-col min-h-screen transition-all duration-300">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-6 md:px-10 justify-between sticky top-0 z-30 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors active:scale-95"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="ml-4 md:ml-0">
                        <h2 className="text-xl font-bold text-slate-800 hidden md:block">
                            {userData?.role === 'student' ? 'Student Portal' : 'Warden Administration'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-slate-900">{userData?.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase">{userData?.hostelBlock || 'Admin'} - Room {userData?.roomNumber || 'N/A'}</span>
                        </div>
                        <img
                            src={userData?.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userData?.name}
                            alt="avatar"
                            className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm"
                        />
                    </div>
                </header>

                <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>

                <footer className="py-6 px-10 border-t border-slate-200 bg-white/50 text-center text-slate-400 text-xs font-medium">
                    &copy; 2026 HostelCare Management System. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
