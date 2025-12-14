'use client';

import React from 'react';
import Link from 'next/link';

export default function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Search for Care",
            description: "Browse our list of verified helpers. Filter by role (Nurse, Driver, Companion) to find the perfect match for your specific needs.",
            icon: "🔍︎"
        },
        {
            id: 2,
            title: "View Profiles & Reviews",
            description: "Click on a helper to see their detailed bio, experience, and reviews from other families. Transparency is our priority.",
            icon: "📄"
        },
        {
            id: 3,
            title: "Book & Connect",
            description: "Choose a date and time that works for you. Send a booking request directly through the platform. It's safe and secure.",
            icon: "📅"
        },
        {
            id: 4,
            title: "Relax & Receive Care",
            description: "Your helper arrives on time to provide compassionate assistance. You can track your appointments in your Dashboard.",
            icon: "💙"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-sans">

            <header className="relative py-35 text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero4.png" 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    /> 
                    <div className="absolute inset-0 bg-gray-900/80"></div>
                </div>
                <div className="max-w-4xl mx-auto relative z-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
                        How It Works
                    </h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        We make finding trusted elderly care simple, safe, and stress-free.
                    </p>
                </div>
            </header>
            
            <main className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
                            
                            <div className="flex-shrink-0 relative">
                                <div className="w-20 h-20 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center text-4xl shadow-md z-10 relative">
                                    {step.icon}
                                </div>
                                {index !== steps.length - 1 && (
                                    <div className="hidden md:block absolute top-20 left-1/2 w-1 h-24 bg-gray-300 -translate-x-1/2"></div>
                                )}
                            </div>

                            <div className={`flex-grow text-center md:text-left bg-white p-8 rounded-2xl border border-gray-200 shadow-md w-full hover:shadow-xl transition duration-300 transform hover:-translate-y-1`}>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    <span className="text-gray-900 mr-2">{step.id}.</span>
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {step.description}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center p-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to find help?</h2>
                    <p className="text-gray-600 mb-8 font-medium">Join thousands of families who trust SilverConnect.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/">
                            <button className="bg-gradient-to-r from-gray-900 to-gray-500 text-white font-bold px-8 py-3 rounded-full hover:bg-gray-900 transition shadow-lg">
                                Browse Helpers
                            </button>
                        </Link>
                        <Link href="/join">
                            <button className="bg-white text-gray-900 border border-gray-300 font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition">
                                Join as Helper
                            </button>
                        </Link>
                    </div>
                </div>

            </main>

        </div>
    );
}