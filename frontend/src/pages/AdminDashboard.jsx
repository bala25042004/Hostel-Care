import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';
import { Download, Search, Settings2, Clock, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '../lib/api';

const CATEGORIES = [
    { id: 'water', label: '💧 Water Issue' },
    { id: 'bathroom', label: '🚽 Bathroom / Toilet' },
    { id: 'electricity', label: '💡 Electricity / Light' },
    { id: 'fan', label: '🌀 Fan / AC' },
    { id: 'food', label: '🍽️ Food Quality' },
    { id: 'pest', label: '🐜 Pest Control' },
    { id: 'wifi', label: '📶 WiFi / Internet' },
    { id: 'furniture', label: '🪑 Furniture' },
    { id: 'cleanliness', label: '🧹 Cleanliness' },
    { id: 'other', label: '📦 Other' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#413ea0', '#f44336', '#9c27b0'];

export default function AdminDashboard() {
    const { userData } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Selected
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [updateData, setUpdateData] = useState({ status: '', note: '', assignedTo: '' });

    useEffect(() => {
        const q = query(collection(db, 'complaints'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            setComplaints(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!updateData.status || !selectedComplaint) return;
        try {
            const complaintRef = doc(db, 'complaints', selectedComplaint.id);

            const newHistoryItem = {
                status: updateData.status,
                timestamp: new Date().toISOString(),
                note: updateData.note || `Status updated to ${updateData.status} by Admin`,
            };

            await updateDoc(complaintRef, {
                status: updateData.status,
                assignedTo: updateData.assignedTo || selectedComplaint.assignedTo || '',
                adminRemarks: updateData.note || selectedComplaint.adminRemarks || '',
                updatedAt: serverTimestamp(),
                statusHistory: [...(selectedComplaint.statusHistory || []), newHistoryItem]
            });

            // Trigger Email Notification via Backend
            try {
                await fetch(getApiUrl('/api/notifications/status-update'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail: selectedComplaint.studentEmail,
                        studentName: selectedComplaint.studentName,
                        complaintId: selectedComplaint.complaintId,
                        status: updateData.status,
                        note: updateData.note
                    })
                });
            } catch (err) {
                console.error("Notification trigger failed:", err);
            }

            toast.success("Complaint updated successfully!");
            setSelectedComplaint(null);
            setUpdateData({ status: '', note: '', assignedTo: '' });
        } catch (error) {
            toast.error("Failed to update status");
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

    // Stats
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    // Pie chart data
    const categoryCounts = CATEGORIES.map(cat => ({
        name: cat.label.split(' ')[1], // Simplified name
        value: complaints.filter(c => c.category === cat.id).length
    })).filter(item => item.value > 0);

    // Filtered list
    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const exportCSV = () => {
        const headers = ['Complaint ID', 'Student', 'Room', 'Category', 'Priority', 'Status', 'Date'];
        const rows = filteredComplaints.map(c => [
            c.complaintId, c.studentName, c.roomNumber, c.category, c.priority, c.status, new Date(c.createdAt?.toDate()).toLocaleDateString()
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `complaints_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Warden Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and resolve hostel complaints</p>
                </div>
                <Button onClick={exportCSV} variant="outline" className="gap-2 border-primary-300 text-primary-700 bg-white hover:bg-primary-50">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary-50 border-primary-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary-600">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary-900">{total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-900">{pending}</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">{inProgress}</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900">{resolved}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="border-b bg-gray-50/50">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center w-full">
                                <CardTitle>Recent Complaints</CardTitle>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-48">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search ID, Name..."
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select className="w-[130px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-white border-b">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Room</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Category</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredComplaints.map(complaint => (
                                            <tr key={complaint.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-primary-700">{complaint.complaintId}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{complaint.studentName}</div>
                                                    <div className="text-[10px] text-slate-500 sm:hidden">R: {complaint.roomNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">{complaint.roomNumber}</td>
                                                <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                                                    {CATEGORIES.find(c => c.id === complaint.category)?.label.split(' ')[1] || complaint.category}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-primary-50 text-primary-700 hover:bg-primary-100"
                                                        onClick={() => {
                                                            setSelectedComplaint(complaint);
                                                            setUpdateData({
                                                                status: complaint.status,
                                                                note: '',
                                                                assignedTo: complaint.assignedTo || ''
                                                            });
                                                        }}
                                                    >
                                                        Review
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredComplaints.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8 text-gray-500">No complaints found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t bg-gray-50 text-center text-sm font-medium text-gray-400 italic">
                                Showing all matching reports
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Issues by Category</CardTitle>
                            <CardDescription>Distribution of active reports</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {categoryCounts.length > 0 ? (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryCounts}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-gray-400">
                                    No data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Update Status Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg bg-white shadow-2xl">
                        <CardHeader>
                            <CardTitle>Update Complaint: {selectedComplaint.complaintId}</CardTitle>
                            <CardDescription>
                                {selectedComplaint.studentName} ({selectedComplaint.roomNumber}) • {CATEGORIES.find(c => c.id === selectedComplaint.category)?.label}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded-md mb-6 whitespace-pre-wrap text-sm border">
                                <span className="font-semibold block mb-1">Student Description:</span>
                                {selectedComplaint.subDescription}
                            </div>

                            <form onSubmit={handleUpdateStatus} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <Select
                                            value={updateData.status}
                                            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Rejected">Rejected</option>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Assign To Staff</label>
                                        <Input
                                            placeholder="e.g. Ramesh (Plumber)"
                                            value={updateData.assignedTo}
                                            onChange={(e) => setUpdateData({ ...updateData, assignedTo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Admin Remarks / Notes</label>
                                    <textarea
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                                        placeholder="Provide an update for the student..."
                                        value={updateData.note}
                                        onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setSelectedComplaint(null)} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-primary-700 hover:bg-primary-800">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    );
}
