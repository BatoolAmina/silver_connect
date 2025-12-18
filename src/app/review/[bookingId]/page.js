'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const MAX_STARS = 5;

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://backend-minor-project.onrender.com';

const StarInput = ({ rating, setRating }) => {
    const stars = [];
    for (let i = 0; i < MAX_STARS; i++) {
        const starValue = i + 1;
        stars.push(
            <span
                key={i}
                className={`cursor-pointer transition-all duration-300 text-5xl ${
                    starValue <= rating ? 'text-slate-900 scale-110' : 'text-gray-200 hover:text-slate-400'
                }`}
                onClick={() => setRating(starValue)}
            >
                ★
            </span>
        );
    }
    return (
        <div className="flex justify-center space-x-3">
            {stars}
        </div>
    );
};

export default function ReviewPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.bookingId;

    const [user, setUser] = useState(null);
    const [booking, setBooking] = useState(null);
    const [helperProfile, setHelperProfile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        
        if (!parsedUser) {
            router.push('/login');
            return;
        }
        setUser(parsedUser);

        const fetchData = async () => {
            if (!bookingId) {
                router.push('/dashboard');
                return;
            }

            try {
                // 1. Fetch Booking Record to identify the Helper
                const bookingsRes = await fetch(`${API_BASE_URL}/api/bookings`);
                const allBookings = await bookingsRes.json();
                const currentBooking = allBookings.find(b => b.id.toString() === bookingId.toString());

                if (!currentBooking) throw new Error("Registry record not found.");
                
                if (currentBooking.status !== 'Confirmed') {
                    setError(`AUTHORIZATION FAIL: Booking status is '${currentBooking.status}'.`);
                    setTimeout(() => router.push('/dashboard'), 3000); 
                    return;
                }
                
                if (currentBooking.userEmail !== parsedUser.email) {
                    setError("SECURITY ALERT: Unauthorized access.");
                    setTimeout(() => router.push('/dashboard'), 3000);
                    return;
                }

                setBooking(currentBooking);

                // 2. LIVE SYNC: Fetch the current Helper Profile from the database
                // This ensures if they changed their name/image/role, we show the LATEST details
                const helperRes = await fetch(`${API_BASE_URL}/api/helper-profile/${currentBooking.helperEmail}`);
                if (helperRes.ok) {
                    const latestHelperData = await helperRes.json();
                    setHelperProfile(latestHelperData);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingId, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !booking) return;
        if (rating === 0) {
            setMessage({ type: 'error', text: "VALIDATION ERROR: MINIMUM 1 STAR REQUIRED." });
            return;
        }

        setIsSubmitting(true);

        const reviewPayload = {
            // Priority given to the current helper ID in the database
            helperId: helperProfile?._id || booking.helperId, 
            reviewerName: user.fullName || user.name,
            rating: rating,
            reviewText: reviewText,
            bookingId: parseInt(bookingId), 
        };
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewPayload)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: "✓ FEEDBACK ARCHIVED. UPDATING REGISTRY..." });
                setTimeout(() => router.push('/dashboard'), 2000); 
            } else {
                const errorData = await res.json();
                setMessage({ type: 'error', text: `SYNC FAIL: ${errorData.message}` });
                setIsSubmitting(false);
            }
        } catch (err) {
            setMessage({ type: 'error', text: "TRANSMISSION ERROR." });
            setIsSubmitting(false);
        }
    };

    if (loading || !user) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-black tracking-widest text-[10px] uppercase italic">Accessing Log entry...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-red-600 font-black uppercase text-xs tracking-[0.3em] mb-4">Registry Access Denied</h1>
            <p className="text-slate-900 font-bold max-w-xs leading-relaxed uppercase text-[10px]">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-20 px-6">
            <div className="max-w-xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4 block">Performance Assessment</span>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Service Review.</h1>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                </div>

                <div className="p-10 md:p-12 space-y-10">
                    {/* LIVE SYNCED PROFILE SECTION */}
                    <div className="flex gap-6 items-center border-b border-gray-50 pb-8">
                        <div className="relative">
                            {/* Uses helperProfile.image if updated, otherwise falls back to booking record */}
                            <img 
                                src={helperProfile?.image || booking?.helperImage || "https://i.pravatar.cc/150"} 
                                alt="" 
                                className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" 
                            />
                            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-xl flex items-center justify-center text-[12px] shadow-xl border-2 border-white font-black italic">!</div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 italic">Specialist Subject</p>
                            {/* Uses latest Name and Role from the Helper Database */}
                            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                                {helperProfile?.name || booking?.helperName}
                            </h3>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">
                                    {helperProfile?.role || 'Verified Provider'}
                                </span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">
                                    Archive Ref: {booking?.date}
                                </span>
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-5 rounded-2xl border font-black text-[10px] tracking-[0.1em] uppercase ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        <div className="text-center">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 italic">Quantifiable Metric</label>
                            <StarInput rating={rating} setRating={setRating} />
                            <p className="text-[10px] font-black text-slate-900 uppercase mt-8 tracking-widest bg-gray-50 inline-block px-6 py-2 rounded-full italic shadow-inner">
                                {rating > 0 ? `${rating} / ${MAX_STARS} Assessment Score` : 'Selection Magnitude Required'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1 italic">Qualitative Statement</label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows="5"
                                placeholder="Detail professionalism, execution, and support quality..."
                                className="w-full bg-gray-50 border-none rounded-[2.5rem] p-8 font-medium text-slate-700 italic focus:ring-1 focus:ring-slate-900 outline-none transition-all leading-relaxed shadow-inner"
                                required
                            ></textarea>
                        </div>
                        
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || rating === 0} 
                                className={`w-full text-white font-black py-7 rounded-[2rem] shadow-2xl uppercase tracking-[0.5em] text-[10px] transition-all active:scale-[0.98] ${
                                    (isSubmitting || rating === 0) ? 'bg-gray-200 cursor-not-allowed shadow-none text-gray-400' : 'bg-slate-900 hover:bg-black shadow-slate-200'
                                }`}
                            >
                                {isSubmitting ? 'Synchronizing Archives...' : 'Commit Feedback'}
                            </button>
                            
                            <Link href="/dashboard" className="block text-center text-[9px] font-black text-gray-300 hover:text-slate-900 uppercase tracking-[0.2em] mt-8 transition-all">
                                Abort Assessment
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}