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
                setMessage({ type: 'error', text: data.message || "Login failed. Check your email and password." });
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
                setMessage({ type: 'error', text: "Google Login Sync Failed: " + data.message });
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            setMessage({ type: 'error', text: "Failed to connect to server during Google login." });
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
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-gray-900 to-gray-500 justify-center items-center relative overflow-hidden">
                <div className="z-10 text-center px-10">
                    <h2 className="text-4xl font-extrabold text-white mb-4">Welcome Back!</h2>
                    <p className="text-gray-100 text-lg">&quot;Caring for our elders is the greatest responsibility and privilege.&quot;</p>
                </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center md:text-left">
                        <Link href="/" className="text-gray-900 font-bold text-sm mb-4 inline-block hover:underline">← Back to Home</Link>
                        <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
                        <p className="text-gray-500 mt-2">Enter your credentials to access your account.</p>
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
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with email</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" name="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 outline-none transition" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" name="password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 outline-none transition" value={formData.password} onChange={handleChange} required />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full text-white font-bold py-3 rounded-lg transition duration-300 shadow-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600">
                        Don&apos;t have an account? <Link href="/signup" className="text-gray-900 font-bold hover:underline">Create one here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}