'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            category: "General",
            questions: [
                {
                    q: "What is SilverConnect?",
                    a: "SilverConnect is a trusted platform that connects elderly individuals and their families with verified caregivers, companions, and medical assistants for home care."
                },
                {
                    q: "Is SilverConnect free to use?",
                    a: "It is free to browse profiles and post jobs. We charge a small service fee only when you successfully book a helper."
                }
            ]
        },
        {
            category: "Safety & Trust",
            questions: [
                {
                    q: "Are the helpers verified?",
                    a: "Yes. Every helper undergoes a mandatory background check, identity verification, and qualification review before their profile goes live."
                },
                {
                    q: "What if I am not satisfied with the helper?",
                    a: "Your satisfaction is our priority. If you are unhappy, please contact support immediately. We will help you find a replacement or process a refund according to our policy."
                }
            ]
        },
        {
            category: "Bookings & Payments",
            questions: [
                {
                    q: "How do I pay the helper?",
                    a: "All payments are processed securely through our platform. You can pay via credit card or bank transfer after the service is completed."
                },
                {
                    q: "Can I cancel a booking?",
                    a: "Yes. You can cancel up to 24 hours before the scheduled time for a full refund. Cancellations made within 24 hours may be subject to a fee."
                }
            ]
        }
    ];

    return (
        <div className="bg-gray-200 min-h-screen font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
            <header className="relative pt-28 pb-40 text-center px-8 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0 opacity-50 grayscale">
                    <img src="/hero5.png" alt="" className="w-full h-full object-cover" /> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0"></div>
                <div className="max-w-[1400px] mx-auto relative z-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4 block">Help Center</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter italic">
                        Common <span className="text-gray-400 font-light">Questions</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
                        Find answers to the most common questions about our platform and services.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-24 max-w-4xl">
                {faqs.map((section, sIndex) => (
                    <div key={sIndex} className="mb-10">
                        <div className="flex items-center gap-4 mb-5">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">
                                {section.category}
                            </h2>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        
                        <div className="space-y-4">
                            {section.questions.map((item, qIndex) => {
                                const uniqueIndex = `${sIndex}-${qIndex}`;
                                const isOpen = openIndex === uniqueIndex;

                                return (
                                    <div 
                                        key={qIndex} 
                                        className={`bg-white rounded-[2rem] transition-all duration-300 border ${
                                            isOpen ? 'border-slate-900 shadow-xl scale-[1.01]' : 'border-gray-100 shadow-sm'
                                        }`}
                                    >
                                        <button 
                                            onClick={() => toggleFAQ(uniqueIndex)}
                                            aria-expanded={isOpen}
                                            className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                                        >
                                            <span className={`font-bold text-md tracking-tight transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {item.q}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isOpen ? 'bg-slate-900 text-white rotate-180' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                <span className="text-lg leading-none">⌄</span>
                                            </div>
                                        </button>
                                        
                                        <div 
                                            className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <div className="p-6 pt-0 text-slate-600 leading-relaxed font-medium text-base italic border-t border-gray-50">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <section className="bg-slate-950 rounded-[2.5rem] py-12 text-center border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.1]">
                        <h1 className="text-[5rem] md:text-[11rem] font-black text-white tracking-tighter leading-none italic">
                            CONTACT
                        </h1>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-4">   
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                                Initiate Session Today.
                            </h2>
                        </div>
                        
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-8 max-w-xs mx-auto opacity-70">
                            Can't find what you're looking for? Our support team is ready to assist you individually.
                        </p>

                        <Link href="/contact">
                            <button className="bg-white text-slate-950 font-black px-10 py-4 rounded-xl hover:bg-slate-200 transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95">
                                Contact Support
                            </button>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}