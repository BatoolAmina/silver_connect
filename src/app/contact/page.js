'use client';

import React, { useState } from 'react';

export default function ContactPage() {
    const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://backend-minor-project.onrender.com';

    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', otherSubject: '', message: ''
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
        const finalSubject = formData.subject === 'Other' ? formData.otherSubject : formData.subject;
        const payload = { ...formData, subject: finalSubject };
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', subject: '', otherSubject: '', message: '' }); 
            } else {
                setError("Failed to send message. Please try again.");
            }
        } catch (err) {
            setError("Server error. Could not connect to the API.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-200 min-h-screen font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
            <header className="relative pt-28 pb-40 text-center px-8 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0 opacity-50 grayscale">
                    <img src="/hero5.png" alt="" className="w-full h-full object-cover" /> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0"></div>
                <div className="max-w-[1400px] mx-auto relative z-10 text-white">
                    <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 mb-6 block italic">Global Communication Hub</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-[0.85]">
                        Get in <span className="text-slate-700 font-light not-italic">Touch.</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium leading-relaxed italic">
                        Bridging care coordination through direct encrypted communication channels.
                    </p>
                </div>
            </header>

            <main className="w-full max-w-[1200px] mx-auto px-6 md:px-12 -mt-16 relative z-20 pb-20">
                <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                    
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-slate-950 p-10 rounded-[2.5rem] shadow-2xl text-white h-full relative overflow-hidden flex flex-col justify-center">
                            <h3 className="text-2xl font-black text-white mb-10 uppercase tracking-tighter italic">Contact Info.</h3>
                            
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-start gap-5">
                                    <div className="text-xl opacity-40">📍</div>
                                    <div>
                                        <h4 className="font-black text-slate-500 uppercase text-[8px] tracking-[0.3em] mb-1">HQ Coordinate</h4>
                                        <p className="text-slate-300 text-[13px] leading-tight font-bold italic">123 Caregiver Lane<br/>Wellness City, WC 45678</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="text-xl opacity-40">📞</div>
                                    <div>
                                        <h4 className="font-black text-slate-500 uppercase text-[8px] tracking-[0.3em] mb-1">Direct Callback</h4>
                                        <p className="text-slate-300 text-[13px] font-bold italic">+1 (555) 123-4567</p>
                                        <p className="text-slate-600 text-[10px] font-black uppercase mt-1">Available 08:00 — 17:00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="text-xl opacity-40">✉️</div>
                                    <div>
                                        <h4 className="font-black text-slate-500 uppercase text-[8px] tracking-[0.3em] mb-1">Verified Node</h4>
                                        <p className="text-slate-300 text-[13px] font-bold italic">support@silverconnect.com</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 h-full">
                            
                            {submitted ? (
                                <div className="text-center py-20 animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full">
                                    <div className="w-20 h-20 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner">✓</div>
                                    <h3 className="text-3xl font-black text-slate-950 mb-4 uppercase tracking-tighter italic">Message Received</h3>
                                    <p className="text-slate-500 text-[13px] max-w-xs mx-auto font-medium leading-relaxed italic">The registry has logged your transmission. Expect a response within 24 operational hours.</p>
                                    <button onClick={() => setSubmitted(false)} className="mt-10 bg-slate-950 text-white font-black px-10 py-3 rounded-xl uppercase tracking-widest text-[9px] active:scale-95 shadow-xl transition-all">New Dispatch</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div className="border-b border-slate-50 mb-5">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] block mb-2 italic">Outbound Link</span>
                                        <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Send a Message.</h2>
                                    </div>
                                    
                                    {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest">{error}</div>}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Identify Sender</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-[14px] font-bold focus:ring-1 focus:ring-slate-950 outline-none transition-all shadow-inner" placeholder="Legal Name" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Return Path</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-[14px] font-bold focus:ring-1 focus:ring-slate-950 outline-none transition-all shadow-inner" placeholder="Verified Email" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Subject Protocol</label>
                                            <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl p-3.5 font-black text-[11px] uppercase tracking-widest text-slate-950 outline-none cursor-pointer shadow-inner appearance-none">
                                                <option value="">Select Topic...</option>
                                                <option value="General Inquiry">General Inquiry</option>
                                                <option value="Booking Support">Booking Support</option>
                                                <option value="Join as Helper">Join as Helper</option>
                                                <option value="Other">Other Category</option>
                                            </select>
                                        </div>

                                        {formData.subject === 'Other' && (
                                            <input type="text" name="otherSubject" value={formData.otherSubject} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-[14px] font-bold focus:ring-1 focus:ring-slate-950 outline-none animate-in slide-in-from-top-2 duration-300" placeholder="Specify Topic" />
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Transmission Content</label>
                                        <textarea name="message" value={formData.message} onChange={handleChange} required rows="3" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-[13px] font-medium italic focus:ring-1 focus:ring-slate-950 outline-none transition-all shadow-inner leading-relaxed" placeholder="Detail your specific inquiry or technical request..."></textarea>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" disabled={isSubmitting} className={`w-full text-white font-black py-5 rounded-[1.5rem] uppercase tracking-[0.4em] text-[10px] shadow-2xl active:scale-[0.98] transition-all ${isSubmitting ? 'bg-slate-400' : 'bg-slate-950 hover:bg-black shadow-slate-200'}`}>
                                            {isSubmitting ? 'Transmitting Data...' : 'Authorize Dispatch'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}