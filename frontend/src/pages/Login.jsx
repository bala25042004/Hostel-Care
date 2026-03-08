import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { Github, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error("Please fill in all fields");
        try {
            setLoading(true);
            await login(email, password);
            toast.success("Successfully logged in!");
            navigate('/dashboard'); // Let App.jsx ProtectedRoute handle redirect if admin
        } catch (error) {
            toast.error(error.message || "Failed to log in");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await loginWithGoogle();
            toast.success("Successfully logged in with Google!");
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || "Failed to log in with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-900/5 -skew-y-12 transform origin-top-left -z-10" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
                <Link to="/" className="flex flex-col items-center gap-2 mb-6 transition-transform hover:scale-105">
                    <img src={logo} alt="HostelCare Logo" className="w-16 h-16 rounded-xl shadow-xl border-2 border-white" />
                    <h2 className="text-3xl font-extrabold text-primary-900">HostelCare</h2>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900 leading-9">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm leading-5 text-gray-600 max-w">
                    Or{' '}
                    <Link to="/register" className="font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:underline transition ease-in-out duration-150">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-primary-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium leading-5 text-gray-700">Email address</label>
                            <div className="mt-1 rounded-md shadow-sm">
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium leading-5 text-gray-700">Password</label>
                            <div className="mt-1 rounded-md shadow-sm">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember_me" type="checkbox" className="form-checkbox h-4 w-4 text-accent-600 transition duration-150 ease-in-out" />
                                <label htmlFor="remember_me" className="ml-2 block text-sm leading-5 text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm leading-5">
                                <a href="#" className="font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:underline transition ease-in-out duration-150">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 bg-primary-800 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 transition-all duration-200">
                                {loading ? 'Signing in...' : 'Sign in'}
                                {!loading && <LogIn className="ml-2 w-4 h-4" />}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm leading-5">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                variant="outline"
                                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out h-10"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.32H19.28C21.36 18.4 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                                    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.32L15.72 17.57C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.81 14.07H2.15V16.91C3.96 20.51 7.72 23 12 23Z" fill="#34A853" />
                                    <path d="M5.81 14.07C5.58 13.39 5.45 12.66 5.45 11.91C5.45 11.16 5.58 10.43 5.81 9.75V6.91H2.15C1.39 8.42 1 10.12 1 11.91C1 13.7 1.39 15.4 2.15 16.91L5.81 14.07Z" fill="#FBBC05" />
                                    <path d="M12 5.19C13.62 5.19 15.06 5.75 16.2 6.84L19.35 3.69C17.45 1.93 14.96 0.910004 12 0.910004C7.72 0.910004 3.96 3.4 2.15 7.00L5.81 9.84C6.7 7.22 9.13 5.19 12 5.19Z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
