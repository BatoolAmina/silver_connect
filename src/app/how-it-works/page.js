'use client';

import React from 'react';
import Link from 'next/link';

export default function HowItWorks() {
    const steps = [
        {
            id: "01",
            title: "Search for Care",
            description: "Browse our registry of verified specialists. Utilize advanced filters for medical expertise, logistics, and companionship to find a precise match.",
            icon: "🔍"
        },
        {
            id: "02",
            title: "Audit Profiles",
            description: "Review comprehensive documentation, historical experience, and peer-verified feedback. We maintain total transparency in provider history.",
            icon: "📄"
        },
        {
            id: "03",
            title: "Authorize Booking",
            description: "Select a schedule that aligns with your requirements. Submit a secure request directly through our encrypted coordination platform.",
            icon: "📅"
        },
        {
            id: "04",
            title: "Execute Care Plan",
            description: "Your specialist arrives as scheduled to provide high-standard assistance. Monitor all active sessions through your Command Center.",
            icon: "🏁"
        }
    ];

    return (
        <div className="bg-gray-200 min-h-screen font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
            <header className="relative pt-24 pb-32 text-center px-8 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0 opacity-50 grayscale">
                    <img src="/hero4.png" alt="" className="w-full h-full object-cover" /> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0"></div>
                <div className="max-w-[1400px] mx-auto relative z-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4 block">Operational Protocol</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
                        The Workflow.
                    </h1>
                    <p className="text-lg opacity-70 max-w-xl mx-auto font-medium leading-relaxed uppercase tracking-widest text-sm">
                        Establishing a secure bridge between specialized care and those requiring assistance.
                    </p>
                </div>
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/5 rounded-full"></div>
            </header>
            
            <main className="container mx-auto px-6 py-24 max-w-4xl">
                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                            
                            <div className="flex-shrink-0 relative">
                                <div className="w-15 h-15 bg-white border-2 border-gray-100 rounded-[2rem] flex flex-col items-center justify-center shadow-xl z-10 relative group hover:bg-slate-900 transition-all duration-500">
                                    <span className="text-[10px] font-black text-gray-300 group-hover:text-gray-500 transition-colors mb-1">{step.id}</span>
                                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{step.icon}</span>
                                </div>
                                {index !== steps.length - 1 && (
                                    <div className="hidden md:block absolute top-24 left-1/2 w-px h-32 bg-gray-200 -translate-x-1/2"></div>
                                )}
                            </div>

                            <div className="flex-grow bg-white p-10 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-px w-8 bg-slate-900 group-hover:w-16 transition-all duration-500"></div>
                                    <h3 className="text-md font-black text-slate-900 uppercase italic tracking-tighter">
                                        {step.title}
                                    </h3>
                                </div>
                                <p className="text-slate-500 leading-relaxed font-medium text-sm">
                                    {step.description}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>

                <div className="mt-32 bg-slate-900 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-2xl font-black text-white mb-6 uppercase italic tracking-tighter">Initiate Engagement</h2>
                        <p className="text-gray-400 mb-12 font-medium uppercase tracking-[0.2em] text-xs">Join the verified SilverConnect registry today.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link href="/helper">
                                <button className="bg-white text-slate-900 font-black px-10 py-5 rounded-2xl hover:bg-gray-100 transition shadow-xl uppercase tracking-widest text-xs active:scale-95">
                                    Browse Registry
                                </button>
                            </Link>
                            <Link href="/join">
                                <button className="bg-transparent text-white border-2 border-white/20 font-black px-10 py-5 rounded-2xl hover:bg-white/10 transition uppercase tracking-widest text-xs active:scale-95">
                                    Join Team
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full bg-slate-200"></div>
                        <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full bg-slate-200"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}