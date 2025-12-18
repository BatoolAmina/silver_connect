'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://backend-minor-project.onrender.com';

const MAX_STARS = 5;
const StarRatingInput = ({ rating, setRating, max = MAX_STARS }) => {
    const stars = [];
    for (let i = 0; i < max; i++) {
        const starValue = i + 1;
        stars.push(
            <span
                key={i}
                className={`cursor-pointer transition-all text-2xl ${
                    starValue <= rating ? 'text-slate-900 scale-110' : 'text-gray-200 hover:text-slate-400'
                }`}
                onClick={() => setRating(starValue)}
            >
                ★
            </span>
        );
    }
    return <div className="flex space-x-1 justify-start">{stars}</div>;
};

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showHelperPendingMessage, setShowHelperPendingMessage] = useState(false);
    
    const [isEditingReview, setIsEditingReview] = useState(null); 
    const [editReviewForm, setEditReviewForm] = useState({ rating: 0, reviewText: '' });

    // --- CORE DATA FETCHING LOGIC WITH LIVE SYNC ---
    const fetchAllData = async (parsedUser) => {
        try {
            // Parallel fetch of Bookings, Reviews, and the latest Helper Registry
            const [resBookings, resReviews, resHelpers] = await Promise.all([
                fetch(`${API_BASE_URL}/api/bookings`),
                fetch(`${API_BASE_URL}/api/reviews`),
                fetch(`${API_BASE_URL}/api/helpers`) 
            ]);

            if (!resBookings.ok || !resReviews.ok || !resHelpers.ok) throw new Error("Sync failed.");
            
            const allBookings = await resBookings.json();
            const allReviews = await resReviews.json();
            const latestHelpers = await resHelpers.json();
            
            // 1. SYNC BOOKINGS: Cross-reference with live Helper Registry
            const syncedUserBookings = allBookings
                .filter(booking => booking.userEmail === parsedUser.email)
                .map(booking => {
                    const currentHelper = latestHelpers.find(h => h.email === booking.helperEmail);
                    return {
                        ...booking,
                        // Use live data if helper exists in registry, else fallback to booking record
                        helperName: currentHelper?.name || booking.helperName,
                        helperImage: currentHelper?.image || `https://i.pravatar.cc/150?u=${booking.helperEmail}`
                    };
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setBookings(syncedUserBookings);

            // 2. SYNC REVIEWS: Cross-reference reviewer names and helper details
            const reviewerName = parsedUser.fullName || parsedUser.name;
            const syncedUserReviews = allReviews
                .filter(review => review.reviewerName === reviewerName)
                .map(review => {
                    const currentHelper = latestHelpers.find(h => 
                        h._id === review.helperId || h.id?.toString() === review.helperId?.toString()
                    );
                    return {
                        ...review,
                        helperName: currentHelper?.name || "Specialist",
                        helperImage: currentHelper?.image || `https://i.pravatar.cc/150?u=${review.helperId}`
                    };
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setMyReviews(syncedUserReviews);
        } catch (error) {
            console.error("Dashboard Sync Error:", error);
            setMessage({ type: 'error', text: 'DATABASE SYNCHRONIZATION FAILURE.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { 
            router.push('/login'); 
            return; 
        }

        const parsedUser = JSON.parse(storedUser);
        
        if (parsedUser.role === 'admin') {
            router.push('/admin');
            return;
        }
        
        if (parsedUser.role === 'helper') {
            const checkHelperStatus = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/helper-profile/${parsedUser.email}`);
                    const profile = await res.json();
                    if (profile.status === 'Approved') {
                        router.push('/helper-dashboard');
                    } else {
                        if (profile.status === 'Pending') setShowHelperPendingMessage(true);
                        setUser(parsedUser);
                        fetchAllData(parsedUser);
                    }
                } catch (err) {
                    setUser(parsedUser);
                    fetchAllData(parsedUser);
                }
            };
            checkHelperStatus();
            return;
        }
        
        setUser(parsedUser);
        fetchAllData(parsedUser);
    }, [router]);

    const handleCancelBooking = async (bookingId) => {
        if(window.confirm(`VOID APPOINTMENT SESSION?`)) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, { method: 'PUT' });
                if (res.ok) {
                    setMessage({ type: 'success', text: "✓ SESSION VOIDED." });
                    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
                }
            } catch (err) {
                setMessage({ type: 'error', text: "VOID TRANSMISSION FAILED." });
            }
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/${isEditingReview._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editReviewForm)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: "✓ FEEDBACK SYNCHRONIZED." });
                setIsEditingReview(null); 
                fetchAllData(user); 
            }
        } catch (err) {
            setMessage({ type: 'error', text: "ARCHIVE UPDATE FAILED." });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm("PURGE THIS LOG PERMANENTLY?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: "✓ ARCHIVE PURGED." });
                fetchAllData(user); 
            }
        } catch (error) {
            setMessage({ type: 'error', text: "PURGE FAILED." });
        }
    };

    if (loading || !user) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-black tracking-widest text-[9px] uppercase italic">Accessing Terminal...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-200 font-sans text-slate-900 pb-20">
            <header className="bg-slate-900 text-white pt-24 pb-36 px-6 relative overflow-hidden">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-8">
                        <img 
                            src={user.image || `https://i.pravatar.cc/150?u=${user.email}`} 
                            alt="" 
                            className="w-28 h-28 rounded-[2.5rem] border-4 border-white/10 object-cover shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" 
                        />
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2 block italic">Authenticated User</span>
                            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{user?.fullName || user?.name}</h1>
                            <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">{user?.email}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            </header>

            <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
                {message.text && (
                    <div className={`p-5 mb-8 rounded-2xl border font-black text-[9px] tracking-[0.1em] uppercase shadow-lg ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 mb-12 w-fit">
                    {['bookings', 'reviews'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`px-12 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all ${
                                activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-gray-300 hover:text-slate-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'bookings' && (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.length === 0 ? (
                            <div className="bg-white p-24 rounded-[4rem] text-center border border-dashed border-gray-200">
                                <p className="text-gray-300 font-black uppercase tracking-widest text-[9px]">No operational history found.</p>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div key={booking.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 transition-all hover:shadow-2xl group">
                                    <div className="flex items-center gap-10 w-full">
                                        <div className="relative">
                                            <img src={booking.helperImage} alt="" className="w-20 h-20 rounded-[2rem] object-cover shadow-inner grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs border-2 border-white shadow-lg">
                                                {booking.status === 'Confirmed' ? '✓' : '○'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-300 block mb-1 italic uppercase">Registry Identity</span>
                                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{booking.helperName}</h3>
                                            <div className="flex gap-4 mt-2">
                                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{booking.date}</span>
                                                <span className="text-gray-300 text-[10px] font-black italic">@ {booking.startTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                                        <span className={`px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 
                                            (booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-white text-gray-300 border-gray-100')
                                        }`}>
                                            {booking.status}
                                        </span>
                                        
                                        {['Pending', 'Confirmed'].includes(booking.status) && (
                                            <button onClick={() => handleCancelBooking(booking.id)} className="text-gray-200 hover:text-red-600 transition-colors p-3 bg-gray-50 rounded-xl">✕</button>
                                        )}
                                        
                                        {booking.status === 'Confirmed' && !booking.isReviewed && (
                                            <Link href={`/review/${booking.id}`}>
                                                <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">Verify Service</button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {myReviews.length === 0 ? (
                            <div className="col-span-full bg-white p-24 rounded-[4rem] text-center border border-dashed border-gray-200">
                                <p className="text-gray-300 font-black uppercase tracking-widest text-[9px]">Archived feedback is empty.</p>
                            </div>
                        ) : (
                            myReviews.map(review => (
                                <div key={review._id} className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100 relative group flex flex-col hover:shadow-2xl transition-all duration-500">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-8 mb-8">
                                        <div className="flex items-center gap-4">
                                            <img src={review.helperImage} className="w-10 h-10 rounded-xl grayscale" alt="" />
                                            <div>
                                                <p className="font-black text-[8px] uppercase tracking-[0.3em] text-gray-300 italic uppercase leading-none mb-1">Audit: {review.helperName}</p>
                                                <p className="font-bold text-[10px] text-slate-400">Ref ID: {review.bookingId}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">{new Date(review.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex mb-8 grayscale group-hover:grayscale-0 transition-all duration-700">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i} className={`text-2xl ${i < review.rating ? 'text-slate-900' : 'text-gray-100'}`}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-slate-600 italic text-lg leading-relaxed font-medium mb-12 flex-grow">&quot;{review.reviewText}&quot;</p>
                                    <div className="flex justify-end gap-6 pt-6 border-t border-gray-50">
                                        <button onClick={() => { setIsEditingReview(review); setEditReviewForm({ rating: review.rating, reviewText: review.reviewText }); }} className="text-slate-900 font-black text-[9px] uppercase tracking-widest border-b-2 border-slate-900 transition-all">Modify</button>
                                        <button onClick={() => handleDeleteReview(review._id)} className="text-red-400 font-black text-[9px] uppercase tracking-widest border-b-2 border-red-400 transition-all">Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            {isEditingReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-slate-900 px-12 py-10 flex justify-between items-center text-white">
                            <div>
                                <h3 className="font-black uppercase italic tracking-tighter text-2xl">Modify Audit</h3>
                                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 mt-2">Dossier Update Protocol</p>
                            </div>
                            <button onClick={() => setIsEditingReview(null)} className="text-3xl font-light opacity-50 hover:opacity-100 transition-opacity">×</button>
                        </div>
                        <form onSubmit={handleUpdateReview} className="p-12 space-y-12">
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-6 italic">Performance Metric</label>
                                <StarRatingInput rating={editReviewForm.rating} setRating={(val) => setEditReviewForm({...editReviewForm, rating: val})} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Qualitative Statement</label>
                                <textarea 
                                    value={editReviewForm.reviewText} 
                                    onChange={(e) => setEditReviewForm({...editReviewForm, reviewText: e.target.value})} 
                                    rows="5" 
                                    className="w-full bg-gray-50 border-none rounded-[2rem] p-8 focus:ring-1 focus:ring-slate-900 outline-none transition-all font-medium italic text-slate-700 shadow-inner" 
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black transition-all">Synchronize Registry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}