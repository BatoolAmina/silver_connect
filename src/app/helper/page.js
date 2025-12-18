'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const StarRating = ({ rating }) => {
    const stars = [];
    const normalizedRating = Math.floor(rating || 0);
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className={`text-sm ${i <= normalizedRating ? 'text-slate-900' : 'text-slate-200'}`}>
                ★
            </span>
        );
    }
    return <div className="flex justify-center space-x-0.5">{stars}</div>;
};

export default function HelpersRegistryPage() {
    const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://backend-minor-project.onrender.com';

    const [helpers, setHelpers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('All'); 
    const [loading, setLoading] = useState(true);
    const [availableSkills, setAvailableSkills] = useState(['All']);

    useEffect(() => {
        const fetchHelpers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/helpers`);
                if (!res.ok) throw new Error('Registry Sync Fail');
                const data = await res.json();
                setHelpers(data);
                const uniqueSkills = [...new Set(data.map(h => h.role || 'Specialist'))];
                setAvailableSkills(['All', ...uniqueSkills].sort());
            } catch (e) {
                console.error("Registry Sync Error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchHelpers();
    }, [API_BASE_URL]);

    const filteredHelpers = helpers.filter((helper) => {
        const matchesSearch = helper.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (helper.role || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkill = selectedSkill === 'All' || helper.role === selectedSkill;
        return matchesSearch && matchesSkill;
    });

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
            <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-black tracking-[0.5em] text-[10px] uppercase italic animate-pulse">Decrypting Registry...</p>
        </div>
    );

    return (
        <div className="bg-gray-200 min-h-screen font-sans text-slate-900 selection:bg-slate-950 selection:text-white">
            <header className="relative pt-24 pb-15 text-center px-8 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0 opacity-50 grayscale">
                    <img src="/hero7.jpg" alt="" className="w-full h-full object-cover" /> 
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0"></div>
                <div className="max-w-[1400px] mx-auto relative z-10 text-white">
                    <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500 mb-6 block italic">Vetted Personnel Registry</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-[0.85]">
                        Specialists <span className="text-slate-700 font-light not-italic">.</span>
                    </h1>
                    <p className="text-slate-500 max-w-xl text-[11px] font-medium font-bold uppercase tracking-[0.3em] mx-auto leading-relaxed">
                        Authorized geriatric coordination specialists and medical assistance protocols.
                    </p>
                    
                    <div className="relative max-w-xl mx-auto mt-10 mb-5 justify-center item-center">
                        <input 
                            type="text" 
                            placeholder="Identify Specialist or expertise..." 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm focus:bg-white focus:text-slate-900 outline-none transition-all duration-500 italic font-bold placeholder:text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="container mx-auto px-6 mt-10 relative z-20 mb-5">
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {availableSkills.map((skill) => (
                                <button 
                                    key={skill}
                                    onClick={() => setSelectedSkill(skill)}
                                    className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border transition-all duration-300 whitespace-nowrap ${
                                        selectedSkill === skill 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105' 
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
            </header>
            
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 -mt-12 mb-15 relative z-20"> 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {filteredHelpers.length > 0 ? (
                        filteredHelpers.map((helper) => (
                            <Link key={helper._id} href={`/helper/${helper.id || helper._id}`} className="group">
                                <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2 flex flex-col h-full relative overflow-hidden">
                                    
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Active</span>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                                            ID: {helper._id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-start gap-5 mb-8">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={helper.image || `https://i.pravatar.cc/150?u=${helper.email}`}
                                                    alt=""
                                                    className="w-24 h-24 rounded-[2rem] object-cover border-4 border-slate-50 shadow-xl grayscale group-hover:grayscale-0 transition-all duration-1000"
                                                />
                                                <div className="absolute -bottom-2 -right-2 bg-slate-950 text-white w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg">✓</div>
                                            </div>
                                            <div className="pt-2">
                                                <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic leading-none mb-2">
                                                    {helper.name}
                                                </h2>
                                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{helper.role}</p>
                                                <div className="mt-3">
                                                    <StarRating rating={helper.rating} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-8">
                                            <p className="text-slate-500 text-[13px] leading-relaxed font-medium italic line-clamp-3 border-l-2 border-slate-100 pl-4">
                                                {helper.bio || helper.description || "Authorized service provider specializing in geriatric care coordination and residential support protocols."}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-8">
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:border-slate-900 group-hover:text-slate-900 transition-all">
                                                {helper.experience || "5+ Years"} Exp
                                            </span>
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100">
                                                Background Verified
                                            </span>
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100">
                                                24/7 Response
                                            </span>
                                        </div>

                                        <div className="mt-auto w-full pt-6 border-t border-slate-50 flex justify-between items-center">
                                            <div>
                                                <span className="text-[8px] font-black text-slate-300 uppercase block tracking-widest mb-1">Standard Rate</span>
                                                <span className="text-xl font-black text-slate-950 italic tracking-tighter">{helper.price}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] font-black text-slate-300 uppercase block tracking-widest mb-1">Deployment Zone</span>
                                                <span className="text-[11px] font-black text-slate-950 uppercase italic">{helper.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-950 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                                </div>
                            </Link>
                        )
                    )) : (
                        <div className="col-span-full py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                            <div className="text-5xl mb-6 grayscale opacity-10">🔍</div>
                            <h3 className="text-2xl font-black text-slate-200 uppercase tracking-tighter italic">Database Mismatch</h3>
                            <button onClick={() => {setSearchTerm(''); setSelectedSkill('All')}} className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-200 pb-1 hover:text-slate-900 hover:border-slate-900 transition-all">Clear All Parameters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}