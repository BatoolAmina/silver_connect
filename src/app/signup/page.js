'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://backend-minor-project.onrender.com';

export default function SignupPage() {
    const router = useRouter();
    
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
                setMessage({ type: 'success', text: "✓ ACCOUNT AUTHORIZED. REDIRECTING..." });
                setTimeout(() => router.push('/login'), 2000); 
            } else {
                setMessage({ type: 'error', text: data.message || "REGISTRATION DENIED." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "CONNECTION INTERRUPTED." });
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
                setMessage({ type: 'success', text: `WELCOME, ${data.user.fullName.toUpperCase()}` });
                window.location.href = '/'; 
            }
        } catch (err) {
            setMessage({ type: 'error', text: "GOOGLE AUTH SYNCHRONIZATION FAILED." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans text-slate-900">
            {/* --- LEFT BRAND PANEL --- */}
            <div className="hidden md:flex w-1/2 bg-slate-900 justify-center items-center relative overflow-hidden">
                <div className="z-10 text-center px-16">
                    <h2 className="text-6xl font-black text-white mb-6 tracking-tighter italic uppercase">
                        Silver<span className="text-gray-500 font-light">Connect</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-sm mx-auto font-medium leading-relaxed">
                        Establishing the primary bridge between verified care specialists and those in need of support.
                    </p>
                </div>
                {/* Visual architectural elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-white rounded-full"></div>
                </div>
            </div>

            {/* --- RIGHT FORM PANEL --- */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white lg:p-24">
                <div className="w-full max-w-md">
                    <header className="mb-10">
                        <Link href="/" className="text-slate-900 font-black text-[10px] uppercase tracking-[0.4em] mb-8 inline-block hover:underline underline-offset-4 transition-all">
                            ← Return Home
                        </Link>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Join Registry</h1>
                        <p className="text-gray-400 mt-2 font-bold text-xs uppercase tracking-widest">Establish your unique identifier.</p>
                    </header>

                    {message.text && (
                        <div className={`p-5 mb-8 rounded-2xl border font-black text-[10px] tracking-[0.2em] uppercase ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="w-full mb-10 grayscale hover:grayscale-0 transition-all duration-500">
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={() => setMessage({ type: 'error', text: 'GOOGLE AUTH FAIL.' })}
                            shape="pill"
                            theme="outline"
                            text="signup_with"
                            width="100%"
                        />
                    </div>

                    <div className="relative mb-10">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                            <span className="px-4 bg-white">Internal Database Entry</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                            <input type="text" name="fullName" placeholder="Entry required" className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition font-bold" value={formData.fullName} onChange={handleChange} required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Email</label>
                            <input type="email" name="email" placeholder="name@domain.com" className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition font-bold" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Key</label>
                            <input type="password" name="password" placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition font-bold" value={formData.password} onChange={handleChange} required />
                        </div>

                        <div className="pt-2">
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Role Classification</label>
                            <div className="flex gap-4">
                                {['user', 'helper'].map((r) => (
                                    <label key={r} className={`flex-1 border-2 rounded-[1.5rem] p-5 cursor-pointer text-center transition-all active:scale-[0.97] ${
                                        formData.role === r ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                                    }`}>
                                        <input type="radio" name="role" value={r} checked={formData.role === r} onChange={handleChange} className="hidden" />
                                        <span className="font-black text-[10px] uppercase tracking-widest">{r === 'user' ? 'Find Care' : 'Offer Care'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full text-white font-black py-6 rounded-[2rem] transition-all uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-[0.98] ${
                                isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-black shadow-slate-100'
                            }`}
                        >
                            {isSubmitting ? 'Processing Entry...' : 'Finalize Registration'}
                        </button>
                    </form>

                    <footer className="mt-12 text-center">
                        <p className="text-gray-400 text-[11px] font-medium tracking-tight">
                            Identity verified elsewhere? <Link href="/login" className="text-slate-900 font-black hover:underline underline-offset-4">Authenticate Here</Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}