'use client';

import React from 'react';
import Link from 'next/link';

export default function ServicesPage() {
    const services = [
        {
            id: "01",
            title: "Medical Assistance",
            icon: "🩺",
            description: "Certified specialists (RN/LPN) overseeing clinical protocols, medication management, and specialized post-operative recovery.",
            price: "From $25/hr"
        },
        {
            id: "02",
            title: "Companionship",
            icon: "🤝",
            description: "Dedicated caregivers focused on social engagement, cognitive stimulation, and accompaniment for recreational outings.",
            price: "From $18/hr"
        },
        {
            id: "03",
            title: "Logistics & Nutrition",
            icon: "🧹",
            description: "Comprehensive home management including dietary-specific meal preparation and light environmental maintenance.",
            price: "From $22/hr"
        },
        {
            id: "04",
            title: "Transit & Errands",
            icon: "🚗",
            description: "Authorized transportation for clinical appointments, essential shopping, and logistical coordination.",
            price: "From $20/hr"
        },
        {
            id: "05",
            title: "24/7 Residential Care",
            icon: "🏠",
            description: "Round-the-clock specialized supervision and assistance with daily living for comprehensive security.",
            price: "From $180/day"
        },
        {
            id: "06",
            title: "Digital Integration",
            icon: "📱",
            description: "Technical support focused on senior connectivity, facilitating digital communication and smart-home management.",
            price: "From $15/hr"
        }
    ];

    return (
        <div className="bg-gray-200 min-h-screen font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
            <header className="relative pt-28 pb-40 text-center px-8 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0 opacity-50 grayscale">
                    <img src="/hero3.png" alt="" className="w-full h-full object-cover" /> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0"></div>
                <div className="max-w-[1400px] mx-auto relative z-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4 block">Service Catalog</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
                        Care <span className="text-gray-500 font-light italic">Solutions.</span>
                    </h1>
                    <p className="text-lg opacity-70 max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-widest text-xs">
                        Advanced support structures designed for specialized requirements.
                    </p>
                </div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full"></div>
            </header>

            <main className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
                        
                        <div className="flex flex-col items-center mb-8 relative">
                            <span className="absolute top-0 right-0 text-[10px] font-black text-gray-200 group-hover:text-slate-900 transition-colors duration-500 uppercase tracking-widest">
                            Ref. {service.id}
                            </span>
                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:bg-slate-50 group-hover:scale-110">
                            {service.icon}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">
                            {service.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed mb-10 text-sm font-medium px-2">
                            {service.description}
                            </p>
                        </div>
                        <div className="border-t border-gray-50 pt-6 flex justify-between items-center">
                            <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Standard Rate</span>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{service.price}</span>
                            </div>
                            <Link href="/helper">
                            <button className="text-[9px] font-black text-gray-400 hover:text-slate-950 uppercase tracking-[0.2em] transition-all border-b border-transparent hover:border-slate-950 pb-1">
                                Deploy Specialist →
                            </button>
                            </Link>
                        </div>
                        </div>
                    ))}
                    </div>

                <section className="mt-32 bg-white rounded-[4rem] p-12 md:p-20 flex flex-col lg:flex-row items-center gap-16 border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="lg:w-1/2 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4 block">Security Protocol</span>
                        <h2 className="text-4xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter leading-none">Safety as a Standard.</h2>
                        <p className="text-slate-500 mb-10 leading-relaxed font-medium uppercase tracking-wider text-xs">
                            Every specialist within the registry undergoes a multi-layered verification process to ensure absolute operational integrity.
                        </p>
                        <ul className="space-y-4">
                            {['Vetted Background History', 'Identity Authentication', 'Certification Audit'].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px]">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:w-1/2 text-center relative z-10">
                        <div className="bg-gray-50 p-12 rounded-[3.5rem] shadow-inner max-w-sm mx-auto border border-gray-100 group hover:bg-slate-900 transition-all duration-700">
                            <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700">🛡️</div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-white uppercase italic tracking-tighter transition-colors">100% Verified</h3>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Registry Integrity Assured</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32"></div>
                </section>

                <div className="text-center mt-32">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-8">Requirement Specification</h2>
                    <Link href="/contact">
                        <button className="bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-200 uppercase tracking-[0.3em] text-[10px] active:scale-95">
                            Contact Us
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}