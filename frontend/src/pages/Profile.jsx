import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Home, Shield, Calendar, Camera, Save, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
    const { userData, currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        phone: userData?.phone || '',
        roomNumber: userData?.roomNumber || '',
        hostelBlock: userData?.hostelBlock || '',
        bio: userData?.bio || 'No bio provided.'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            return toast.error("Please select an image file.");
        }

        // Firestore has a 1MB limit for the whole document. 
        // We restrict images to ~500KB to safely fit.
        if (file.size > 500 * 1024) {
            return toast.error("Image too large for free tier. Please select an image under 500KB.");
        }

        try {
            setUploading(true);

            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64String = reader.result;

                // Save directly to Firestore
                await updateDoc(doc(db, 'users', currentUser.uid), {
                    profilePic: base64String
                });

                toast.success("Profile picture updated!");
                setUploading(false);
            };
            reader.onerror = (error) => {
                console.error("FileReader Error:", error);
                toast.error("Failed to read image file.");
                setUploading(false);
            };

        } catch (error) {
            toast.error("Failed to update profile picture.");
            console.error(error);
            setUploading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await updateDoc(doc(db, 'users', currentUser.uid), {
                ...formData,
                updatedAt: new Date().toISOString()
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Card */}
                <Card className="w-full md:w-80 overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary-900 to-primary-800 text-white">
                    <CardContent className="p-0">
                        <div className="relative h-32 bg-primary-950/50 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            <div className="z-10 bg-accent-500 p-2 rounded-full shadow-2xl">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="px-6 pb-8 -mt-12 relative flex flex-col items-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <div className="relative group cursor-pointer" onClick={handleImageClick}>
                                <div className="relative">
                                    <img
                                        src={userData?.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userData?.name}
                                        alt="profile"
                                        className={cn(
                                            "w-24 h-24 rounded-full border-4 border-primary-800 shadow-2xl transition-all group-hover:brightness-75",
                                            uploading && "brightness-50"
                                        )}
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 p-1.5 bg-accent-500 rounded-full border-2 border-primary-800 group-hover:bg-accent-600 transition-colors">
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <h2 className="mt-4 text-xl font-bold">{userData?.name}</h2>
                            <p className="text-primary-300 text-xs font-bold uppercase tracking-widest">{userData?.role}</p>

                            <div className="w-full mt-6 space-y-3">
                                <div className="flex items-center text-sm text-primary-100">
                                    <Mail className="w-4 h-4 mr-3 text-primary-400" />
                                    <span className="truncate">{userData?.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-primary-100">
                                    <Calendar className="w-4 h-4 mr-3 text-primary-400" />
                                    <span>Joined {new Date(userData?.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <div className="flex-1 w-full space-y-6">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="text-lg">Edit Personal Information</CardTitle>
                            <CardDescription>Keep your profile details up to date for better communication.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-primary-500" /> Full Name
                                    </label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-primary-500" /> Phone Number
                                    </label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                {userData?.role === 'student' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                                <Home className="w-4 h-4 mr-2 text-primary-500" /> Hostel Block
                                            </label>
                                            <Input
                                                name="hostelBlock"
                                                value={formData.hostelBlock}
                                                onChange={handleChange}
                                                placeholder="e.g. A-Block"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 flex items-center">
                                                <Shield className="w-4 h-4 mr-2 text-primary-500" /> Room Number
                                            </label>
                                            <Input
                                                name="roomNumber"
                                                value={formData.roomNumber}
                                                onChange={handleChange}
                                                placeholder="e.g. 302"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center">
                                        About Me
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        placeholder="Write something about yourself..."
                                    />
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-primary-800 hover:bg-primary-900 px-8 py-6 rounded-xl shadow-lg shadow-primary-900/20"
                                    >
                                        {loading ? 'Saving Changes...' : 'Save Profile'}
                                        {!loading && <Save className="ml-2 w-4 h-4" />}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-yellow-50/50 border-l-4 border-yellow-400">
                        <CardContent className="p-4 flex gap-4">
                            <div className="p-2 bg-yellow-100 rounded-lg h-fit">
                                <Shield className="w-5 h-5 text-yellow-700" />
                            </div>
                            <div>
                                <h4 className="font-bold text-yellow-900 text-sm">Security Tip</h4>
                                <p className="text-yellow-800 text-xs mt-1 leading-relaxed">
                                    Your email address ({userData?.email}) is your primary identifier and cannot be changed. If you notice any suspicious activity, please contact the IT Warden immediately.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
