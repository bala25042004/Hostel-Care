import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        hostelBlock: '',
        roomNumber: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { email, password, ...additionalData } = formData;
            await signup(email, password, additionalData);
            toast.success("Account created successfully!");

            // Redirect based on role
            if (formData.role === 'student') {
                navigate('/dashboard');
            } else {
                navigate('/admin');
            }
        } catch (error) {
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            setLoading(true);
            await loginWithGoogle({ role: formData.role });
            toast.success("Account created successfully!");

            // Redirect based on role
            if (formData.role === 'student') {
                navigate('/dashboard');
            } else {
                navigate('/admin');
            }
        } catch (error) {
            toast.error(error.message || "Failed to create account with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-900/5 -skew-y-12 transform origin-top-left -z-10" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md mt-4">
                <Link to="/" className="flex flex-col items-center gap-2 mb-4 transition-transform hover:scale-105">
                    <img src={logo} alt="HostelCare Logo" className="w-16 h-16 rounded-xl shadow-xl border-2 border-white" />
                    <h2 className="text-3xl font-extrabold text-primary-900">HostelCare</h2>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900 leading-9">
                    Create new account
                </h2>
                <p className="mt-2 text-center text-sm leading-5 text-gray-600 max-w">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:underline transition ease-in-out duration-150">
                        Log in here
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-primary-100">
                    <form onSubmit={handleRegister} className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium leading-5 text-gray-700">Full Name</label>
                                <Input name="name" value={formData.name} onChange={handleChange} required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-5 text-gray-700">Phone Number</label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium leading-5 text-gray-700">Email address</label>
                            <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium leading-5 text-gray-700">Password</label>
                            <Input name="password" type="password" value={formData.password} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium leading-5 text-gray-700">Role</label>
                                <Select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="student">Student</option>
                                    <option value="warden">Warden / Admin</option>
                                </Select>
                            </div>

                            {formData.role === 'student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium leading-5 text-gray-700">Hostel Block</label>
                                        <Input name="hostelBlock" value={formData.hostelBlock} onChange={handleChange} required={formData.role === 'student'} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium leading-5 text-gray-700">Room Number</label>
                                        <Input name="roomNumber" value={formData.roomNumber} onChange={handleChange} required={formData.role === 'student'} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 bg-primary-800 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 transition-all duration-200">
                                {loading ? 'Registering...' : 'Register'}
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
                                    Or register with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="button"
                                onClick={handleGoogleRegister}
                                disabled={loading}
                                variant="outline"
                                className="w-full h-10 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.32H19.28C21.36 18.4 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                                    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.32L15.72 17.57C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.81 14.07H2.15V16.91C3.96 20.51 7.72 23 12 23Z" fill="#34A853" />
                                    <path d="M5.81 14.07C5.58 13.39 5.45 12.66 5.45 11.91C5.45 11.16 5.58 10.43 5.81 9.75V6.91H2.15C1.39 8.42 1 10.12 1 11.91C1 13.7 1.39 15.4 2.15 16.91L5.81 14.07Z" fill="#FBBC05" />
                                    <path d="M12 5.19C13.62 5.19 15.06 5.75 16.2 6.84L19.35 3.69C17.45 1.93 14.96 0.910004 12 0.910004C7.72 0.910004 3.96 3.4 2.15 7.00L5.81 9.84C6.7 7.22 9.13 5.19 12 5.19Z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
