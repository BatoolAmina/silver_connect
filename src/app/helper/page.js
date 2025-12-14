'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
        const isFilled = i < fullStars;
        const colorClass = isFilled ? 'text-gray-900' : 'text-gray-300';
        stars.push(<span key={i} className={`text-xl ${colorClass}`}>★</span>);
    }

    return (
        <div className="flex justify-center space-x-1">
            {stars}
        </div>
    );
};

export default function HelpersPage() {
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';
    const [helpers, setHelpers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('All'); 
    const [loading, setLoading] = useState(true);

    const [availableSkills, setAvailableSkills] = useState(['All']);

    useEffect(() => {
        const fetchHelpers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/helpers`);
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await res.json();
                
                const sanitizedData = data.map(helper => ({
                    ...helper,
                    skill: helper.role || 'Unspecified', 
                    avatar: helper.image || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png',
                    rating: helper.rating || 0,
                    numReviews: helper.reviews || 0, 
                    location: helper.location || 'N/A',
                    price: helper.price || 'Negotiable'
                }));
                
                setHelpers(sanitizedData);
                
                const uniqueSkills = [...new Set(sanitizedData.map(h => h.skill))];
                setAvailableSkills(['All', ...uniqueSkills].sort());
                
            } catch (e) {
                console.error("Failed to fetch helpers:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchHelpers();
    }, []);

    const filteredHelpers = helpers.filter((helper) => {
        const matchesSearch = helper.name.toLowerCase().includes(searchTerm.toLowerCase()) || helper.skill.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkill = selectedSkill === 'All' || helper.skill === selectedSkill;
        
        return matchesSearch && matchesSkill;
    });

    if (loading) {
        return <div className="text-center mt-16 text-gray-400 font-semibold bg-gray-950 min-h-screen">Loading Helper Network...</div>;
    }

    return (
        <div className="min-h-screen font-sans py-12 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 -mt-10 relative">
                
                <div className="flex flex-wrap justify-between items-center pt-4 mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
                        Available Helpers <span className="text-gray-800 text-lg font-normal">({filteredHelpers.length})</span>
                    </h2>
                    
                    <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                        <Link href="/join" className="bg-gray-900 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors">
                            + Join as Helper
                        </Link>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8 py-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    
                    <div className="flex-1">
                        <label htmlFor="search-input" className="text-sm font-semibold text-gray-900 block mb-1">Search by Name or Skill</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder="e.g. Sarah, Companion..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-inner bg-white text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-300 transition-colors"
                        />
                    </div>
                    
                    <div className="sm:w-1/3">
                        <label htmlFor="skill-select" className="text-sm font-semibold text-gray-900 block mb-1">Filter by Skill/Role</label>
                        <select
                            id="skill-select"
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-inner bg-white text-gray-900 focus:border-gray-300 focus:ring-2 focus:ring-gray-300 transition-colors appearance-none"
                        >
                            {availableSkills.map((skill) => (
                                <option key={skill} value={skill}>{skill}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <p className="text-gray-500 mb-6 font-semibold ml-2">
                    Showing {filteredHelpers.length} results for &quot;{selectedSkill}&quot;
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {filteredHelpers.map((helper) => (
                        <Link 
                            key={helper.id} 
                            href={`/helper/${helper.id}`}
                            className="block"
                        >
                            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 text-center h-full flex flex-col transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
                                
                                <img
                                    src={helper.avatar}
                                    alt={helper.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200 shadow-md"
                                />
                                
                                <h2 className="text-2xl font-bold text-gray-900">{helper.name}</h2>
                                <p className="text-gray-600 font-semibold text-md mb-3">{helper.skill}</p>
                                
                                <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col justify-end flex-grow">
                                    <p className="text-lg font-extrabold text-green-700">{helper.price}</p>
                                    <p className="text-gray-500 text-sm mt-1">📍 {helper.location}</p>
                                    
                                    <div className="mt-3">
                                        <StarRating rating={helper.rating} />
                                        <p className="text-xs text-gray-600 mt-1">
                                            {helper.rating.toFixed(1)} ({helper.numReviews} reviews)
                                        </p>
                                    </div>
                                    
                                    <button className="mt-4 w-full bg-gray-900 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-gray-700 transition shadow-lg">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {filteredHelpers.length === 0 && (
                    <div className="text-center text-gray-500 mt-12 p-12 bg-white border border-dashed border-gray-300 rounded-xl md:col-span-3 shadow-inner">
                        <p className="text-xl font-bold mb-2">No Helpers Found</p>
                        <p>We couldn&apos;t find any helpers matching your current search and filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}