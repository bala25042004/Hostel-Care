import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Zap, Activity } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-3">
                    <img src={logo} alt="HostelCare Logo" className="w-10 h-10 object-contain rounded-lg shadow-lg" />
                    <span className="text-2xl font-bold tracking-tight">HostelCare</span>
                </div>
                <div className="space-x-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-primary-100 hover:text-white hover:bg-white/10">
                            Login
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button className="bg-accent-500 hover:bg-accent-600 text-white border-0 shadow-lg shadow-accent-500/30">
                            Register
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto px-6 pt-20 pb-32 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                    <div className="md:w-1/2 space-y-8">
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter">
                            Smarter Hostel Living. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-orange-300">
                                Resolved Faster.
                            </span>
                        </h1>
                        <p className="text-xl text-primary-200 leading-relaxed max-w-lg">
                            Report issues directly to your warden, track maintenance progress in real-time, and ensure a comfortable stay.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link to="/register">
                                <Button className="h-14 px-8 text-lg bg-white text-primary-900 hover:bg-primary-50">
                                    Get Started
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button className="h-14 px-8 text-lg bg-primary-700 hover:bg-primary-600 border border-primary-600">
                                    Student Portal
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-12 border-t border-primary-800/50">
                            <div className="space-y-2">
                                <Zap className="w-6 h-6 text-accent-400" />
                                <h3 className="font-semibold">Fast Sync</h3>
                                <p className="text-sm text-primary-300">Real-time updates</p>
                            </div>
                            <div className="space-y-2">
                                <Activity className="w-6 h-6 text-accent-400" />
                                <h3 className="font-semibold">Live Tracking</h3>
                                <p className="text-sm text-primary-300">Monitor status</p>
                            </div>
                            <div className="space-y-2">
                                <ShieldCheck className="w-6 h-6 text-accent-400" />
                                <h3 className="font-semibold">Secure</h3>
                                <p className="text-sm text-primary-300">Role-based access</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-1/2 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent-500/20 to-primary-500/20 blur-3xl rounded-full translate-y-12" />
                        <img
                            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000"
                            alt="Modern Student Hostel Structure"
                            className="relative z-10 rounded-2xl shadow-2xl shadow-black/50 border border-primary-700/50 object-cover h-[500px] w-full"
                        />
                    </div>

                </div>
            </main>

            {/* Decorative background blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/10 rounded-full blur-[120px]" />
            </div>
        </div>
    );
}
