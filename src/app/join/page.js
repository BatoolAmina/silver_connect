'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
    const router = useRouter();
    const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://backend-minor-project.onrender.com';
    
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

            // 1. ADMIN CHECK: Administrators should not apply as helpers
            if (parsedUser.role === 'admin') {
                setIsAdmin(true);
                setMessage({ 
                    type: 'info', 
                    text: "ADMINISTRATIVE RESTRICTION: System administrators cannot register as helpers." 
                });
                return; 
            }

            // 2. HELPER CHECK: Redirect existing helpers immediately to their dashboard
            if (parsedUser.role === 'helper') {
                router.push('/helper-dashboard');
                return; 
            }

            // 3. AUTHORIZED CLIENT CHECK: Standard users can proceed to the form
            setUserEmail(parsedUser.email);
            setFormData(prev => ({ ...prev, name: parsedUser.name || parsedUser.fullName || '' }));
            setIsAuthenticated(true);
        } else {
            // Unauthenticated users go to login
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
        
        const finalRole = formData.role === 'Others' ? formData.customRole : formData.role;

        if (formData.bio.length < MIN_BIO_LENGTH) {
            setMessage({ type: 'error', text: `REQUIREMENT FAIL: BIO MUST EXCEED ${MIN_BIO_LENGTH} CHARACTERS.` });
            setIsSubmitting(false);
            return;
        }

        const payload = {
            email: userEmail,
            name: formData.name,
            role: finalRole,
            price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
            location: formData.location,
            experience: formData.experience,
            bio: formData.bio,
            description: formData.description || `Verified ${finalRole} listed in the SilverConnect registry.`
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/helpers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                storedUser.role = 'helper'; 
                localStorage.setItem('user', JSON.stringify(storedUser));
                
                window.dispatchEvent(new Event('userUpdated'));

                setMessage({ type: 'success', text: "✓ CREDENTIALS SUBMITTED. REDIRECTING TO DASHBOARD..." });
                setTimeout(() => router.push('/helper-dashboard'), 2000);
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: `SUBMISSION DENIED: ${error.message || 'Duplicate entry.'}` });
                setIsSubmitting(false);
            }
        } catch (err) {
            setMessage({ type: 'error', text: "TRANSMISSION ERROR: CONNECTION REFUSED." });
            setIsSubmitting(false);
        }
    };
    
    const getMessageClasses = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 text-green-700 border-green-100';
            case 'error': return 'bg-red-50 text-red-700 border-red-100';
            case 'info': return 'bg-slate-900 text-white border-slate-800';
            default: return 'hidden';
        }
    };

    // Show a clean loader while checking roles to prevent "UI flashing"
    if (!isAuthenticated && !isAdmin) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-black tracking-widest text-[10px] uppercase">Verifying Authorization...</p>
        </div>
    );

    const isBioInvalid = formData.bio.length < MIN_BIO_LENGTH;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-24">
            <header className="relative min-h-[45vh] py-20 text-center px-6 overflow-hidden flex items-center bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img src="/hero6.png" alt="" className="w-full h-full object-cover opacity-20 grayscale" /> 
                </div>
                <div className="max-w-4xl mx-auto relative z-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 block">Career Registration</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase italic leading-none">
                        Registry <span className="text-gray-500 font-light italic">Enlistment.</span>
                    </h1>
                </div>
            </header>
            
            <div className="container mx-auto px-6 -mt-16 relative z-20">
                <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
                    
                    <div className="lg:w-1/3 space-y-8">
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] border-b-2 border-slate-900 pb-4">Specialist Benefits</h2>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:bg-slate-900 transition-all duration-500">
                            <div className="text-3xl mb-4 grayscale group-hover:grayscale-0">💰</div>
                            <h3 className="font-black text-slate-900 group-hover:text-white uppercase tracking-tighter text-xl italic">Revenue Autonomy</h3>
                            <p className="text-gray-500 group-hover:text-gray-400 text-sm mt-2">Retain 100% of all designated earnings.</p>
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-10 py-6 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-900 italic">Specialist Credentials Form</h2>
                                <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase">Phase 01</span>
                            </div>
                            
                            {message.text && (
                                <div className={`p-6 mx-10 mt-8 rounded-2xl border font-black text-[10px] tracking-[0.1em] uppercase ${getMessageClasses(message.type)}`}>
                                    {message.text}
                                    {isAdmin && (
                                        <button onClick={() => router.push('/admin')} className="block mt-4 text-white underline underline-offset-4 font-black">Access Terminal</button>
                                    )}
                                </div>
                            )}

                            {/* Render the form ONLY if the user is a standard client */}
                            {!isAdmin && isAuthenticated && (
                                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Identity</label>
                                            <input type="text" value={formData.name} disabled className="w-full bg-gray-50 text-slate-400 border-2 border-gray-50 rounded-2xl p-5 font-black uppercase text-xs shadow-inner cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialty Classification</label>
                                            <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white text-slate-900 border-2 border-gray-50 rounded-2xl p-5 font-black uppercase text-xs focus:border-slate-900 outline-none">
                                                <option>Companion</option>
                                                <option>Medical Assistant</option>
                                                <option value="Others">Custom Role</option> 
                                            </select>
                                        </div>
                                    </div>

                                    {formData.role === 'Others' && (
                                        <input type="text" name="customRole" value={formData.customRole} onChange={handleChange} required className="w-full bg-white text-slate-900 border-2 border-gray-50 rounded-2xl p-5 font-black uppercase text-xs" placeholder="Define Custom Role" />
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <input type="text" name="price" value={formData.price} onChange={handleChange} required className="w-full border-2 border-gray-50 rounded-2xl p-5 font-black text-xs" placeholder="Hourly Rate (e.g. 25)" />
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full border-2 border-gray-50 rounded-2xl p-5 font-black text-xs" placeholder="City / Region" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Statement (Bio)</label>
                                        <textarea name="bio" value={formData.bio} onChange={handleChange} required rows="5" className={`w-full bg-gray-50 border-2 ${isBioInvalid ? 'border-red-100' : 'border-gray-50'} rounded-3xl p-6 font-medium text-slate-700 italic focus:bg-white outline-none shadow-inner`} placeholder="Describe your experience..."></textarea>
                                        <p className={`text-[9px] font-black uppercase ${isBioInvalid ? 'text-red-500' : 'text-gray-400'}`}>Character Count: {formData.bio.length} / {MIN_BIO_LENGTH}</p>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || isBioInvalid}
                                        className={`w-full text-white font-black py-6 rounded-[2rem] shadow-2xl uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 ${
                                            isSubmitting || isBioInvalid ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-black'
                                        }`}
                                    >
                                        {isSubmitting ? 'Synchronizing Registry...' : 'Commit Credentials'}
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