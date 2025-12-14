'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const StarRating = ({ rating }) => {
    const stars = [];
    const normalizedRating = rating || 0;
    
    for (let i = 0; i < 5; i++) {
        const isFilled = i < normalizedRating;
        stars.push(
            <span key={i} className={`text-xl ${isFilled ? 'text-amber-500' : 'text-gray-300'}`}>
                ★
            </span>
        );
    }
    return <div className="flex space-x-0.5">{stars}</div>;
};

export default function HelperDashboard() {
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';

    const [user, setUser] = useState(null);
    const [helperProfile, setHelperProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
                console.warn("Helper profile not found. Redirecting to User Dashboard.");
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

            const bookingsRes = await fetch(`${API_BASE_URL}/api/bookings`);
            const allBookings = await bookingsRes.json();
            
            const helperName = profileData.name || parsedUser.fullName;

            const myJobs = allBookings.filter(b => b.helperName === helperName)
                .sort((a, b) => {
                    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                    return new Date(a.date) - new Date(b.date);
                });

            setBookings(myJobs);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [router]);
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        let parsedUser = JSON.parse(storedUser);
        
        if (parsedUser.role !== 'helper') {
            console.warn("Access Denied. Redirecting to User Dashboard.");
            router.push('/dashboard');
            return;
        }

        setUser(parsedUser);
        const roleCheckInterval = setInterval(() => {
            const updatedStoredUser = localStorage.getItem('user');
            if (updatedStoredUser) {
                const updatedParsedUser = JSON.parse(updatedStoredUser);
                if (updatedParsedUser.role !== 'helper') {
                    console.warn("Helper profile removed by Admin. Redirecting.");
                    clearInterval(roleCheckInterval);
                    router.push('/dashboard');
                }
            }
        }, 3000);

        fetchAllData(parsedUser);
        
        return () => clearInterval(roleCheckInterval);

    }, [router, fetchAllData]);

    const handleStatusChange = async (id, newStatus) => {
        setMessage({ type: '', text: '' });
        const endpoint = newStatus === 'Confirmed' ? 'approve' : 'reject';
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/${endpoint}`, { 
                method: 'PUT' 
            });

            if (res.ok) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
                setMessage({ type: 'success', text: `Booking ${newStatus} Successfully!` });
            } else {
                setMessage({ type: 'error', text: "Failed to update status." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error updating status." });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_BASE_URL}/api/helper-profile/${user.email}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const updatedProfile = await res.json();
                setHelperProfile(updatedProfile);
                setIsEditing(false);

                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser) {
                    const updatedUserSession = { 
                        ...currentUser, 
                        bio: updatedProfile.bio || currentUser.bio,
                        address: updatedProfile.location || currentUser.address, 
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUserSession));
                }
                
                setMessage({ type: 'success', text: "✅ Public profile updated successfully!" });

            } else {
                setMessage({ type: 'error', text: "Failed to update profile." });
            }
        } catch (err) { 
            console.error(err); 
            setMessage({ type: 'error', text: "Server error during profile update." }); 
        } 
        finally { 
            setIsSaving(false); 
        }
    };
    
    const getStatusClass = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-100 text-green-700';
            case 'Rejected':
            case 'Cancelled':
                return 'bg-red-100 text-red-700';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getMessageClasses = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'error':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'hidden';
        }
    };
    
    if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-gray-500">Loading Dashboard...</div>;
    
    if (!isApproved && helperProfile && helperProfile.status === 'Pending') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl text-center border-t-4 border-yellow-500">
                    <div className="text-6xl mb-4">⏳</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Pending</h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for submitting your profile! Your application is currently under review by our administration team.
                    </p>
                    <p className="text-sm text-yellow-600 font-semibold mb-6 bg-yellow-50 p-3 rounded-lg">
                        You will gain full access to the Helper Dashboard once your profile is officially approved.
                    </p>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition"
                    >
                        Go to User Dashboard
                    </button>
                </div>
            </div>
        );
    }
    
    if (!helperProfile) return <div className="p-10 text-center">Profile not found. Please contact support.</div>;

    const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;

    return (
        <div className="min-h-screen bg-gray-100 font-sans pb-20">
            
            <div className="bg-gray-900 text-white py-12 px-6 text-center shadow-lg">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-4xl font-extrabold mb-2">Helper Dashboard</h1>
                    <p className="opacity-80 text-lg">Manage your public profile and incoming job requests.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pt-8 relative z-10 flex flex-col lg:flex-row gap-8">
                
                <div className="lg:w-3/5 space-y-6">
                    
                    {message.text && (
                        <div className={`p-4 mb-6 rounded-lg border font-medium ${getMessageClasses(message.type)}`}>
                            {message.text}
                        </div>
                    )}

                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-300">
                        Incoming Job Requests 
                        <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">{pendingBookingsCount}</span>
                    </h2>

                    {bookings.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl shadow-md text-center text-gray-500 border border-gray-200">
                            <div className="text-5xl mb-4">🙌</div>
                            <p className="text-xl font-semibold">No job requests currently.</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition hover:shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{booking.userName}</h3>
                                        <p className="text-sm text-gray-500">{booking.userEmail}</p>
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${getStatusClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-700 mb-6 border border-gray-100">
                                    <p><strong>📅 Date:</strong> {booking.date}</p>
                                    <p><strong>⏰ Time:</strong> {booking.startTime} - {booking.endTime}</p>
                                    <p><strong>📍 Address:</strong> {booking.address}</p>
                                    <p><strong>📞 Phone:</strong> {booking.phone}</p>
                                    {booking.notes && <p className="pt-2 border-t border-gray-200 mt-2"><strong>📝 Note:</strong> <span className="italic">&quot;{booking.notes}&quot;</span></p>}
                                </div>
                                
                                <div className='flex justify-end items-center'>
                                    {booking.status === 'Pending' && (
                                        <div className="flex gap-4 w-full">
                                            <button 
                                                onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md"
                                            >
                                                Accept Job
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(booking.id, 'Rejected')}
                                                className="w-full bg-white border border-red-300 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition shadow-md"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {booking.status === 'Confirmed' && <p className="text-green-600 font-bold text-center bg-green-50 p-3 rounded-lg mt-4 border border-green-200">✅ You have accepted this job.</p>}
                                {booking.status === 'Rejected' && <p className="text-red-500 font-bold text-center bg-red-50 p-3 rounded-lg mt-4 border border-red-200">❌ You have declined this request.</p>}
                                {booking.status === 'Cancelled' && <p className="text-red-500 font-bold text-center bg-red-50 p-3 rounded-lg mt-4 border border-red-200">❌ Client cancelled this request.</p>}
                            </div>
                        ))
                    )}
                </div>

                <div className="lg:w-2/5">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden sticky top-6">
                        <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className='flex items-center gap-4'>
                                <img src={helperProfile.image} alt={helperProfile.name} className="w-16 h-16 rounded-full border-2 border-gray-700 object-cover shadow-md"/>
                                <div>
                                    <h3 className="font-extrabold text-xl text-gray-900">{helperProfile.name}</h3>
                                    <p className="text-xs text-gray-500">Public visibility details</p>
                                    {/* Optional: Display Rating */}
                                    {helperProfile.rating > 0 && (
                                        <div className="flex items-center mt-1">
                                            <StarRating rating={helperProfile.rating} />
                                            <span className="text-xs text-gray-500 ml-1">({helperProfile.reviews || 0})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`text-sm font-bold px-3 py-1 rounded-lg transition shrink-0 ${
                                    isEditing 
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-gray-900 text-white hover:bg-gray-700 shadow-md'
                                }`}
                            >
                                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                        </div>
                        
                        {!isEditing && (
                            <div className="p-8 space-y-5 text-gray-700">
                                <p><strong>Service Role:</strong> <span className="font-semibold">{helperProfile.role}</span></p>
                                <p><strong>Hourly Rate:</strong> <span className="font-semibold text-green-600">{helperProfile.price}</span></p>
                                <p><strong>Location:</strong> {helperProfile.location}</p>
                                <p><strong>Experience:</strong> {helperProfile.experience}</p>
                                <p className="pt-3 border-t border-gray-100"><strong>Bio:</strong> <span className="italic">&quot;{helperProfile.bio}&quot;</span></p>
                                <p className="pt-3 border-t border-gray-100"><strong>Description:</strong> {helperProfile.description}</p>
                            </div>
                        )}

                        {isEditing && (
                            <form onSubmit={handleSave} className="p-8 space-y-5">
                                
                                <div className='space-y-4'>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Role</label>
                                        <input name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none" required />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hourly Rate</label>
                                            <input name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                                            <input name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience</label>
                                        <input name="experience" value={formData.experience} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                                    </div>
                                </div>
                                
                                <div className='space-y-4 pt-4 border-t border-gray-100'>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio (Short summary)</label>
                                        <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Description</label>
                                        <textarea name="description" rows="5" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"></textarea>
                                    </div>
                                </div>


                                <button type="submit" disabled={isSaving} className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition shadow-md">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

            </div>
            
        </div>
    );
}