'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';

    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showHelperPendingMessage, setShowHelperPendingMessage] = useState(false);

    const fetchBookings = async (parsedUser) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings`);
            if (!res.ok) throw new Error("Failed to fetch bookings.");
            
            const allBookings = await res.json();
            
            const userBookings = allBookings.filter(
                booking => booking.userEmail === parsedUser.email
            ).sort((a, b) => new Date(b.date) - new Date(a.date));

            setBookings(userBookings);

        } catch (error) {
            console.error("Error fetching bookings:", error);
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
            fetch(`${API_BASE_URL}/api/helper-profile/${parsedUser.email}`)
                .then(res => res.json())
                .then(profile => {
                    if (profile.status === 'Approved') {
                        router.push('/helper-dashboard');
                    } else if (profile.status === 'Pending') {
                        setShowHelperPendingMessage(true);
                        setUser(parsedUser);
                        fetchBookings(parsedUser);
                    } else {
                        setUser(parsedUser);
                        fetchBookings(parsedUser);
                    }
                })
                .catch(() => {
                    setUser(parsedUser);
                    fetchBookings(parsedUser);
                });
            return;
        }
        
        setUser(parsedUser);
        fetchBookings(parsedUser);

        const roleCheckInterval = setInterval(() => {
            const updatedStoredUser = localStorage.getItem('user');
            if (updatedStoredUser) {
                const updatedParsedUser = JSON.parse(updatedStoredUser);
                
                if (updatedParsedUser.role !== parsedUser.role) {
                    router.push(`/${updatedParsedUser.role}-dashboard`);
                } else if (updatedParsedUser.role === 'user') {
                    fetchBookings(parsedUser);
                }
            }
        }, 10000);

        return () => clearInterval(roleCheckInterval);

    }, [router]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-gray-900 text-white font-semibold';
            case 'Rejected':
            case 'Cancelled':
                return 'bg-red-100 text-red-700 font-semibold';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-700 font-semibold';
        }
    };
    
    const handleCancelBooking = async (bookingId) => {
        const bookingToCancel = bookings.find(b => b.id === bookingId);
        
        if (!bookingToCancel || !['Pending', 'Confirmed'].includes(bookingToCancel.status)) {
            setMessage({ type: 'error', text: "This booking cannot be cancelled in its current state." });
            return;
        }

        if(window.confirm(`Are you sure you want to cancel the booking with ${bookingToCancel.helperName} on ${bookingToCancel.date}?`)) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, { 
                    method: 'PUT' 
                });
                
                if (res.ok) {
                    setMessage({ type: 'success', text: "Booking successfully cancelled. The helper has been notified." });
                    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
                } else {
                    setMessage({ type: 'error', text: "Failed to cancel booking. Server error." });
                }

            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: "Server error during cancellation." });
            }
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

    if (loading || !user) return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans pb-20">
            
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-12 px-6 shadow-xl">
                <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold">My Dashboard</h1>
                        <p className="opacity-90 mt-1">Welcome back, <span className="font-bold text-gray-200">{user?.name || user?.fullName}</span></p>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-lg border border-white/20 flex items-center">
                            <span className="text-xs uppercase tracking-wider opacity-70 mr-2">Role:</span>
                            <span className="font-bold capitalize">{user?.role || 'Member'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-5xl -mt-8">
                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg border font-medium ${getMessageClasses(message.type)}`}>
                        {message.text}
                    </div>
                )}
                
                {showHelperPendingMessage && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg text-yellow-800 font-medium mb-6 shadow-md">
                        <p className="font-bold text-xl">Application Pending</p>
                        <p className="text-sm mt-2">Your helper profile application is currently under review by the administrator. You will be automatically redirected to your Helper Dashboard upon approval.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Total Bookings</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Confirmed Services</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">{bookings.filter(b => b.status === 'Confirmed').length}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Find a Helper</h3>
                        <Link href="/helper">
                            <button className="text-gray-900 text-sm font-bold hover:underline mt-2 block w-max">Book a new service →</button>
                        </Link>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Your Appointments</h2>

                {bookings.length === 0 ? (
                    <div className="bg-white p-16 rounded-xl shadow-sm text-center border border-gray-200">
                        <div className="text-5xl mb-4">📅</div>
                        <h3 className="text-xl font-bold text-gray-800">No bookings yet</h3>
                        <Link href="/helper">
                            <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition shadow-md font-bold mt-6">Find a Helper</button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-300 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-start gap-6 w-full md:w-auto">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                                        {booking.status === 'Confirmed' ? '✅' : '⏳'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{booking.helperName || "Care Appointment"}</h3>
                                        <p className="text-gray-500 text-sm mt-1">Helper Email: {booking.helperEmail}</p>
                                        <div className="text-gray-500 text-sm mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
                                            <span>📅 {booking.date}</span>
                                            <span>|</span>
                                            <span>⏰ {booking.startTime} - {booking.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                    
                                    <span className={`px-4 py-2 rounded-full text-xs ${getStatusClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                    
                                    {['Pending', 'Confirmed'].includes(booking.status) && !booking.isReviewed && (
                                        <button 
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="text-gray-400 hover:text-red-500 transition text-lg" 
                                            title="Cancel Booking"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    
                                    {booking.status === 'Confirmed' && (
                                        booking.isReviewed ? (
                                            <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold border border-gray-300">
                                                Reviewed
                                            </span>
                                        ) : (
                                            <Link href={`/review/${booking.id}`}>
                                                <button 
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                                                    title="Submit Review"
                                                >
                                                    Submit Review
                                                </button>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}