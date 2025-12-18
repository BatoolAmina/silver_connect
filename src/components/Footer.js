'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const [user, setUser] = useState(null);

    const loadUser = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();
        window.addEventListener('userUpdated', loadUser);
        window.addEventListener('storage', loadUser);
        return () => {
            window.removeEventListener('userUpdated', loadUser);
            window.removeEventListener('storage', loadUser);
        };
    }, []);

    return (
        <footer className="relative bg-slate-950 text-gray-400 py-5 border-t border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="max-w-[1800px] mx-auto px-8 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 pb-8 border-b border-white/5 gap-6">
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-3 group">
                            <div className="w-30 h-30 flex items-center justify-center overflow-hidden transition-all group-hover:rotate-12 group-hover:scale-110">
                                <Image 
                                    src="/logo-white.png" 
                                    alt="SC" 
                                    width={120} 
                                    height={120} 
                                    className="object-contain p-1"
                                />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">
                                Silver<span className="text-gray-600 font-light">Connect</span>
                            </span>
                        </Link>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] ml-33 -mt-10 leading-tight max-w-sm opacity-50">
                            High-standard geriatric coordination registry.
                        </p>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none">Interface</span>
                            <span className="text-[9px] font-black text-white uppercase tracking-widest mt-1">
                                {user ? `${user.role} Override` : 'Guest Access'}
                            </span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-2.5">
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] mb-1">Network</span>
                        <Link href="/" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Home</Link>
                        <Link href="/about" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">About</Link>
                        <Link href="/helper" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Registry</Link>
                    </div>
                    
                    <div className="flex flex-col gap-2.5">
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] mb-1">Support</span>
                        <Link href="/faq" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">FAQ</Link>
                        <Link href="/contact" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Contact</Link>
                        <Link href="/how-it-works" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Workflow</Link>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] mb-1">Terminal</span>
                        {!user ? (
                            <>
                                <Link href="/login" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Authorization</Link>
                                <Link href="/signup" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Enlistment</Link>
                            </>
                        ) : (
                            <>
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors italic">Admin Console</Link>
                                )}
                                {user.role === 'helper' && (
                                    <Link href="/helper-dashboard" className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors italic">Specialist Suite</Link>
                                )}
                                {user.role === 'user' && (
                                    <Link href="/dashboard" className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors italic">Client Center</Link>
                                )}
                                <Link href="/profile" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Profile Logs</Link>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] mb-1">Legal Protocols</span>
                        <Link href="/privacy" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Terms</Link>
                        <Link href="/legal" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Legal</Link>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-12 pt-8 flex flex-col items-center justify-center mx-auto w-full">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] text-center">
                            &copy; 2025 SILVERCONNECT CORE.
                        </p>
                        <span className="hidden md:block text-gray-800 opacity-30">|</span>
                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.2em] text-center">
                            PROTECTED BY CLOUDFLARE SECURE.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}