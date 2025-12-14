'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export default function SignupPage() {
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [message, setMessage] = useState({ type: '', text: '' }); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: "🎉 Account Created Successfully! Redirecting to login..." });
                setTimeout(() => router.push('/login'), 2000); 
            } else {
                setMessage({ type: 'error', text: data.message || "Registration failed. Try a different email." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error. Could not connect to the API." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        try {
            const decoded = jwtDecode(credentialResponse.credential);
            
            const res = await fetch(`${API_BASE_URL}/api/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: decoded.name,
                    email: decoded.email,
                    image: decoded.picture
                })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setMessage({ type: 'success', text: `Welcome, ${data.user.fullName || data.user.name}! Redirecting...` });
                window.location.href = '/'; 
            } else {
                setMessage({ type: 'error', text: "Google Sign-Up Failed: " + data.message });
            }
        } catch (err) {
            console.error("Google Error:", err);
            setMessage({ type: 'error', text: "An error occurred during Google sign-up." });
        } finally {
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

    return (
        <div className="min-h-screen flex bg-gray-100 font-sans">
            
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
                
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center md:text-left">
                        <Link href="/" className="text-gray-900 font-bold text-sm mb-4 inline-block hover:underline">
                            ← Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                        <p className="text-gray-500 mt-2">Join us to find care or offer help.</p>
                    </div>

                    {message.text && (
                        <div className={`p-4 mb-6 rounded-lg border font-medium ${getMessageClasses(message.type)}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="w-full mb-6">
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={() => setMessage({ type: 'error', text: 'Google Login failed. Check console.' })}
                            containerProps={{ style: { width: '100%', display: 'flex', justifyContent: 'center' } }}
                            shape="pill"
                            size="large"
                        />
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                name="fullName"
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-400 outline-none transition"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-400 outline-none transition"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="Create a strong password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-400 outline-none transition"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I want to...</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition ${formData.role === 'user' ? 'border-gray-900 bg-gray-100 text-gray-900' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}>
                                    <input 
                                        type="radio" 
                                        name="role" 
                                        value="user" 
                                        checked={formData.role === 'user'} 
                                        onChange={handleChange}
                                        className="hidden" 
                                    />
                                    <span className="font-bold">Find Help</span>
                                </label>
                                <label className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition ${formData.role === 'helper' ? 'border-gray-900 bg-gray-100 text-gray-900' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}>
                                    <input 
                                        type="radio" 
                                        name="role" 
                                        value="helper" 
                                        checked={formData.role === 'helper'} 
                                        onChange={handleChange}
                                        className="hidden" 
                                    />
                                    <span className="font-bold">Offer Help</span>
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full text-white font-bold py-3 rounded-lg transition duration-300 shadow-md mt-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-gray-900 font-bold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>

            <div className="hidden md:flex w-1/2 bg-gray-900 justify-center items-center relative overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1000&auto=format&fit=crop" 
                    alt="Elderly Care" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                
                <div className="z-10 text-center px-10 relative">
                  <h2 className="text-4xl font-extrabold text-white mb-4">Join Our Community</h2>
                  <p className="text-gray-300 text-lg max-w-md mx-auto">
                    Connect with thousands of trusted families and caregivers today.
                  </p>
                </div>
            </div>

        </div>
    );
}