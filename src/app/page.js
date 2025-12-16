'use client'; 

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';
    const [helpers, setHelpers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [error, setError] = useState(null);
    
    const [user, setUser] = useState(null);
    const [isHelper, setIsHelper] = useState(false);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            if (parsedUser.role === 'helper') {
                setIsHelper(true);
                fetch(`${API_BASE_URL}/api/helper-profile/${parsedUser.email}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'Pending') {
                            setIsPending(true);
                        }
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
                console.error("Home page API error:", err); 
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
        const helperDescription = helper.description || '';
        const helperLocation = helper.location || '';
        const term = searchTerm.toLowerCase();

        const matchesCategory = selectedCategory === "All" || helperRole === selectedCategory;

        const matchesSearch = helper.name.toLowerCase().includes(term) ||
                              helperRole.toLowerCase().includes(term) ||
                              helperDescription.toLowerCase().includes(term) ||
                              helperLocation.toLowerCase().includes(term);
                              
        return matchesCategory && matchesSearch;
    });

    const renderJoinButtonArea = () => {
        if (!user) {
            return (
                <Link href="/join">
                    <button className="bg-white/10 border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-gray-900 transition backdrop-blur-sm">
                        Become a Caregiver
                    </button>
                </Link>
            );
        }

        if (isPending) {
            return (
                <div className="bg-yellow-500/70 border-2 border-yellow-300 text-white font-bold px-4 py-3 rounded-full backdrop-blur-sm shadow-lg text-sm">
                    Your application is under review.
                </div>
            );
        }

        if (isHelper) {
             return (
                <Link href="/helper-dashboard">
                    <button className="bg-white/10 border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-gray-900 transition backdrop-blur-sm">
                        Go to Helper Dashboard
                    </button>
                </Link>
            );
        }
        
        return (
            <Link href="/join">
                <button className="bg-white/10 border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-gray-900 transition backdrop-blur-sm">
                    Become a Caregiver
                </button>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            
            <header className="relative pt-24 pb-36 px-6 text-center text-white overflow-hidden">
                
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero.png" 
                        alt="Soothing Background" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="bg-white/20 text-gray-100 text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-white/30 backdrop-blur-sm">
                        #1 Platform for Elderly Care
                    </span>
                    <h2 className="text-5xl md:text-6xl font-extrabold mt-6 mb-6 leading-tight">
                        Find Trusted Helpers for <br/> Your Loved Ones
                    </h2>
                    
                    <div className="relative max-w-lg mx-auto mt-8 mb-8">
                        <input 
                            type="text" 
                            placeholder="Search by Name, Role, or Location..." 
                            className="w-full py-4 px-6 rounded-full text-gray-800 bg-white shadow-2xl focus:ring-4 focus:ring-gray-300 outline-none transition placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-2 top-2 bg-gray-900 text-white p-2.5 rounded-full hover:bg-gray-700 transition flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>
                    </div> 
                    
                    <div className="flex justify-center gap-4">
                        {renderJoinButtonArea()}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 -mt-20 relative z-10 mb-20">
                
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((cat) => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5 ${
                                selectedCategory === cat 
                                ? 'bg-gray-900 text-white ring-2 ring-gray-700' 
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                            <p className="mt-4 text-gray-500 font-medium">Connecting to server...</p>
                    </div>
                ) : error ? (
                    <div className="col-span-full text-center py-16 bg-red-100 text-red-700 rounded-3xl shadow-sm border border-red-200">
                        <div className="text-6xl mb-4">🛑</div>
                        <h3 className="text-2xl font-bold">API Connection Error</h3>
                        <p className="mt-2">{error}</p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 mb-6 font-semibold ml-2">
                            Showing {filteredHelpers.length} results for "{selectedCategory}"
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredHelpers.length > 0 ? (
                                filteredHelpers.map((helper) => (
                                <div key={helper.id} className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                    
                                    <div className="h-20 bg-gray-200 relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                                        
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-600 shadow-sm flex items-center gap-1">
                                            <span>Verified</span>
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                        </div>
                                        
                                        <img 
                                            src={helper.image} 
                                            alt={helper.name} 
                                            className="w-28 h-28 rounded-full border-[5px] border-white absolute top-8 left-1/2 transform -translate-x-1/2 object-cover shadow-lg bg-gray-100"
                                        />
                                    </div>
                                    
                                    <div className="pt-16 pb-6 px-6 text-center flex-grow">
                                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-gray-500 transition">{helper.name}</h4>
                                        <p className="text-gray-800 font-bold text-xs uppercase tracking-widest mt-1">{helper.role}</p>
                                        
                                        <div className="flex justify-center items-center gap-1 my-3 text-amber-400 text-sm font-bold bg-amber-50 inline-block px-3 py-1 rounded-lg mx-auto">
                                            <span>★</span> {helper.rating.toFixed(1)} <span className="text-gray-400 font-normal ml-1">({helper.reviews || 0} reviews)</span>
                                        </div>
                                        
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 px-2">
                                            {helper.description}
                                        </p>
                                    </div>

                                    <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider">Hourly Rate</span>
                                            <span className="text-lg font-extrabold text-gray-900">{helper.price}</span>
                                        </div>
                                        <Link href={`/helper/${helper.id}`}>
                                            <button className="bg-gray-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gray-700 transition shadow-lg transform hover:-translate-y-0.5">
                                                View Profile
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-200">
                                    <div className="text-6xl mb-4">🔍︎</div>
                                    <h3 className="text-2xl font-bold text-gray-800">No helpers found.</h3>
                                    <p className="text-gray-500 mt-2">Try adjusting your search or category.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
            <br/>
        </div>
    );
}