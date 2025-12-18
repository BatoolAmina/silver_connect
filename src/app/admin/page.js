'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const MAX_STARS = 5;
const StarRatingInput = ({ rating, setRating, max = MAX_STARS }) => {
    const stars = [];
    for (let i = 0; i < max; i++) {
        const starValue = i + 1;
        stars.push(
            <span
                key={i}
                className={`cursor-pointer transition-all text-2xl ${
                    starValue <= rating ? 'text-slate-900 scale-110' : 'text-gray-300 hover:text-slate-500'
                }`}
                onClick={() => setRating(starValue)}
            >
                ★
            </span>
        );
    }
    return <div className="flex space-x-1">{stars}</div>;
};

export default function AdminPage() {
    const router = useRouter();
    const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://backend-minor-project.onrender.com';

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
    
    const REFRESH_INTERVAL = 15000;

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
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { router.push('/login'); return; }
        const user = JSON.parse(storedUser);
        if (user.role !== 'admin') {
            alert("⛔ Access Denied.");
            router.push('/');
            return;
        }
        setIsAuthorized(true);
        setAdminEmail(user.email);
        fetchData();
        const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [router]);

    const handleAction = async (url, method, body, successMsg) => {
        try {
            const res = await fetch(`${API_BASE_URL}${url}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            });
            if (res.ok) { 
                if(successMsg) alert(successMsg); 
                fetchData(); 
                return true; 
            }
            return false;
        } catch (e) { return false; }
    };

    if (!isAuthorized) return null;
    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-bold tracking-widest text-xs uppercase">Connecting to Database...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-200 font-sans flex flex-col lg:flex-row">
            <aside className="w-full lg:w-72 bg-slate-950 text-white lg:h-screen lg:sticky lg:top-0 shadow-2xl flex flex-col z-40">
                <div className="p-8 border-b border-white/5">
                    <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                        Silver<span className="text-gray-400 font-light">Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto grayscale">
                    {[
                        { id: 'users', label: 'User Directory', icon: '👤', count: users.length },
                        { id: 'helpers', label: 'Care Providers', icon: '🛡️', count: helpers.length },
                        { id: 'bookings', label: 'Service Logs', icon: '📝', count: bookings.length },
                        { id: 'reviews', label: 'User Reviews', icon: '💬', count: reviews.length },
                        { id: 'messages', label: 'Inquiry Inbox', icon: '✉️', count: messages.length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 group ${
                                activeTab === tab.id 
                                ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                <span className="text-lg opacity-70 group-hover:opacity-100">{tab.icon}</span>
                                <span className="font-bold text-xs uppercase tracking-widest">{tab.label}</span>
                            </div>
                            <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full ${activeTab === tab.id ? 'bg-white text-slate-900' : 'bg-slate-800 text-gray-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <Link href="/" className="flex items-center space-x-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                        <span>← Return to Site</span>
                    </Link>
                </div>
            </aside>

            <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
                <header className="mb-3 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Control Center</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter capitalize mt-1">{activeTab}</h2>
                    </div>
                    {activeTab === 'helpers' && (
                        <button 
                            onClick={() => setIsAddingHelper(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95"
                        >
                            + Manual Helper Entry
                        </button>
                    )}
                </header>

                <div className="max-w-7xl mx-auto space-y-6">
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identified User</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Authorization</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((u) => (
                                            <tr key={u._id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center space-x-4">
                                                        <img src={u.image || 'https://i.pravatar.cc/150'} className="w-12 h-12 rounded-2xl grayscale group-hover:grayscale-0 transition-all border border-gray-100" alt="" />
                                                        <div>
                                                            <p className="text-slate-900 font-black text-base">{u.fullName || u.name}</p>
                                                            <p className="text-gray-400 text-xs font-medium">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <select 
                                                        value={u.role} 
                                                        onChange={(e) => handleAction(`/api/admin/users/${u.email}/role`, 'PUT', { newRole: e.target.value }, "Role Synced")}
                                                        disabled={u.email === adminEmail}
                                                        className="bg-gray-100 border-none text-slate-900 font-black text-[10px] rounded-lg px-4 py-2 uppercase tracking-tighter cursor-pointer focus:ring-2 focus:ring-slate-900"
                                                    >
                                                        <option value="user">USER</option>
                                                        <option value="helper">HELPER</option>
                                                        <option value="admin">ADMIN</option>
                                                    </select>
                                                </td>
                                                <td className="p-6 text-right">
                                                    {u.email !== adminEmail && (
                                                        <button 
                                                            onClick={() => handleAction(`/api/users/${u.email}`, 'DELETE', null, "Account Deleted")}
                                                            className="text-gray-300 hover:text-red-600 font-black text-[10px] tracking-widest"
                                                        >
                                                            PURGE
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'helpers' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {helpers.map((helper) => (
                                <div key={helper._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-200 transition-all hover:shadow-xl group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-5">
                                            <img src={helper.image} className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-gray-100 shadow-sm" alt="" />
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{helper.name}</h3>
                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{helper.role}</p>
                                                <div className="mt-2 flex space-x-2">
                                                    <span className="bg-gray-100 text-gray-600 text-[9px] font-black px-2 py-1 rounded italic">{helper.price}</span>
                                                    <span className="bg-gray-100 text-gray-600 text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter">{helper.experience}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] ${helper.status === 'Approved' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {helper.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-gray-400 text-[9px] font-black uppercase mb-2 tracking-widest">Biography</p>
                                        <p className="text-slate-700 text-xs leading-relaxed line-clamp-3 italic">"{helper.bio || 'No profile biography available.'}"</p>
                                    </div>
                                    <div className="mt-8 flex gap-3">
                                        <button onClick={() => { setEditingHelper(helper); setEditForm({ ...helper }); }} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">Edit Fields</button>
                                        {helper.status === 'Pending' && <button onClick={() => handleAction(`/api/helpers/${helper.id}/approve`, 'PUT', null, "Approved")} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-lg active:scale-95">Approve</button>}
                                        <button onClick={() => handleAction(`/api/helpers/${helper.id}`, 'DELETE', null, "Removed")} className="px-6 bg-gray-100 text-gray-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-red-600 hover:bg-red-50 transition-all">Purge</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Feedback</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Content</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Moderation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reviews.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-gray-400 font-bold italic">No review records found in database.</td></tr>}
                                        {reviews.map((r) => (
                                            <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-6">
                                                    <p className="text-slate-900 font-black text-base">{r.reviewerName}</p>
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">B_ID: {r.bookingId}</p>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex text-slate-900 text-sm font-black space-x-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <span key={i} className={i < r.rating ? "text-slate-900" : "text-gray-200"}>★</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-slate-600 text-sm leading-relaxed max-w-xs truncate italic">"{r.reviewText}"</td>
                                                <td className="p-6 text-right space-x-3">
                                                    <button onClick={() => { setEditingReview(r); setEditReviewForm({ rating: r.rating, reviewText: r.reviewText }); }} className="text-slate-900 font-black text-[10px] uppercase tracking-widest hover:underline">Revise</button>
                                                    <button onClick={() => handleAction(`/api/reviews/${r._id}`, 'DELETE', null, "Review Voided")} className="text-red-400 font-black text-[10px] uppercase tracking-widest hover:text-red-600">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b">
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointment Date</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parties Involved</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {bookings.map((b) => (
                                            <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-6 font-black text-slate-900">{b.date}<p className="text-gray-400 text-[10px] mt-1">{b.startTime} - {b.endTime}</p></td>
                                                <td className="p-6 text-xs font-black uppercase text-slate-900">C: {b.userName}<br/><span className="text-gray-400">P: {b.helperName}</span></td>
                                                <td className="p-6 text-right">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${b.status === 'Confirmed' ? 'bg-slate-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {messages.length === 0 && <p className="col-span-full text-center p-12 text-gray-400 font-bold italic">No messages found in inbox.</p>}
                            {messages.map((msg) => (
                                <div key={msg._id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 relative group transition-all hover:-translate-y-1">
                                    <button onClick={() => handleAction(`/api/contact/${msg._id}`, 'DELETE', null, "Archived")} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors">✕</button>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{msg.email}</p>
                                    <h3 className="text-xl font-black text-slate-900 mb-4">{msg.subject || 'Incoming Inquiry'}</h3>
                                    <div className="bg-gray-50 p-6 rounded-2xl text-sm text-slate-700 italic border border-gray-100">"{msg.message}"</div>
                                    <p className="mt-4 text-[10px] font-black text-gray-400 uppercase text-right">- {msg.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {editingHelper && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingHelper(null)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-slate-900 px-10 py-8 flex justify-between items-center text-white">
                            <h3 className="text-2xl font-black uppercase italic">Edit Profile</h3>
                            <button onClick={() => setEditingHelper(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-red-500 transition-all font-black">✕</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleAction(`/api/helpers/${editingHelper.id}`, 'PUT', editForm, "Database Updated"); setEditingHelper(null); }} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                                <input value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 font-bold text-slate-800" required />
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
                                <input value={editForm.price || ''} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 font-bold text-slate-800" required />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                                <input value={editForm.role || ''} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 font-bold text-slate-800" required />
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience</label>
                                <input value={editForm.experience || ''} onChange={(e) => setEditForm({...editForm, experience: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-5 py-4 font-bold text-slate-800" required />
                            </div>
                            <div className="col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio</label>
                                <textarea value={editForm.bio || ''} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows="4" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-medium text-slate-700 italic" required />
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Description</label>
                                <textarea value={editForm.description || ''} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows="4" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-medium text-slate-700" required />
                            </div>
                            <button type="submit" className="col-span-2 bg-slate-900 text-white font-black py-6 rounded-2xl uppercase tracking-[0.4em] text-xs shadow-xl">Commit Updates</button>
                        </form>
                    </div>
                </div>
            )}

            {editingReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingReview(null)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Review Moderation</h3>
                            <button onClick={() => setEditingReview(null)}>✕</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleAction(`/api/reviews/${editingReview._id}`, 'PUT', editReviewForm, "Submission Moderated"); setEditingReview(null); }} className="p-8 space-y-6">
                            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Adjust Rating Score</label>
                                <StarRatingInput rating={editReviewForm.rating} setRating={(r) => setEditReviewForm({...editReviewForm, rating: r})} />
                            </div>
                            <textarea value={editReviewForm.reviewText} onChange={(e) => setEditReviewForm({...editReviewForm, reviewText: e.target.value})} rows="5" className="w-full border border-gray-100 rounded-2xl p-5 text-sm italic text-slate-600 focus:ring-2 focus:ring-slate-900" required />
                            <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {isAddingHelper && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddingHelper(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-slate-900 p-8 text-white">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Manual Entry</h3>
                        </div>
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleAction('/api/helpers', 'POST', newHelperForm, "Created"); setIsAddingHelper(false); }} 
                            className="p-8 space-y-5"
                        >
                            <input placeholder="Verification Email" onChange={(e) => setNewHelperForm({...newHelperForm, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-bold text-sm" required />
                            <input placeholder="Full Legal Name" onChange={(e) => setNewHelperForm({...newHelperForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-bold text-sm" required />
                            <input placeholder="Role Designation" onChange={(e) => setNewHelperForm({...newHelperForm, role: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 font-bold text-sm" required />
                            <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs">Authorize & Create</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}