import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import toast from 'react-hot-toast';
import { Plus, Clock, Search, ListFilter, Eye } from 'lucide-react';

const CATEGORIES = [
    { id: 'water', label: '💧 Water Issue' },
    { id: 'bathroom', label: '🚽 Bathroom / Toilet' },
    { id: 'electricity', label: '💡 Electricity / Light' },
    { id: 'fan', label: '🌀 Fan / AC' },
    { id: 'food', label: '🍽️ Food Quality / Mess' },
    { id: 'pest', label: '🐜 Pest Control' },
    { id: 'wifi', label: '📶 WiFi / Internet' },
    { id: 'furniture', label: '🪑 Furniture Damage' },
    { id: 'cleanliness', label: '🧹 Cleanliness / Housekeeping' },
    { id: 'other', label: '📦 Other' }
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function StudentDashboard() {
    const { userData, currentUser } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: CATEGORIES[0].id,
        subDescription: '',
        priority: 'Low',
        photoUrl: ''
    });

    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'complaints'),
            where('studentId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            setComplaints(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleFileComplaint = async (e) => {
        e.preventDefault();
        try {
            if (!formData.subDescription) return toast.error("Please describe the issue.");
            const generatedId = `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            await addDoc(collection(db, 'complaints'), {
                complaintId: generatedId,
                studentId: currentUser.uid,
                studentName: userData.name,
                studentEmail: userData.email,
                roomNumber: userData.roomNumber,
                hostelBlock: userData.hostelBlock,
                category: formData.category,
                subDescription: formData.subDescription,
                priority: formData.priority,
                photoUrl: formData.photoUrl || '',
                status: 'Pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                statusHistory: [{
                    status: 'Submitted',
                    timestamp: new Date().toISOString(),
                    note: 'Complaint filed successfully.'
                }]
            });

            toast.success("Complaint filed successfully!");
            setShowForm(false);
            setFormData({
                category: CATEGORIES[0].id,
                subDescription: '',
                priority: 'Low',
                photoUrl: ''
            });
        } catch (error) {
            toast.error("Failed to file complaint");
            console.error(error);
        }
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const activeComplaintsCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Welcome back, {userData?.name?.split(' ')[0]} 👋
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500">
                            Room: <span className="font-semibold text-primary-700">{userData?.roomNumber}</span> | Block: <span className="font-semibold text-primary-700">{userData?.hostelBlock}</span>
                        </p>
                    </div>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    File New Complaint
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Filed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{complaints.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{activeComplaintsCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{complaints.length - activeComplaintsCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Complaints</CardTitle>
                    <CardDescription>Track the status of your reported issues</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-6">Loading complaints...</div>
                    ) : complaints.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <div className="mb-4">
                                <ListFilter className="w-12 h-12 mx-auto text-gray-300" />
                            </div>
                            You have not filed any complaints yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Priority</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                    {complaints.map(complaint => (
                                        <tr key={complaint.id} className="bg-white dark:bg-zinc-900">
                                            <td className="px-6 py-4 font-medium">{complaint.complaintId}</td>
                                            <td className="px-6 py-4">
                                                {CATEGORIES.find(c => c.id === complaint.category)?.label || complaint.category}
                                            </td>
                                            <td className="px-6 py-4">
                                                {complaint.createdAt ? new Date(complaint.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${complaint.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                                                        complaint.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                                            complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'}`}>
                                                    {complaint.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(complaint)}>
                                                    Track <Eye className="w-4 h-4 ml-2" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* New Complaint Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg bg-white shadow-2xl">
                        <CardHeader>
                            <CardTitle>File New Complaint</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFileComplaint} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <Select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                                        placeholder="Please describe the issue in detail..."
                                        value={formData.subDescription}
                                        onChange={(e) => setFormData({ ...formData, subDescription: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Priority</label>
                                        <Select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            {PRIORITIES.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Photo URL (Optional)</label>
                                        <Input
                                            placeholder="https://..."
                                            value={formData.photoUrl}
                                            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Submit Complaint
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Track Complaint Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary-600" />
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Complaint Status</span>
                                <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(selectedComplaint.status)}`}>
                                    {selectedComplaint.status}
                                </span>
                            </CardTitle>
                            <CardDescription>
                                ID: {selectedComplaint.complaintId} • {CATEGORIES.find(c => c.id === selectedComplaint.category)?.label}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6 pl-4 border-l-2 border-primary-200 relative mt-4">
                                {selectedComplaint.statusHistory?.map((historyItem, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[25px] flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 ring-4 ring-white border-2 border-primary-500">
                                            <Clock className="w-3 h-3 text-primary-700" />
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-semibold text-gray-900">{historyItem.status}</h4>
                                            <p className="text-sm text-gray-500">{new Date(historyItem.timestamp).toLocaleString()}</p>
                                            {historyItem.note && (
                                                <p className="text-sm mt-1 text-gray-700 bg-gray-50 p-2 rounded">{historyItem.note}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button onClick={() => setSelectedComplaint(null)}>Close</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}


        </div>
    );
}
