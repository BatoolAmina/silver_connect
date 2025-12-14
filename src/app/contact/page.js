'use client';

import React, { useState } from 'react';

export default function ContactPage() {
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', subject: '', message: '' }); 
            } else {
                setError("Failed to send message. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Could not connect to the API.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="relative py-35 text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero5.png" 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    /> 
                    <div className="absolute inset-0 bg-gray-900/80"></div>
                </div>
                <div className="max-w-4xl mx-auto relative z-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
                        Get in Touch
                    </h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        We are here to help you and your family. Reach out to us anytime.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16 -mt-10 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                    
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                            <h3 className="text-xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">Contact Information</h3>
                            
                            <div className="space-y-8">
                                <div className="flex items-start gap-5">
                                    <div className="bg-gray-100 p-4 rounded-full text-gray-700 text-xl">📍</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">Our Office</h4>
                                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">123 Caregiver Lane<br/>Wellness City, WC 45678</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="bg-gray-100 p-4 rounded-full text-gray-700 text-xl">📞</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">Phone</h4>
                                        <p className="text-gray-500 text-sm mt-1">Mon-Fri from 8am to 5pm</p>
                                        <p className="text-gray-900 font-bold text-lg mt-1 hover:underline cursor-pointer">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="bg-gray-100 p-4 rounded-full text-gray-700 text-xl">✉️</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">Email</h4>
                                        <p className="text-gray-500 text-sm mt-1">For general inquiries:</p>
                                        <p className="text-gray-700 font-medium">support@silverconnect.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
                            
                            {submitted ? (
                                <div className="text-center py-20 animate-fadeIn">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent Successfully!</h3>
                                    <p className="text-gray-500">Thank you for contacting us. We will get back to you within 24 hours.</p>
                                    <button 
                                        onClick={() => setSubmitted(false)} 
                                        className="mt-8 text-gray-900 font-bold hover:bg-gray-100 px-6 py-2 rounded-lg transition border border-gray-300"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                                    
                                    {error && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                                            <span className="block sm:inline">{error}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                            <input 
                                                type="text" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-gray-400 outline-none transition shadow-sm"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-gray-400 outline-none transition shadow-sm"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                        <select 
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-gray-400 outline-none transition shadow-sm"
                                        >
                                            <option value="">Select a topic...</option>
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Booking Support">Booking Support</option>
                                            <option value="Join as Helper">Join as Helper</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                        <textarea 
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-gray-400 outline-none transition shadow-sm"
                                            placeholder="How can we help you?"
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className={`w-full text-white font-bold py-4 rounded-lg transition shadow-md transform hover:-translate-y-0.5 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-500 hover:from-gray-800 hover:to-gray-600'}`}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}