'use client'; 

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://backend-minor-project.onrender.com';

export default function Home() {
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [error, setError] = useState(null);
    
    const [user, setUser] = useState(null);
    const [isHelper, setIsHelper] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            if (parsedUser.role === 'admin') {
                setIsAdmin(true);
            } else if (parsedUser.role === 'helper') {
                setIsHelper(true);
                fetch(`${API_BASE_URL}/api/helper-profile/${parsedUser.email}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'Pending') setIsPending(true);
                    })
                    .catch(err => console.error("Helper status check failed:", err));
            }
        }

        fetch(`${API_BASE_URL}/api/helpers`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch approved helpers.");
                return res.json();
            })
            .then(data => { 
                setHelpers(data); 
                setLoading(false); 
            })
            .catch(err => { 
                setError("Could not connect to the helper service API.");
                setLoading(false); 
            });
    }, []);

    const categories = [
        "All", 
        "Medical Assistant", 
        "Companion", 
        "Housekeeping", 
        "Driver",
        "Physiotherapy Aid",
        "Live-in Caregiver"
    ];

    const filteredHelpers = helpers.filter((helper) => {
        const helperRole = helper.role ? helper.role.toString() : '';
        const term = searchTerm.toLowerCase();
        const matchesCategory = selectedCategory === "All" || helperRole === selectedCategory;
        const matchesSearch = helper.name.toLowerCase().includes(term) ||
                              helperRole.toLowerCase().includes(term) ||
                              (helper.location && helper.location.toLowerCase().includes(term));
                              
        return matchesCategory && matchesSearch;
    });

    const renderHeroActions = () => {
        if (!user) {
            return (
                <Link href="/signup">
                    <button className="bg-white/10 border-2 border-white/20 text-white font-black px-10 py-4 rounded-2xl hover:bg-white hover:text-slate-900 transition-all backdrop-blur-md uppercase tracking-[0.2em] text-[10px]">
                        Initialize Membership
                    </button>
                </Link>
            );
        }

        if (isAdmin) {
            return (
                <Link href="/admin">
                    <button className="bg-white/10 border-2 border-white/20 text-white font-black px-10 py-4 rounded-2xl hover:bg-white hover:text-slate-900 transition-all backdrop-blur-md uppercase tracking-[0.2em] text-[10px]">
                        Access Admin Override
                    </button>
                </Link>
            );
        }

        if (isPending) {
            return (
                <div className="bg-white/10 border-2 border-white/20 text-white font-black px-10 py-4 rounded-2xl hover:bg-white hover:text-slate-900 transition-all backdrop-blur-md uppercase tracking-[0.2em] text-[10px]">
                    Dossier Under Review
                </div>
            );
        }

        if (isHelper) {
             return (
                <Link href="/helper-dashboard">
                    <button className="bg-white/10 border-2 border-white/20 text-white font-black px-10 py-4 rounded-2xl hover:bg-white hover:text-slate-900 transition-all backdrop-blur-md uppercase tracking-[0.2em] text-[10px]">
                        Specialist Terminal
                    </button>
                </Link>
            );
        }

        return (
            <Link href="/join">
                <button className="bg-white/10 border-2 border-white/20 text-white font-black px-10 py-4 rounded-2xl hover:bg-white hover:text-slate-900 transition-all backdrop-blur-md uppercase tracking-[0.2em] text-[10px]">
                    Enlist as Specialist
                </button>
            </Link>
        );
    };

    return (
        <div className="bg-gray-200 min-h-screen font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
            <header className="relative pt-28 pb-40 text-center px-8 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0 opacity-50 grayscale">
                    <img src="/hero.png" alt="" className="w-full h-full object-cover" /> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0"></div>
                <div className="max-w-[1400px] mx-auto relative z-10 text-white"> 
                    <span className="text-gray-400 text-[12px] font-black px-4 py-1 rounded-full uppercase tracking-[0.4em] border border-white/10 inline-block mb-6">
                        {isAdmin ? "ADMINISTRATIVE PROTOCOL ACTIVE" : "OPERATIONAL EXCELLENCE IN CARE"}
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase italic leading-tight">
                        Verified <span className="text-gray-500 font-light italic">Support.</span>
                    </h2>
                    
                    <div className="relative max-w-xl mx-auto mt-10">
                        <input 
                            type="text" 
                            placeholder="Identify Specialist or expertise..." 
                            className="w-full py-4 px-8 rounded-2xl text-slate-900 bg-white shadow-2xl focus:ring-2 focus:ring-slate-400 outline-none text-[15px] font-bold italic placeholder-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div> 
                    
                    <div className="flex justify-center gap-4 mt-10">
                        {renderHeroActions()}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 -mt-32 relative z-20 mb-20">
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map((cat) => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all duration-300 ${
                                selectedCategory === cat 
                                ? 'bg-slate-800 text-white scale-105' 
                                : 'bg-white text-gray-900 hover:text-slate-900'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-32">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-slate-900 border-t-transparent"></div>
                        <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Registry...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-25 px-4">
                            <div className="flex items-center gap-4">
                                <div className="h-px w-8 bg-slate-900"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                                    {isAdmin ? "Audit Mode Active" : `Registry: ${filteredHelpers.length} Logged Entries`}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15">
                            {filteredHelpers.length > 0 ? (
                                filteredHelpers.map((helper) => (
                                <div key={helper._id} className="group bg-white rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col transform hover:-translate-y-2">
                                    <div className="h-24 bg-gray-50 relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100"></div>
                                        <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-slate-900 uppercase tracking-widest shadow-sm flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            Verified
                                        </div>
                                        
                                        <img 
                                            src={helper.image || `https://i.pravatar.cc/150?u=${helper.email}`} 
                                            alt="" 
                                            className="w-32 h-32 rounded-[2.5rem] border-4 border-white absolute top-8 left-1/2 transform -translate-x-1/2 object-cover shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700 bg-white"
                                        />
                                    </div>
                                    
                                    <div className="pt-20 pb-10 px-10 text-center flex-grow">
                                        <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter transition-all">{helper.name}</h4>
                                        <p className="text-gray-400 font-black text-[9px] uppercase tracking-[0.3em] mt-2 mb-4">{helper.role}</p>
                                        
                                        <div className="flex justify-center items-center gap-2 mb-6">
                                            <div className="flex text-slate-900 text-sm">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <span key={i} className={i < Math.floor(helper.rating) ? 'opacity-100' : 'opacity-20'}>★</span>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900">{helper.rating?.toFixed(1) || "5.0"}</span>
                                        </div>
                                        
                                        <p className="text-gray-500 text-xs leading-relaxed mb-6 italic font-medium line-clamp-2 px-4 opacity-80">
                                            "{helper.bio || helper.description || "Certified service provider available for coordination."}"
                                        </p>
                                    </div>

                                    <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <span className="block text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Rate</span>
                                            <span className="text-xl font-black text-slate-900 italic tracking-tighter">{helper.price}</span>
                                        </div>
                                        <Link href={`/helper/${helper.id || helper._id}`}>
                                            <button className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                                                {isAdmin ? "Audit Dossier" : "Review Profile"}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-24 bg-white rounded-[4rem] shadow-inner border border-dashed border-gray-200">
                                    <div className="text-5xl mb-6 grayscale opacity-20">🔍</div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic">Database Mismatch</h3>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Adjust search parameters</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}