'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
    const router = useRouter();
    
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';

    const [isAddingHelper, setIsAddingHelper] = useState(false);
    const [newHelperForm, setNewHelperForm] = useState({
        name: '', email: '', role: '', price: '', location: '', experience: '', bio: '', description: ''
    });
    
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [helpers, setHelpers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [adminEmail, setAdminEmail] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const [editingHelper, setEditingHelper] = useState(null);
    const [editForm, setEditForm] = useState({});
    
    const [editingReview, setEditingReview] = useState(null);
    const [editReviewForm, setEditReviewForm] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);

        if (user.role !== 'admin') {
            alert("⛔ Access Denied: You are not an Admin.");
            router.push('/');
            return;
        }
        setIsAuthorized(true);
        setAdminEmail(user.email);
        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            const [resUsers, resBookings, resMessages, resHelpers, resReviews] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users`),
                fetch(`${API_BASE_URL}/api/bookings`),
                fetch(`${API_BASE_URL}/api/contact`),
                fetch(`${API_BASE_URL}/api/admin/helpers`),
                fetch(`${API_BASE_URL}/api/reviews`)
            ]);

            if (resUsers.ok) setUsers(await resUsers.json());
            if (resBookings.ok) setBookings(await resBookings.json());
            if (resMessages.ok) setMessages(await resMessages.json());
            if (resHelpers.ok) setHelpers(await resHelpers.json());
            if (resReviews.ok) setReviews(await resReviews.json());
            
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };
    
    const handleRoleChange = async (userEmail, newRole) => {
        if (!confirm(`Are you sure you want to change ${userEmail}'s role to ${newRole}? This action can affect Helper profiles.`)) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userEmail}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRole })
            });

            if (res.ok) {
                alert(`Role for ${userEmail} successfully changed to ${newRole}.`);
                
                const loggedInUser = JSON.parse(localStorage.getItem('user'));
                if (loggedInUser && loggedInUser.email === userEmail) {
                    const updatedLoggedInUser = { ...loggedInUser, role: newRole };
                    localStorage.setItem('user', JSON.stringify(updatedLoggedInUser));
                    
                    if (newRole !== 'admin') {
                        router.push('/dashboard');
                        return;
                    }
                }
                
                fetchData();
            } else {
                const error = await res.json();
                alert(`Failed to update role: ${error.message || res.statusText}`);
            }
        } catch (error) {
            console.error(error);
            alert("Server error updating role.");
        }
    };

    const handleApproveBooking = async (id) => {
        if (!confirm("Are you sure you want to manually confirm this booking?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/approve`, { 
                method: 'PUT' 
            });
            
            if (res.ok) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
                alert("Booking Confirmed!");
            } else {
                alert("Failed to confirm booking");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!confirm("Delete this booking permanently?")) return;
        await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: 'DELETE' });
        setBookings(bookings.filter(b => b.id !== id));
    };
    
    const handleDeleteUser = async (email) => {
        if (!confirm("Permanently delete this user and any associated data?")) return;
        
        const res = await fetch(`${API_BASE_URL}/api/users/${email}`, { method: 'DELETE' });
        
        if (res.ok) {
            alert(`User ${email} deleted successfully.`);
            setUsers(users.filter(u => u.email !== email));
            fetchData();
        } else {
            alert("Failed to delete user.");
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!confirm("Delete this message?")) return;
        await fetch(`${API_BASE_URL}/api/contact/${id}`, { method: 'DELETE' });
        setMessages(messages.filter(m => m._id !== id));
    };

    const handleApproveHelper = async (id) => {
        if (!confirm("Approve this helper and automatically set their user role to 'helper'?")) return;
        await fetch(`${API_BASE_URL}/api/helpers/${id}/approve`, { method: 'PUT' });
        alert("Helper Approved! User role updated.");
        fetchData(); 
    };

    const handleDeleteHelper = async (id) => {
        if(!confirm("Permanently delete this helper profile? This reverts the user's role to 'user'.")) return;
        
        const res = await fetch(`${API_BASE_URL}/api/helpers/${id}`, { method: 'DELETE' });
        
        if (res.ok) {
            alert("Helper profile deleted and user role reverted.");
            fetchData();
        } else {
            alert("Failed to delete helper.");
        }
    };

    const openEditModal = (helper) => {
        setEditingHelper(helper);
        setEditForm({ ...helper });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleUpdateHelper = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/helpers/${editingHelper.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            
            if (res.ok) {
                const updated = await res.json();
                setHelpers(prev => prev.map(h => h.id === updated.id ? updated : h));
                setEditingHelper(null); 
                alert("✅ Helper profile updated successfully!");
                fetchData();
            } else {
                alert("Failed to update helper.");
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleAddHelperChange = (e) => {
        setNewHelperForm({ ...newHelperForm, [e.target.name]: e.target.value });
    };

    const handleAddHelperSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCheckRes = await fetch(`${API_BASE_URL}/api/users`);
            const usersList = await userCheckRes.json();
            const existingUser = usersList.find(u => u.email === newHelperForm.email);

            if (!existingUser) {
                alert("Error: User must register an account first. Please register them or ask them to sign up.");
                return;
            }

            const payload = {
                ...newHelperForm,
                role: newHelperForm.role || 'Companion',
                description: newHelperForm.description || `Experienced ${newHelperForm.role} ready to assist.`,
                image: existingUser.image || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png',
            };

            const res = await fetch(`${API_BASE_URL}/api/helpers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("✅ New Helper profile created successfully! Status: Pending. Now approve it in the Helpers tab.");
                setIsAddingHelper(false);
                fetchData();
            } else {
                const error = await res.json();
                alert(`Failed to add helper: ${error.message || res.statusText}`);
            }
        } catch (err) {
            console.error(err);
            alert("Server error adding helper.");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm("Permanently delete this review?")) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, { 
                method: 'DELETE' 
            });

            if (res.ok) {
                alert("Review deleted successfully.");
                fetchData();
            } else {
                alert("Failed to delete review.");
            }
        } catch (error) {
            console.error(error);
            alert("Server error deleting review.");
        }
    };

    const openEditReviewModal = (review) => {
        setEditingReview(review);
        setEditReviewForm({ 
            rating: review.rating, 
            reviewText: review.reviewText 
        });
    };

    const handleEditReviewChange = (e) => {
        setEditReviewForm({ ...editReviewForm, [e.target.name]: e.target.value });
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/${editingReview._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editReviewForm)
            });
            
            if (res.ok) {
                alert("✅ Review updated successfully!");
                setEditingReview(null); 
                fetchData();
            } else {
                alert("Failed to update review.");
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    if (!isAuthorized) return null;
    if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500 font-bold">Loading Admin Portal...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row relative">
            
            <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 md:h-screen sticky top-0 overflow-y-auto">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-extrabold tracking-tight">Admin<span className="text-gray-400">Portal</span></h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Management Console</p>
                </div>
                
                <nav className="p-4 space-y-2">
                    <button onClick={() => setActiveTab('bookings')} className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${activeTab === 'bookings' ? 'bg-gray-800 text-white shadow-md border border-gray-700' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                        <span className="font-bold">📅 Bookings</span>
                        <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">{bookings.length}</span>
                    </button>

                    <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${activeTab === 'users' ? 'bg-gray-800 text-white shadow-md border border-gray-700' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                        <span className="font-bold">👥 Users</span>
                        <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">{users.length}</span>
                    </button>

                    <button onClick={() => setActiveTab('helpers')} className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${activeTab === 'helpers' ? 'bg-gray-800 text-white shadow-md border border-gray-700' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                        <span className="font-bold">🩺 Helpers</span>
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{helpers.length}</span>
                    </button>
                    
                    <button onClick={() => setActiveTab('reviews')} className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${activeTab === 'reviews' ? 'bg-gray-800 text-white shadow-md border border-gray-700' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                        <span className="font-bold">⭐ Reviews</span>
                        <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">{reviews.length}</span>
                    </button>

                    <button onClick={() => setActiveTab('messages')} className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${activeTab === 'messages' ? 'bg-gray-800 text-white shadow-md border border-gray-700' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                        <span className="font-bold">📩 Contact Form</span>
                        <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">{messages.length}</span>
                    </button>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 capitalize">{activeTab === 'messages' ? 'Contact Form' : activeTab}</h2>
                        <p className="text-gray-500 mt-1">Manage all your platform {activeTab === 'messages' ? 'contact forms' : activeTab} here.</p>
                    </div>
                    <div className="text-right">
                            <Link href="/" className="text-sm font-bold text-gray-900 hover:underline">← Go to Main Site</Link>
                    </div>
                </header>

                {activeTab === 'bookings' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Date/Time</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Client Details</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Helper</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50 transition">
                                            <td className="p-5">
                                                <p className="font-bold text-gray-900">{b.date}</p>
                                                <p className="text-xs text-gray-500">{b.startTime} - {b.endTime}</p>
                                            </td>
                                            <td className="p-5">
                                                <p className="text-gray-900 font-bold">{b.userName || "Guest"}</p>
                                                <p className="text-sm text-gray-600">{b.userEmail || "No Email"}</p>
                                                <div className="text-xs text-gray-500 mt-1 flex gap-1">
                                                    <span>📍</span> {b.address || "No Address"}
                                                </div>
                                                <div className="text-xs text-gray-500 flex gap-1">
                                                    <span>📞</span> {b.phone || "No Phone"}
                                                </div>
                                            </td>
                                            <td className="p-5 text-gray-900 font-bold">{b.helperName}</td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                {b.status === 'Pending' && (
                                                    <button 
                                                        onClick={() => handleApproveBooking(b.id)}
                                                        className="text-green-600 hover:text-green-800 font-bold text-sm bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition mr-2"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteBooking(b.id)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                                                    title="Delete Booking"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">No bookings found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">User</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Role</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Contact</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <tr key={u._id || u.email} className="hover:bg-gray-50 transition">
                                            <td className="p-5 flex items-center gap-4">
                                                <img src={u.image || '/userplaceholder.png'} className="w-10 h-10 rounded-full border border-gray-200 object-cover"/>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.fullName || u.name}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleRoleChange(u.email, e.target.value)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border border-gray-300 bg-white shadow-sm appearance-none cursor-pointer ${u.role === 'admin' ? 'text-purple-700' : u.role === 'helper' ? 'text-blue-700' : 'text-gray-700'}`}
                                                    disabled={u.email === adminEmail}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="helper">Helper</option>
                                                    <option value="admin" disabled={u.email !== adminEmail}>Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-5 text-sm text-gray-500">
                                                {u.phone || "No phone"} <br/> {u.address || ""}
                                            </td>
                                            <td className="p-5 text-right">
                                                {u.email !== adminEmail && (
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.email)}
                                                        className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                                                        title="Delete User"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'helpers' && (
                    <>
                        <div className="mb-6 flex justify-end">
                            <button 
                                onClick={() => setIsAddingHelper(true)}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
                                title="Add New Helper Profile"
                            >
                                + Manually Add Helper
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {helpers.length === 0 && <p className="text-gray-500 col-span-2 text-center">No helpers found.</p>}
                            {helpers.map((helper) => (
                                <div key={helper.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4 relative transition hover:shadow-md">
                                    
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${helper.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {helper.status}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <img src={helper.image || '/userplaceholder.png'} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{helper.name}</h3>
                                            <p className="text-gray-500 text-sm">{helper.role} • {helper.location}</p>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                {helper.rating > 0 && Array.from({ length: 5 }, (_, i) => (
                                                    <span key={i} className={`text-sm ${i < Math.floor(helper.rating) ? 'text-gray-900' : 'text-gray-400'}`}>★</span>
                                                ))}
                                                {helper.reviews > 0 && <span className="ml-1 text-xs">({helper.reviews})</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p><strong>Experience:</strong> {helper.experience}</p>
                                        <p><strong>Price:</strong> {helper.price}</p>
                                        <p className="mt-2 italic">&quot;{helper.bio}&quot;</p>
                                    </div>
                                    
                                    {helper.status === 'Pending' ? (
                                        <div className="flex gap-3 mt-auto pt-2">
                                            <button onClick={() => handleApproveHelper(helper.id)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-sm">Approve</button>
                                            <button onClick={() => handleDeleteHelper(helper.id)} className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl font-bold hover:bg-red-50 transition shadow-sm">Reject</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 mt-auto pt-2">
                                            <button onClick={() => openEditModal(helper)} className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-100">Edit Details</button>
                                            <button onClick={() => handleDeleteHelper(helper.id)} className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl font-bold hover:bg-red-50 transition">Delete Profile</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Helper / Reviewer</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Rating</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider">Review Text</th>
                                        <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reviews.map((r) => (
                                        <tr key={r._id} className="hover:bg-gray-50 transition">
                                            <td className="p-5 text-sm">
                                                <p className="font-bold text-gray-900">{r.reviewerName}</p>
                                                <p className="text-xs text-gray-500 mt-1">Helper ID: {r.helperId.substring(0, 8)}...</p>
                                                <p className="text-xs text-gray-500">Booking ID: {r.bookingId}</p>
                                            </td>
                                            <td className="p-5">
                                                <span className="font-extrabold text-lg text-amber-500">
                                                    {r.rating} <span className="text-gray-400">/ 5</span>
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm text-gray-700 max-w-sm">
                                                {r.reviewText}
                                                <p className="text-xs text-gray-400 mt-1">{new Date(r.timestamp).toLocaleDateString()}</p>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button 
                                                    onClick={() => openEditReviewModal(r)}
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteReview(r._id)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reviews.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400">No reviews found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {activeTab === 'messages' && (
                    <div className="grid grid-cols-1 gap-4">
                        {messages.length === 0 && <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">No messages yet.</div>}
                        {messages.map((msg) => (
                            <div key={msg._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition relative group">
                                <button 
                                    onClick={() => handleDeleteMessage(msg._id)}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 font-bold transition p-2"
                                    title="Delete Message"
                                >
                                    ✕
                                </button>
                                <div className="flex justify-between items-start mb-2 pr-8">
                                    <h3 className="font-bold text-lg text-gray-900">{msg.subject || "No Subject"}</h3>
                                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded">{new Date(msg.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 font-medium">{msg.name} <span className="font-normal text-gray-400">&lt;{msg.email}&gt;</span></p>
                                <div className="bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed text-sm border border-gray-100">
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>
            
            {isAddingHelper && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Manually Add Helper Profile</h3>
                            <button onClick={() => setIsAddingHelper(false)} className="text-white hover:text-gray-300 font-bold text-xl">×</button>
                        </div>
                        
                        <form onSubmit={handleAddHelperSubmit} className="p-6 space-y-4">
                            <p className="text-sm text-red-500 font-medium">NOTE: The user must register an account first. If the Helper profile already exists, this will create a new pending entry.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">User Email (Required)</label>
                                    <input name="email" value={newHelperForm.email} onChange={handleAddHelperChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required type="email" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                    <input name="name" value={newHelperForm.name} onChange={handleAddHelperChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                                    <input name="role" value={newHelperForm.role} onChange={handleAddHelperChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" placeholder="e.g. Companion" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                                    <input name="price" value={newHelperForm.price} onChange={handleAddHelperChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" placeholder="$25/hr" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Short)</label>
                                <input name="description" value={newHelperForm.description} onChange={handleAddHelperChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" placeholder="e.g. Certified nurse with 5 years experience." />
                            </div>
                            
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition shadow-lg">Create Helper Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Helper Edit Modal */}
            {editingHelper && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Edit Helper: {editingHelper.name}</h3>
                            <button onClick={() => setEditingHelper(null)} className="text-white hover:text-gray-300 font-bold text-xl">×</button>
                        </div>
                        
                        <form onSubmit={handleUpdateHelper} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                    <input name="name" value={editForm.name || ''} onChange={handleEditChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                                    <input name="role" value={editForm.role || ''} onChange={handleEditChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                                    <input name="price" value={editForm.price || ''} onChange={handleEditChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Experience</label>
                                    <input name="experience" value={editForm.experience || ''} onChange={handleEditChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                                <input name="location" value={editForm.location || ''} onChange={handleEditChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
                                <textarea name="bio" value={editForm.bio || ''} onChange={handleEditChange} rows="3" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={editForm.description || ''} onChange={handleEditChange} rows="5" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" required />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition shadow-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Review Edit Modal */}
            {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Edit Review by: {editingReview.reviewerName}</h3>
                            <button onClick={() => setEditingReview(null)} className="text-white hover:text-gray-300 font-bold text-xl">×</button>
                        </div>
                        
                        <form onSubmit={handleUpdateReview} className="p-6 space-y-4">
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Rating (1-5)</label>
                                <input 
                                    name="rating" 
                                    value={editReviewForm.rating || ''} 
                                    onChange={handleEditReviewChange} 
                                    type="number"
                                    min="1"
                                    max="5"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Review Text</label>
                                <textarea 
                                    name="reviewText" 
                                    value={editReviewForm.reviewText || ''} 
                                    onChange={handleEditReviewChange} 
                                    rows="5" 
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none" 
                                    required 
                                />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition shadow-lg">Save Review Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}