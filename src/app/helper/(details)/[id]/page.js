'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const StarRating = ({ rating }) => {
    const stars = [];
    const normalizedRating = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
        let colorClass = 'text-gray-400';
        
        if (normalizedRating >= i) {
            colorClass = 'text-gray-900';
        } else if (normalizedRating > i - 1 && normalizedRating < i) {
            colorClass = 'text-gray-900 opacity-50'; 
        }
        
        stars.push(<span key={i} className={`text-xl ${colorClass}`}>★</span>);
    }
    return <div className="flex justify-start space-x-1">{stars}</div>;
};

const ReviewCard = ({ review }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-800">{review.reviewerName}</h4>
            <span className="text-xs text-gray-500">{new Date(review.timestamp).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center mb-2">
            <StarRating rating={review.rating} />
            <span className="text-sm text-gray-600 ml-2">({review.rating}.0)</span>
        </div>
        <p className="text-gray-700 italic text-sm">&quot;{review.reviewText}&quot;</p>
    </div>
);


export default function HelperDetails() {
    const { id } = useParams();
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';

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
        date: '',
        startTime: '09:00',
        endTime: '11:00',
        address: '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setTodayDate(today);

        const storedUser = localStorage.getItem('user');
        let currentUser = null;
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            setUser(currentUser);
        } else {
            router.push('/login');
            return;
        }

        const fetchHelperAndReviews = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/helpers/${id}`);
                
                if (!res.ok) {
                    throw new Error("Helper profile not found or is not approved.");
                }
                const data = await res.json();
                
                setHelper({
                    ...data,
                    role: data.role || 'Unspecified',
                    image: data.image || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png',
                    rating: data.rating || 0,
                    reviews: data.reviews || 0,
                    location: data.location || 'N/A',
                    price: data.price || 'Negotiable'
                });

                if (currentUser && data.email === currentUser.email) {
                    setIsSelf(true);
                }
                
                setBookingData(prev => ({
                    ...prev,
                    address: currentUser.address || data.location || '',
                    phone: currentUser.phone || '',
                }));

                if (data._id) {
                    const reviewRes = await fetch(`${API_BASE_URL}/api/reviews/helper/${data._id}`);
                    if (reviewRes.ok) {
                        const reviewData = await reviewRes.json();
                        setReviews(reviewData);
                    } else {
                        console.warn("Could not fetch individual reviews.");
                    }
                }

            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHelperAndReviews();
        }

    }, [id, router]);

    const handleChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user || !helper) return;

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        
        const payload = {
            helperId: helper._id, 
            helperName: helper.name,
            helperEmail: helper.email,
            userEmail: user.email,
            userName: user.name || user.fullName, 
            
            date: bookingData.date,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            address: bookingData.address,
            phone: bookingData.phone,
            notes: bookingData.notes,
            status: 'Pending',
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: "✅ Booking Request Sent! The helper will review your request shortly. Redirecting to dashboard..." });
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setMessage({ type: 'error', text: `❌ Booking failed: ${data.message || 'An unknown error occurred.'}` });
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error submitting booking." });
            setIsSubmitting(false);
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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">Loading Helper Profile...</div>;
    if (error || !helper) return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-600 font-bold">Helper not found or API error.</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/helper" className="text-gray-600 hover:text-gray-900 transition flex items-center mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Helper Search
                </Link>
            </div>
            
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
                
                <div className="flex flex-col lg:flex-row border-b border-gray-200">
                    <div className="lg:w-1/3 p-10 bg-gray-100 text-gray-900 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-gray-200">
                        <img 
                            src={helper.image} 
                            alt={helper.name} 
                            className="w-40 h-40 rounded-full border-4 border-white shadow-xl mb-6 object-cover"
                        />
                        <h1 className="text-3xl font-extrabold text-gray-900">{helper.name}</h1>
                        <p className="text-gray-700 font-semibold uppercase tracking-wider text-sm mt-1">{helper.role}</p>
                        
                        <div className="flex justify-center my-4">
                            <StarRating rating={helper.rating} />
                            <span className="text-gray-600 text-sm ml-2">({helper.reviews} reviews)</span>
                        </div>

                        <div className="mt-4 space-y-4 w-full text-left bg-white p-6 rounded-2xl border border-gray-200">
                            <p className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500">Rate</span>
                                <span className="font-bold text-green-600">{helper.price}</span>
                            </p>
                            <p className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500">Location</span>
                                <span className="font-bold text-gray-800">{helper.location}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">Experience</span>
                                <span className="font-bold text-gray-800">{helper.experience}</span>
                            </p>
                        </div>

                        <p className="mt-8 text-gray-600 italic text-sm leading-relaxed text-center">&quot;{helper.bio}&quot;</p>
                        
                        {isSelf && (
                            <button 
                                onClick={() => router.push('/helper-dashboard')}
                                className="mt-6 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition w-full shadow-md"
                            >
                                Edit My Profile
                            </button>
                        )}
                    </div>
                    <div className="lg:w-2/3 p-10 bg-white">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">Book Appointment</h2>
                        
                        {message.text && (
                            <div className={`p-4 mb-6 rounded-lg border font-medium ${getMessageClasses(message.type)}`}>
                                {message.text}
                            </div>
                        )}

                        {isSelf ? (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg text-yellow-800 font-medium">
                                <p className="font-bold text-xl">Access Denied</p>
                                <p className="text-sm mt-2">You are viewing your own public profile. Use your Helper Dashboard to manage requests.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleBooking} className="space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                        <input 
                                            type="date" 
                                            name="date" 
                                            min={todayDate} 
                                            value={bookingData.date}
                                            onChange={handleChange} 
                                            required 
                                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                                        <input 
                                            type="tel" 
                                            name="phone" 
                                            required 
                                            value={bookingData.phone}
                                            onChange={handleChange} 
                                            placeholder="123-456-7890" 
                                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                        <input 
                                            type="time" 
                                            name="startTime" 
                                            required 
                                            value={bookingData.startTime}
                                            onChange={handleChange} 
                                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">End Time (Estimate)</label>
                                        <input 
                                            type="time" 
                                            name="endTime" 
                                            required 
                                            value={bookingData.endTime}
                                            onChange={handleChange} 
                                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Service Address</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        required 
                                        value={bookingData.address}
                                        onChange={handleChange} 
                                        placeholder="Full street address, city, zip" 
                                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Notes for Helper (Specific needs, tasks, etc.)</label>
                                    <textarea 
                                        name="notes" 
                                        rows="4" 
                                        value={bookingData.notes}
                                        onChange={handleChange} 
                                        placeholder="e.g., Assistance with light housekeeping and medication management." 
                                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-lg transition transform hover:-translate-y-0.5 ${
                                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {isSubmitting ? 'Submitting Request...' : `Confirm Booking Request`}
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    You are requesting a **Pending** booking. The helper must accept it on their dashboard.
                                </p>
                            </form>
                        )}
                    </div>
                </div>

                <div className="w-full p-10 bg-white">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                        Client Reviews ({reviews.length})
                    </h2>

                    {reviews.length === 0 ? (
                        <div className="bg-gray-50 p-8 text-center rounded-xl text-gray-500 border border-gray-200">
                            <p className="font-semibold">No customer reviews yet.</p>
                            <p className="text-sm mt-1">Be the first to book and leave a review!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((review) => (
                                <ReviewCard key={review.bookingId} review={review} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}