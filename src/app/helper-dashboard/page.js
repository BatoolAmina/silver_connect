'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const StarRating = ({ rating }) => {
    const stars = [];
    const normalizedRating = rating || 0;
    for (let i = 0; i < 5; i++) {
        const isFilled = i < normalizedRating;
        stars.push(
            <span key={i} className={`text-sm ${isFilled ? 'text-slate-900' : 'text-gray-200'}`}>
                ★
            </span>
        );
    }
    return <div className="flex space-x-0.5">{stars}</div>;
};

export default function HelperDashboard() {
    const router = useRouter();
    const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://backend-minor-project.onrender.com';

    const [user, setUser] = useState(null);
    const [helperProfile, setHelperProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageURL, setImageURL] = useState('');
    
    // TAB VIEW STATE
    const [currentView, setCurrentView] = useState('active'); 

    const [formData, setFormData] = useState({
        role: '', 
        price: '',
        location: '',
        experience: '',
        bio: '',
        description: ''
    });
    
    const fetchAllData = useCallback(async (parsedUser) => {
        try {
            const profileRes = await fetch(`${API_BASE_URL}/api/helper-profile/${parsedUser.email}`);
            if (!profileRes.ok) {
                parsedUser.role = 'user';
                localStorage.setItem('user', JSON.stringify(parsedUser));
                router.push('/dashboard');
                return;
            }
            
            const profileData = await profileRes.json();
            if (profileData.status !== 'Approved') {
                setIsApproved(false);
                setHelperProfile(profileData);
                setLoading(false);
                return;
            }
            
            setIsApproved(true);
            setHelperProfile(profileData);
            setFormData({
                role: profileData.role || '',
                price: profileData.price || '',
                location: profileData.location || '',
                experience: profileData.experience || '',
                bio: profileData.bio || '',
                description: profileData.description || ''
            });
            setImageURL(profileData.image || '');

            const bookingsRes = await fetch(`${API_BASE_URL}/api/bookings`);
            const allBookings = await bookingsRes.json();
            const helperName = profileData.name || parsedUser.fullName;
            
            const myJobs = allBookings.filter(b => 
                b.helperEmail === parsedUser.email || 
                b.helperName === helperName
            ).sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setBookings(myJobs);
        } catch (err) {
            console.error("Sync Error:", err);
            setMessage({ type: 'error', text: "DATABASE SYNCHRONIZATION FAILURE." });
        } finally {
            setLoading(false);
        }
    }, [router, API_BASE_URL]);
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        let parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'helper') {
            router.push('/dashboard');
            return;
        }
        setUser(parsedUser);
        fetchAllData(parsedUser);
    }, [router, fetchAllData]);

    const handleStatusChange = async (id, newStatus) => {
        setMessage({ type: '', text: '' });
        const endpoint = newStatus === 'Confirmed' ? 'approve' : 'cancel';
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/${endpoint}`, { method: 'PUT' });
            if (res.ok) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
                setMessage({ type: 'success', text: `✓ STATUS COMMITTED: ${newStatus.toUpperCase()}` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "TRANSMISSION FAILURE." });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        
        if (selectedImage) dataToSend.append('image', selectedImage);
        else if (imageURL) dataToSend.append('imageURL', imageURL);

        try {
            const res = await fetch(`${API_BASE_URL}/api/helper-profile/${user.email}`, {
                method: 'PUT',
                body: dataToSend
            });

            if (res.ok) {
                const updatedProfile = await res.json();
                const currentUser = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({ ...currentUser, image: updatedProfile.image }));
                window.dispatchEvent(new Event('userUpdated'));
                setHelperProfile(updatedProfile);
                setIsEditing(false);
                setMessage({ type: 'success', text: "✓ PROFILE SYNCHRONIZED SUCCESSFULLY." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "CLOUD UPDATE FAILED." });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-black tracking-widest text-[9px] uppercase">Accessing Terminal...</p>
        </div>
    );
    
    const activeJobs = bookings.filter(b => ['Pending', 'Confirmed'].includes(b.status));
    const historyJobs = bookings.filter(b => ['Cancelled', 'Rejected', 'Completed'].includes(b.status));
    const displayedJobs = currentView === 'active' ? activeJobs : historyJobs;

    return (
        <div className="min-h-screen bg-gray-200 font-sans text-slate-900 pb-20">
            <header className="bg-slate-900 text-white pt-20 pb-30 px-6 relative overflow-hidden text-center lg:text-left">
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-500 mb-3 block">Specialist Node v2.0</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">Helper <span className="text-gray-500 font-light italic">Terminal.</span></h1>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            </header>

            <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-20 flex flex-col lg:flex-row gap-10">
                <div className="lg:w-2/3 space-y-8">
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.3em] mb-2">Queue</span>
                            <span className="text-3xl font-black italic">{activeJobs.filter(b => b.status === 'Pending').length}</span>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.3em] mb-2">Rating</span>
                            <span className="text-3xl font-black italic">{helperProfile?.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hidden md:flex">
                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.3em] mb-2">Archives</span>
                            <span className="text-3xl font-black italic">{historyJobs.length}</span>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-xl border font-black text-[9px] tracking-[0.1em] uppercase ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                            {message.text}
                        </div>
                    )}
                    <div className="flex gap-6 border-b border-gray-200">
                        <button 
                            onClick={() => setCurrentView('active')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                                currentView === 'active' ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-500 hover:text-gray-500'
                            }`}
                        >
                            Active Operations
                        </button>
                        <button 
                            onClick={() => setCurrentView('history')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                                currentView === 'history' ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-500 hover:text-gray-500'
                            }`}
                        >
                            Historical Archives
                        </button>
                    </div>

                    <div className="space-y-5">
                        {displayedJobs.length === 0 ? (
                            <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-gray-100">
                                <p className="text-gray-300 font-black uppercase tracking-widest text-[9px]">Zero logs in this directory.</p>
                            </div>
                        ) : (
                            displayedJobs.map((booking) => (
                                <div key={booking.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-xl group relative overflow-hidden animate-in fade-in duration-500">
                                    {booking.status === 'Pending' && <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>}
                                    
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-50">
                                        <div>
                                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-1 italic">Client ID</span>
                                            <h3 className="text-xl font-black uppercase italic text-slate-900 leading-none">{booking.userName}</h3>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                            booking.status === 'Confirmed' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-300 border-gray-100'
                                        }`}>
                                            {booking.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10 text-[9px] mb-8">
                                        <div className="flex flex-col">
                                            <span className="font-black uppercase text-gray-500 tracking-[0.2em] mb-1 italic">Temporal Link</span>
                                            <span className="font-bold text-slate-800 uppercase">{booking.date} — {booking.startTime}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black uppercase text-gray-500 tracking-[0.2em] mb-1 italic">Deployment Address</span>
                                            <span className="font-bold text-slate-700 truncate uppercase">{booking.address}</span>
                                        </div>
                                    </div>
                                    
                                    {booking.status === 'Pending' && (
                                        <div className="flex gap-3 pt-2">
                                            <button onClick={() => handleStatusChange(booking.id, 'Confirmed')} className="flex-1 bg-slate-900 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[9px] hover:bg-black transition-all shadow-lg active:scale-[0.98]">Authorize</button>
                                            <button onClick={() => handleStatusChange(booking.id, 'Rejected')} className="flex-1 bg-white text-gray-400 border-2 border-gray-100 font-black py-4 rounded-xl uppercase tracking-widest text-[9px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-[0.98]">Dismiss</button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <aside className="lg:w-1/3">
                    <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden sticky top-10">
                        <header className="bg-gray-50/50 p-10 border-b border-gray-100 flex flex-col items-center text-center">
                            <img src={helperProfile?.image} alt="" className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl mb-6 grayscale hover:grayscale-0 transition-all duration-700" />
                            <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">{helperProfile?.name}</h3>
                            <div className="mt-4 flex flex-col items-center">
                                <StarRating rating={helperProfile?.rating} />
                                <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.4em] mt-3">Verified Professional</span>
                            </div>
                        </header>
                        
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 italic leading-none">Internal Dossier</h4>
                                <button onClick={() => setIsEditing(!isEditing)} className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-lg transition-all shadow-sm ${
                                    isEditing ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'
                                }`}>{isEditing ? 'Cancel' : 'Modify'}</button>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSave} className="space-y-4">
                                    <input name="role" value={formData.role} onChange={handleChange} placeholder="Role" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-1 focus:ring-slate-900" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="price" value={formData.price} onChange={handleChange} placeholder="Rate" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold" />
                                        <input name="experience" value={formData.experience} onChange={handleChange} placeholder="Years" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold" />
                                    </div>
                                    <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} placeholder="Short bio..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-medium italic leading-relaxed"></textarea>
                                    <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[9px] shadow-lg shadow-slate-200 active:scale-[0.98]">
                                        {isSaving ? 'Updating...' : 'Commit Changes'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-5 text-[10px] font-medium leading-relaxed">
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-600 font-black uppercase text-[8px] tracking-widest">Classification</span>
                                        <span className="font-black text-slate-900 uppercase italic">{helperProfile?.role}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-600 font-black uppercase text-[8px] tracking-widest">Valuation</span>
                                        <span className="font-black italic text-slate-900">{helperProfile?.price}</span>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-gray-600 italic leading-relaxed">&quot;{helperProfile?.bio || "No dossier available."}&quot;</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}