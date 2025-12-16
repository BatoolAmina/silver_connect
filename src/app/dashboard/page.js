'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper component for Star Rating (Re-used for the Edit Modal)
const MAX_STARS = 5;
const StarRatingInput = ({ rating, setRating, max = MAX_STARS }) => {
    const stars = [];
    for (let i = 0; i < max; i++) {
        const starValue = i + 1;
        stars.push(
            <span
                key={i}
                className={`cursor-pointer transition-colors text-2xl ${
                    starValue <= rating ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'
                }`}
                onClick={() => setRating(starValue)}
            >
                ★
            </span>
        );
    }
    return (
        <div className="flex space-x-1 justify-start">
            {stars}
        </div>
    );
};


export default function Dashboard() {
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';

    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showHelperPendingMessage, setShowHelperPendingMessage] = useState(false);
    
    const [isEditingReview, setIsEditingReview] = useState(null); 
    const [editReviewForm, setEditReviewForm] = useState({ rating: 0, reviewText: '' });

    const fetchAllData = async (parsedUser) => {
        try {
            const [resBookings, resReviews] = await Promise.all([
                fetch(`${API_BASE_URL}/api/bookings`),
                fetch(`${API_BASE_URL}/api/reviews`)
            ]);

            if (!resBookings.ok) throw new Error("Failed to fetch bookings.");
            if (!resReviews.ok) throw new Error("Failed to fetch reviews.");
            
            const allBookings = await resBookings.json();
            const allReviews = await resReviews.json();
            
            const userBookings = allBookings.filter(
                booking => booking.userEmail === parsedUser.email
            ).sort((a, b) => new Date(b.date) - new Date(a.date));

            setBookings(userBookings);

            const reviewerName = parsedUser.name || parsedUser.fullName;
            const userReviews = allReviews.filter(
                review => review.reviewerName === reviewerName
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setMyReviews(userReviews);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setMessage({ type: 'error', text: 'Failed to load dashboard data.' });
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
                        fetchAllData(parsedUser);
                    } else {
                        setUser(parsedUser);
                        fetchAllData(parsedUser);
                    }
                })
                .catch(() => {
                    setUser(parsedUser);
                    fetchAllData(parsedUser);
                });
            return;
        }
        
        setUser(parsedUser);
        fetchAllData(parsedUser);

        const roleCheckInterval = setInterval(() => {
            const updatedStoredUser = localStorage.getItem('user');
            if (updatedStoredUser) {
                const updatedParsedUser = JSON.parse(updatedStoredUser);
                
                if (updatedParsedUser.role !== parsedUser.role) {
                    router.push(`/${updatedParsedUser.role}-dashboard`);
                } else if (updatedParsedUser.role === 'user') {
                    fetchAllData(parsedUser);
                }
            }
        }, 10000);

        return () => clearInterval(roleCheckInterval);

    }, [router]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-600 text-white font-bold';
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
    
    const getHelperNameForReview = (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        return booking ? booking.helperName : "Helper";
    };

    const openEditReviewModal = (review) => {
        setIsEditingReview(review);
        setEditReviewForm({ 
            rating: review.rating, 
            reviewText: review.reviewText 
        });
    };

    const handleEditReviewChange = (e) => {
        const { name, value } = e.target;
        setEditReviewForm(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSetEditRating = (newRating) => {
        setEditReviewForm(prev => ({ ...prev, rating: newRating }));
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        
        if (editReviewForm.rating === 0) {
            setMessage({ type: 'error', text: "Please select a star rating (1-5)." });
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/${isEditingReview._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editReviewForm)
            });
            
            if (res.ok) {
                setMessage({ type: 'success', text: "Review updated successfully!" });
                setIsEditingReview(null); 
                fetchAllData(user); 
            } else {
                setMessage({ type: 'error', text: "Failed to update review." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error updating review." });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm("Are you sure you want to delete this review? Deleting the review allows you to submit a new one for the booking.")) return;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, { 
                method: 'DELETE' 
            });

            if (res.ok) {
                setMessage({ type: 'success', text: "Review deleted successfully! You can now review the associated booking again." });
                fetchAllData(user); 
            } else {
                setMessage({ type: 'error', text: "Failed to delete review." });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Server error deleting review." });
        }
    };


    if (loading || !user) return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans pb-20">
            
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white pt-12 pb-16 px-6 shadow-xl">
                <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <img 
                            src={user.image} 
                            alt={user.name} 
                            className="w-16 h-16 rounded-full border-4 border-white object-cover" 
                        />
                        <div>
                            <h1 className="text-3xl font-extrabold">Welcome, {user?.name || user?.fullName}</h1>
                            <p className="opacity-90 mt-1 text-sm">{user?.email}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 flex items-center self-start">
                            <span className="text-xs uppercase tracking-wider opacity-70 mr-2">Role:</span>
                            <span className="font-bold capitalize">{user?.role || 'Member'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-5xl -mt-8">
                
                {message.text && (
                    <div className={`p-4 mb-6 rounded-xl border font-medium ${getMessageClasses(message.type)}`}>
                        {message.text}
                    </div>
                )}
                
                {showHelperPendingMessage && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-xl text-yellow-800 font-medium mb-6 shadow-md">
                        <p className="font-bold text-xl">Application Pending</p>
                        <p className="text-sm mt-2">Your helper profile application is currently under review by the administrator. You will be automatically redirected to your Helper Dashboard upon approval.</p>
                    </div>
                )}

                <div className="flex border-b border-gray-300 mt-8 mb-8">
                    <button 
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-3 font-bold transition-colors ${activeTab === 'bookings' ? 'text-gray-900 border-b-4 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Appointments ({bookings.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-3 font-bold transition-colors ${activeTab === 'reviews' ? 'text-gray-900 border-b-4 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Reviews ({myReviews.length})
                    </button>
                </div>

                {activeTab === 'bookings' && (
                    <>
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
                                <h3 className="text-gray-500 text-sm font-bold uppercase">Need a New Service?</h3>
                                <Link href="/helper">
                                    <button className="text-gray-900 text-sm font-bold hover:underline mt-2 block w-max">Book a helper →</button>
                                </Link>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Upcoming & Past Appointments</h2>

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
                                    <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        
                                        <div className="flex items-start gap-4 w-full">
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-sm flex-shrink-0">
                                                {booking.status === 'Confirmed' ? '✅' : '⏳'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg md:text-xl font-bold text-gray-800">{booking.helperName || "Care Appointment"}</h3>
                                                <p className="text-gray-500 text-xs md:text-sm mt-1">Helper Email: {booking.helperEmail}</p>
                                                <div className="text-gray-600 text-sm mt-2 flex flex-col md:flex-row gap-1 md:gap-3">
                                                    <span className="font-medium">📅 {booking.date}</span>
                                                    <span className="hidden md:inline">|</span>
                                                    <span className="font-medium">⏰ {booking.startTime} - {booking.endTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0">
                                            
                                            <span className={`px-3 py-1.5 rounded-full text-xs uppercase ${getStatusClass(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            
                                            {['Pending', 'Confirmed'].includes(booking.status) && !booking.isReviewed && (
                                                <button 
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="text-gray-400 hover:text-red-500 transition text-2xl md:text-lg p-1" 
                                                    title="Cancel Booking"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                            
                                            {booking.status === 'Confirmed' && (
                                                booking.isReviewed ? (
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-300">
                                                        Reviewed
                                                    </span>
                                                ) : (
                                                    <Link href={`/review/${booking.id}`}>
                                                        <button 
                                                            className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-green-700 transition shadow-sm"
                                                            title="Submit Review"
                                                        >
                                                            Rate Helper
                                                        </button>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'reviews' && (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Reviews I've Written</h2>
                        {myReviews.length === 0 ? (
                            <div className="bg-white p-16 rounded-xl shadow-sm text-center border border-gray-200">
                                <div className="text-5xl mb-4">⭐</div>
                                <h3 className="text-xl font-bold text-gray-800">No reviews submitted yet.</h3>
                                <p className="text-gray-500 mt-2">Finish a confirmed booking to leave a review.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {myReviews.map(review => (
                                    <div key={review._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition hover:shadow-lg relative">
                                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                                            <p className="font-bold text-lg text-gray-900">
                                                Review for: <span className="text-gray-600">{getHelperNameForReview(review.bookingId)}</span>
                                            </p>
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-amber-500 text-xl mb-3">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <span key={i} className={`text-2xl ${i < review.rating ? 'text-amber-500' : 'text-gray-300'}`}>★</span>
                                            ))}
                                            <span className="ml-3 text-gray-900 font-bold text-xl">{review.rating}</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed italic pt-3 mt-3">
                                            "{review.reviewText}"
                                        </p>
                                        <p className="text-xs text-gray-400 mt-3">Booking ID: {review.bookingId}</p>
                                        
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <button 
                                                onClick={() => openEditReviewModal(review)}
                                                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full text-sm font-bold transition border border-blue-200"
                                                title="Edit Review"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteReview(review._id)}
                                                className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-full text-sm font-bold transition border border-red-200"
                                                title="Delete Review"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {isEditingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Edit Your Review for: {getHelperNameForReview(isEditingReview.bookingId)}</h3>
                            <button onClick={() => setIsEditingReview(null)} className="text-white hover:text-gray-300 font-bold text-xl">×</button>
                        </div>
                        
                        <form onSubmit={handleUpdateReview} className="p-6 space-y-4">
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                <StarRatingInput 
                                    rating={editReviewForm.rating} 
                                    setRating={handleSetEditRating} 
                                />
                                <p className="text-xs text-gray-500 mt-1">Click stars to select rating.</p>
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
                                <button 
                                    type="submit" 
                                    disabled={editReviewForm.rating === 0}
                                    className={`w-full font-bold py-3 rounded-lg transition shadow-lg ${
                                        editReviewForm.rating === 0 
                                            ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                                            : 'bg-gray-900 text-white hover:bg-gray-700'
                                    }`}
                                >
                                    Save Review Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}