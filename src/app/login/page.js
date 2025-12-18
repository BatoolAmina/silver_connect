'use client'; 

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState({ type: '', text: '' }); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_BASE_URL = 'https://backend-minor-project.onrender.com'; 

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setMessage({ type: 'success', text: "Login successful! Redirecting..." });
                setTimeout(() => window.location.href = '/', 1000); 
            } else {
                setMessage({ type: 'error', text: data.message || "Login failed. Check your credentials." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server connection failed. Try again later." });
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
                setMessage({ type: 'success', text: `Welcome, ${data.user.fullName || data.user.name}!` });
                window.location.href = '/'; 
            } else {
                setMessage({ type: 'error', text: "Google Sync Failed: " + data.message });
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            setMessage({ type: 'error', text: "Server connection error during Google login." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMessageClasses = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 text-green-700 border-green-100';
            case 'error':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'hidden';
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* --- LEFT SIDE: THEME NAVY PANEL --- */}
            <div className="hidden md:flex w-1/2 bg-slate-900 justify-center items-center relative overflow-hidden">
                <div className="z-10 text-center px-12">
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tighter italic">
                        Silver<span className="text-gray-400 font-light">Connect</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                        "Caring for our elders is the greatest responsibility and privilege."
                    </p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 border border-white rounded-full"></div>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <Link href="/" className="text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] mb-6 inline-block hover:underline">
                            ← Home
                        </Link>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sign In</h2>
                        <p className="text-gray-500 mt-2 font-medium">Access your administrative or user portal.</p>
                    </div>
                    
                    {message.text && (
                        <div className={`p-4 mb-8 rounded-2xl border text-xs font-black uppercase tracking-widest ${getMessageClasses(message.type)}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="w-full mb-8">
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={() => setMessage({ type: 'error', text: 'Authentication failed.' })}
                            shape="pill"
                            theme="outline"
                            size="large"
                            width="100%"
                        />
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <span className="px-4 bg-white">Internal Credentials</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all" 
                                placeholder="name@domain.com"
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Security Token</label>
                            <input 
                                type="password" 
                                name="password" 
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all" 
                                placeholder="••••••••"
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full text-white font-black py-5 rounded-[1.5rem] transition-all uppercase tracking-[0.2em] text-xs shadow-xl active:scale-[0.98] ${
                                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black'
                            }`}
                        >
                            {isSubmitting ? 'Verifying...' : 'Authorize Login'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-gray-400 text-sm font-medium">
                        New to the platform? <Link href="/signup" className="text-slate-900 font-black hover:underline underline-offset-4">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}