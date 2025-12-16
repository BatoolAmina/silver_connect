'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';
    
    const MIN_BIO_LENGTH = 50;

    const [formData, setFormData] = useState({
        name: '',
        role: 'Companion',
        customRole: '',
        price: '',
        location: '',
        experience: '',
        bio: '',
        description: '' 
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            
            // 1. ADMIN CHECK: Redirect Admin users
            if (parsedUser.role === 'admin') {
                setIsAdmin(true);
                setMessage({ type: 'info', text: "Access Restricted: Administrators manage the system and cannot apply as regular helpers." });
                return; 
            }
            
            // 2. HELPER CHECK: Redirect existing helpers
            if (parsedUser.role === 'helper') {
                router.push('/helper-dashboard');
                return;
            }
            
            // 3. Authenticated User (non-admin, non-helper)
            setUserEmail(parsedUser.email);
            setFormData(prev => ({ ...prev, name: parsedUser.name || parsedUser.fullName || '' }));
            setIsAuthenticated(true);
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        
        const finalRole = formData.role === 'Others' ? formData.customRole : formData.role;

        if (formData.bio.length < MIN_BIO_LENGTH) {
            setMessage({ type: 'error', text: `Please provide a bio of at least ${MIN_BIO_LENGTH} characters.` });
            setIsSubmitting(false);
            return;
        }

        const payload = {
            email: userEmail,
            name: formData.name,
            role: finalRole,
            price: formData.price,
            location: formData.location,
            experience: formData.experience,
            bio: formData.bio,
            description: formData.description || `Experienced ${finalRole} ready to assist your loved ones.`
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/helpers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    parsedUser.role = 'helper'; 
                    localStorage.setItem('user', JSON.stringify(parsedUser));
                }

                setMessage({ type: 'success', text: "🎉 Application Submitted! Status: Pending Approval. Redirecting..." });
                setTimeout(() => {
                    router.push('/helper-dashboard');
                }, 2000);
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: `Submission Failed: ${error.message || 'Check if your profile already exists in pending status.'}` });
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error. Could not connect to the API." });
            setIsSubmitting(false);
        }
    };
    
    const getMessageClasses = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'error':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'info':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            default:
                return 'hidden';
        }
    };

    if (!isAuthenticated && !isAdmin) return null;

    const isBioInvalid = formData.bio.length < MIN_BIO_LENGTH;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="relative min-h-[40vh] py-16 text-center px-4 overflow-hidden flex items-center">
            <div className="absolute inset-0 z-0">
                <img 
                    src="/hero6.png" 
                    alt="Elderly couple on sofa" 
                    className="w-full h-full object-cover"
                /> 
                <div className="absolute inset-0 bg-gray-900/80"></div>
            </div>
            <div className="max-w-4xl mx-auto relative z-10 text-white">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
                    Turn your Compassion into a Career
                </h1>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                    Join SilverConnect today. Connect with families who need your help, set your own rates, and work on your own schedule.
                </p>
            </div>
            </header>
            
            <div className="container mx-auto px-6 py-12 -mt-10">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    <div className="lg:w-1/3 space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Why Join Us?</h2>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-start gap-4">
                            <div className="bg-green-100 p-3 rounded-full text-2xl">💰</div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Earn What You Deserve</h3>
                                <p className="text-gray-600 text-sm mt-1">Set your own hourly rates and keep 100% of your tips.</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-start gap-4">
                            <div className="bg-gray-100 p-3 rounded-full text-2xl">📅</div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Flexible Schedule</h3>
                                <p className="text-gray-600 text-sm mt-1">Work when you want. You have full control over your availability.</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="font-bold text-gray-800">Caregiver Profile Application</h2>
                                <span className="text-xs font-bold bg-gray-200 text-gray-700 px-3 py-1 rounded-full">Step 1 of 1</span>
                            </div>
                            
                            {message.text && (
                                <div className={`p-4 mx-8 mt-4 rounded-lg border font-medium ${getMessageClasses(message.type)}`}>
                                    {message.text}
                                    {isAdmin && (
                                        <div className="mt-2 text-sm">
                                            <button 
                                                onClick={() => router.push('/admin')}
                                                className="underline hover:no-underline font-bold"
                                            >
                                                Go to Admin Portal
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Only render form if user is NOT admin */}
                            {!isAdmin && (
                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                            <input 
                                                id="name"
                                                name="name" 
                                                value={formData.name}
                                                onChange={handleChange} 
                                                required 
                                                className="w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-lg p-3 outline-none transition shadow-sm cursor-not-allowed" 
                                                placeholder="e.g. Jane Doe" 
                                                disabled 
                                            />
                                            <p className="text-xs text-gray-500 mt-1">This uses the name from your user account.</p>
                                        </div>
                                        <div>
                                            <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">Role / Specialty</label>
                                            <select 
                                                id="role"
                                                name="role" 
                                                value={formData.role}
                                                onChange={handleChange} 
                                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-400 transition shadow-sm"
                                            >
                                                <option>Companion</option>
                                                <option>Medical Assistant</option>
                                                <option>Housekeeping</option>
                                                <option>Driver</option>
                                                <option>Physiotherapy Aid</option>
                                                <option>Live-in Caregiver</option>
                                                <option value="Others">Others (Please Specify)</option> 
                                            </select>
                                        </div>
                                    </div>

                                    {formData.role === 'Others' && (
                                        <div className="animate-fadeIn">
                                            <label htmlFor="customRole" className="block text-sm font-bold text-gray-800 mb-2">Specify Your Role</label>
                                            <input 
                                                id="customRole"
                                                name="customRole" 
                                                value={formData.customRole}
                                                onChange={handleChange} 
                                                required={formData.role === 'Others'}
                                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-400 transition shadow-sm" 
                                                placeholder="e.g. Pet Therapist, Yoga Instructor, Hairdresser..." 
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3 text-gray-500">$</span>
                                                <input 
                                                    id="price"
                                                    name="price" 
                                                    value={formData.price}
                                                    onChange={handleChange} 
                                                    required 
                                                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 pl-8 outline-none focus:ring-2 focus:ring-gray-400 transition shadow-sm" 
                                                    placeholder="25/hr" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">City / Location</label>
                                            <input 
                                                id="location"
                                                name="location" 
                                                value={formData.location}
                                                onChange={handleChange} 
                                                required 
                                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-400 transition shadow-sm" 
                                                placeholder="e.g. Downtown" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="experience" className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                                        <input 
                                            id="experience"
                                            name="experience" 
                                            value={formData.experience}
                                            onChange={handleChange} 
                                            required 
                                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-400 transition shadow-sm" 
                                            placeholder="e.g. 3 Years in Elderly Care" 
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-2">About You (Bio)</label>
                                        <textarea 
                                            id="bio"
                                            name="bio" 
                                            value={formData.bio}
                                            onChange={handleChange} 
                                            required 
                                            rows="4" 
                                            className={`w-full bg-white text-gray-900 border ${isBioInvalid ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 outline-none focus:ring-2 focus:ring-gray-400 transition shadow-sm`}
                                            placeholder="Write a short introduction about yourself. Why do you love caregiving?"
                                        ></textarea>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className={`text-xs ${isBioInvalid ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                                                Minimum required: {MIN_BIO_LENGTH} characters.
                                            </p>
                                            <p className="text-xs text-gray-500 text-right">
                                                {formData.bio.length} / {MIN_BIO_LENGTH}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || isBioInvalid}
                                        className={`w-full text-white font-bold py-4 rounded-lg shadow-lg text-lg transition transform hover:-translate-y-0.5 ${
                                            isSubmitting || isBioInvalid ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black active:bg-gray-700'
                                        }`}
                                    >
                                        {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}