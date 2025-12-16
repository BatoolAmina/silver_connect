'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const MAX_STARS = 5;

const StarInput = ({ rating, setRating }) => {
    const stars = [];
    for (let i = 0; i < MAX_STARS; i++) {
        const starValue = i + 1;
        stars.push(
            <span
                key={i}
                className={`cursor-pointer transition-colors ${
                    starValue <= rating ? 'text-gray-900' : 'hover:text-gray-600'
                }`}
                onClick={() => setRating(starValue)}
            >
                ★
            </span>
        );
    }
    return (
        <div className="flex justify-center space-x-2 text-4xl text-gray-400">
            {stars}
        </div>
    );
};

export default function ReviewPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.bookingId;
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';

    const [user, setUser] = useState(null);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

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

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        
        if (!parsedUser) {
            router.push('/login');
            return;
        }
        setUser(parsedUser);

        const fetchBookingDetails = async () => {
            if (!bookingId) {
                router.push('/dashboard');
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
                
                if (!res.ok) {
                    throw new Error("Booking not found or network error.");
                }
                
                const data = await res.json();
                
                // 1. Check Booking Status
                if (data.status !== 'Confirmed') {
                    setError(`Booking must be 'Confirmed' to be reviewed. Status: ${data.status}`);
                    // Allow the user to see the error briefly before redirect
                    setTimeout(() => router.push('/dashboard'), 3000); 
                    return;
                }
                
                // 2. Check Authorization (Ensure current user owns the booking)
                if (data.userEmail !== parsedUser.email) {
                    setError("Unauthorized access to this review form.");
                    setTimeout(() => router.push('/dashboard'), 3000);
                    return;
                }
                
                // 3. Check Review Status
                if (data.isReviewed === true) {
                    setMessage({ 
                        type: 'error', 
                        text: "This booking has already been reviewed. If you deleted a review, please proceed." 
                    });
                    // DO NOT redirect here, as the user might be trying to re-review after deletion.
                }

                setBooking(data);

            } catch (err) {
                setError(err.message);
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
        
    }, [bookingId, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        if (!user || !booking) {
            setMessage({ type: 'error', text: "Error: Required user or booking data is missing." });
            return;
        }
        
        if (rating === 0) {
            setMessage({ type: 'error', text: "Please select a rating of at least 1 star." });
            return;
        }

        setIsSubmitting(true);
        const HELPER_ID = booking.helperId; 
        const REVIEWER_NAME = user.name || user.fullName;

        const reviewPayload = {
            helperId: HELPER_ID, 
            reviewerName: REVIEWER_NAME,
            rating: rating,
            reviewText: reviewText,
            bookingId: bookingId,
        };
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewPayload)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: "⭐ Thank you! Your review has been submitted. Redirecting to Dashboard..." });
                setTimeout(() => router.push('/dashboard'), 2000); 
            } else {
                const errorData = await res.json();
                setMessage({ type: 'error', text: `Submission failed: ${errorData.message || 'An unknown error occurred.'}` });
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error during submission." });
            setIsSubmitting(false);
        }
    };


    if (loading || !user) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">Loading Review Form...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-600 font-bold">Error: {error}</div>;
    }

    if (!booking) {
        return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-600 font-bold">Booking data unavailable.</div>;
    }


    return (
        <div className="min-h-screen bg-gray-50 font-sans py-12 px-6">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-8">
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Service Review</h1>
                <p className="text-gray-600 mb-6 border-b pb-4">
                    Please rate your experience with <span className="font-bold text-gray-800">{booking.helperName}</span>, booked on {booking.date}.
                </p>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg border font-medium ${getMessageClasses(message.type)}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    <div className="text-center">
                        <label className="block text-lg font-bold text-gray-700 mb-4">Your Rating</label>
                        <StarInput rating={rating} setRating={setRating} />
                        <p className="text-sm text-gray-500 mt-2">{rating > 0 ? `${rating} out of ${MAX_STARS} stars` : 'Click a star to rate'}</p>
                    </div>

                    <div>
                        <label htmlFor="reviewText" className="block text-lg font-bold text-gray-700 mb-2">Your Feedback</label>
                        <textarea
                            id="reviewText"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows="5"
                            placeholder={`Tell us about your experience with ${booking.helperName} (e.g., professionalism, punctuality, quality of care).`}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none"
                            required
                        ></textarea>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting || rating === 0 || !user || !booking} 
                        className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-lg transition transform hover:-translate-y-0.5 ${
                            (isSubmitting || rating === 0 || !user || !booking) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    
                    <Link href="/dashboard" className="block text-center text-sm text-gray-500 hover:text-gray-900 transition">
                        Cancel and return to Dashboard
                    </Link>
                </form>
            </div>
        </div>
    );
}