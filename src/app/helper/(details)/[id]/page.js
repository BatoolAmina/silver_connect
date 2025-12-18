'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const StarRating = ({ rating }) => {
    const stars = [];
    const normalizedRating = rating || 0;
    for (let i = 1; i <= 5; i++) {
        let colorClass = normalizedRating >= i ? 'text-slate-900' : 'text-gray-200';
        stars.push(<span key={i} className={`text-lg ${colorClass}`}>★</span>);
    }
    return <div className="flex justify-start space-x-1">{stars}</div>;
};

const ReviewCard = ({ review }) => {
    const logDate = review.timestamp 
        ? new Date(review.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : "Pending Sync";

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Peer Auditor</span>
                    <h4 className="font-black text-slate-950 uppercase text-[10px] tracking-widest">{review.reviewerName || "Anonymous"}</h4>
                </div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter italic">{logDate}</span>
            </div>
            <div className="flex items-center mb-4 grayscale group-hover:grayscale-0 transition-all">
                <StarRating rating={review.rating} />
                <span className="text-[9px] font-black text-slate-950 ml-3 italic">({review.rating?.toFixed(1)}) Score</span>
            </div>
            <p className="text-slate-600 italic text-[13px] leading-relaxed font-medium border-l-2 border-slate-50 pl-4">
                "{review.reviewText || "No qualitative statement provided."}"
            </p>
        </div>
    );
};

export default function HelperDetails() {
    const { id } = useParams();
    const router = useRouter();
    const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://backend-minor-project.onrender.com';

    const [helper, setHelper] = useState(null);
    const [reviews, setReviews] = useState([]); 
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSelf, setIsSelf] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [todayDate, setTodayDate] = useState('');

    const [bookingData, setBookingData] = useState({
        date: '', startTime: '09:00', endTime: '11:00', address: '', phone: '', notes: ''
    });

    useEffect(() => {
        setTodayDate(new Date().toISOString().split('T')[0]);
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { router.push('/login'); return; }
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);

        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/helpers/${id}`);
                if (!res.ok) throw new Error("Registry profile not found.");
                const data = await res.json();
                
                setHelper({ ...data, role: data.role || 'Provider', image: data.image || `https://i.pravatar.cc/150?u=${data.email}` });
                if (currentUser.email === data.email) setIsSelf(true);
                setBookingData(prev => ({ ...prev, address: currentUser.address || '', phone: currentUser.phone || '' }));

                const reviewRes = await fetch(`${API_BASE_URL}/api/reviews`);
                if (reviewRes.ok) {
                    const allReviews = await reviewRes.json();
                    setReviews(allReviews.filter(r => r.helperId === data.id.toString() || r.helperId === data._id));
                }
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        if (id) fetchData();
    }, [id, router, API_BASE_URL]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bookingData, helperId: helper.id, helperName: helper.name, helperEmail: helper.email, userEmail: user.email, userName: user.fullName || user.name })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: "✓ DISPATCH AUTHORIZED." });
                setTimeout(() => router.push('/dashboard'), 1500);
            } else {
                setMessage({ type: 'error', text: "DISPATCH FAILED." });
                setIsSubmitting(false);
            }
        } catch (err) { setMessage({ type: 'error', text: "CONNECTION ERROR." }); setIsSubmitting(false); }
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase text-[10px] tracking-[0.5em] italic animate-pulse">Decrypting Dossier...</div>;

    return (
        <div className="min-h-screen bg-gray-200 font-sans text-slate-900 pb-12">
            <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pt-6">
                
                <Link href="/helper" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-950 transition-colors font-black text-[9px] uppercase tracking-widest mb-6 group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Index
                </Link>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    <aside className="w-full lg:w-[380px] lg:sticky lg:top-24">
                        <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <div className="relative inline-block mb-6">
                                    <img src={helper.image} alt="" className="w-28 h-28 rounded-3xl object-cover border-4 border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
                                    <div className="absolute -bottom-2 -right-2 bg-white text-slate-950 px-3 py-1 rounded-lg font-black text-[8px] uppercase">Verified</div>
                                </div>
                                <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">{helper.name}</h1>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] mb-6">{helper.role}</p>
                                
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 flex flex-col items-center">
                                    <StarRating rating={helper.rating} />
                                    <span className="text-[8px] font-black uppercase text-gray-500 mt-2">{reviews.length} Authored Logs</span>
                                </div>

                                <div className="space-y-3 text-[11px] font-black uppercase">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500">Rate</span><span className="text-green-400 italic">{helper.price}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500">Zone</span><span className="italic">{helper.location}</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-dashed border-white/10 italic text-[12px] text-slate-300 leading-relaxed">
                                    "{helper.bio || helper.description}"
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1 w-full space-y-8">
                        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm">
                            <header className="mb-8 border-b border-slate-50 pb-6 flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] block mb-1">Authorization Protocol</span>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Schedule <span className="text-slate-300 font-light">Service.</span></h2>
                                </div>
                            </header>

                            {message.text && (
                                <div className={`p-4 mb-6 rounded-xl border font-black text-[9px] uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    {message.text}
                                </div>
                            )}

                            {isSelf ? (
                                <div className="bg-slate-50 p-10 rounded-3xl text-center border border-slate-100">
                                    <p className="font-black text-slate-950 uppercase tracking-widest text-[9px]">Identity Lock: Self-audit protocol active.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Date</label>
                                        <input type="date" name="date" min={todayDate} value={bookingData.date} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} required className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-[13px] font-bold focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Phone</label>
                                        <input type="tel" name="phone" value={bookingData.phone} onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} required className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-[13px] font-bold focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Deployment Address</label>
                                        <input type="text" name="address" value={bookingData.address} onChange={(e) => setBookingData({...bookingData, address: e.target.value})} required placeholder="Unit / Street / Zone" className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-[13px] font-bold focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Directives</label>
                                        <textarea name="notes" rows="3" value={bookingData.notes} onChange={(e) => setBookingData({...bookingData, notes: e.target.value})} placeholder="Specify medical or logistical directives..." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[13px] font-medium italic focus:ring-1 focus:ring-slate-900 outline-none transition-all shadow-inner"></textarea>
                                    </div>
                                    <div className="md:col-span-2 pt-2">
                                        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-950 text-white font-black py-5 rounded-[1.5rem] uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black active:scale-95 transition-all">
                                            {isSubmitting ? 'Executing Dispatch...' : 'Authorize Dispatch'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="h-[2px] w-8 bg-slate-950"></div>
                                <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em]">Peer Audits.</span>
                            </div>

                            {reviews.length === 0 ? (
                                <div className="bg-white p-12 text-center rounded-[2.5rem] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Zero historical performance logs.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reviews.map((review, idx) => (
                                        <ReviewCard key={idx} review={review} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}