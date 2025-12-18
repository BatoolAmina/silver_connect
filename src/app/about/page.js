'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const useCounter = (target) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        const duration = 1500;
        const steps = 60;
        const stepTime = duration / steps;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(current));
            }
        }, stepTime);
        return () => clearInterval(timer);
    }, [target]);
    return count;
};

export default function AboutPage() {
    const happyFamilies = useCounter(5); 
    const verifiedPros = useCounter(100);

    return (
        <div className="bg-gray-200 min-h-screen font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
            <header className="relative pt-28 pb-40 text-center px-8 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0 opacity-50 grayscale">
                    <img src="/hero2.png" alt="" className="w-full h-full object-cover" /> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0"></div>
                <div className="max-w-[1400px] mx-auto relative z-10 text-white">
                    <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 mb-6 block italic">Corporate Dossier</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-[0.85]">
                        Our <span className="text-slate-700 font-light not-italic">Mission.</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium leading-relaxed italic">
                        Bridging the gap between specialized care protocols and the human need for dignity, love, and professional coordination.
                    </p>
                </div>
            </header>

            <div className="max-w-[1200px] mx-auto px-6 md:px-12 -mt-16 relative z-20">
                <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-12">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="w-full lg:w-1/2">
                            <div className="relative group">
                                <img 
                                    src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=800&auto=format&fit=crop" 
                                    alt="" 
                                    className="rounded-[2rem] shadow-2xl transition-all duration-700 grayscale group-hover:grayscale-0 w-full aspect-[4/3] object-cover"
                                />
                                <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-black/10"></div>
                            </div>
                        </div>
                        
                        <div className="w-full lg:w-1/2 space-y-6">
                            <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Vetted Care,<br/>Optimized.</h2>
                            <p className="text-slate-500 leading-relaxed text-[13px] font-medium">
                                Finding reliable care shouldn't be a logistical burden. We identified a critical system failure where families struggle to locate verified, high-standard specialists available for immediate deployment.
                            </p>
                            <p className="text-slate-500 leading-relaxed text-[13px]">
                                <span className="font-black text-slate-950 italic">SilverConnect</span> was architected as the solution—a high-density registry prioritizing safety, protocol transparency, and technical ease.
                            </p>
                            
                            <div className="flex gap-10 pt-6 border-t border-slate-50">
                                <div>
                                    <span className="block text-3xl font-black text-slate-950 tracking-tighter">
                                        {happyFamilies}k+ 
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Archived Families</span>
                                </div>
                                <div className="w-px bg-slate-100 h-10"></div>
                                <div>
                                    <span className="block text-3xl font-black text-slate-950 tracking-tighter">
                                        {verifiedPros}%
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Verified Personnel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-1 bg-slate-950 rounded-[2.5rem] p-10 text-white flex flex-col items-center justify-center text-center shadow-xl">
                        <div className="w-28 h-28 bg-white/5 rounded-3xl mb-6 flex items-center justify-center border border-white/10">
                            <img 
                                src="BatoolAmina.png" 
                                alt="" 
                                className="w-full h-full object-contain rounded-3xl" 
                            />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Batool Amina</h3>
                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-1">Lead Systems Architect</p>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 flex flex-col justify-center">
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 mb-4 block italic">Executive Statement</span>
                        <p className="text-slate-700 italic text-[18px] font-medium leading-relaxed tracking-tight">
                            "SilverConnect was engineered to prove that high-end technology must serve our most vulnerable populations. Our elders do not just require service; they require a secure, verified connection to community support."
                        </p>
                        <div className="w-8 h-1 bg-slate-950 mt-8 rounded-full"></div>
                    </div>
                </section>

                <section className="bg-white rounded-[3rem] py-16 text-center border border-slate-100 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.02]">
                        <h1 className="text-[12rem] font-black tracking-tighter leading-none">CONNECT</h1>
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-slate-950 mb-6 uppercase tracking-tight italic">Initiate Session Today.</h2>
                        <Link href="/profile">
                            <button className="bg-slate-950 text-white font-black px-10 py-4 rounded-xl hover:bg-black transition-all shadow-2xl uppercase tracking-widest text-[10px] active:scale-95">
                                Create Identity Log
                            </button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}