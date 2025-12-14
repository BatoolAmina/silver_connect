'use client';

import React from 'react';
import Link from 'next/link';

export default function ServicesPage() {
    const services = [
        {
            id: 1,
            title: "Medical Assistance",
            icon: "🩺",
            description: "Certified nurses (RN/LPN) to assist with medication management, wound care, health monitoring, and post-surgery recovery.",
            price: "Starts at $25/hr"
        },
        {
            id: 2,
            title: "Companionship",
            icon: "🤝",
            description: "Friendly caregivers to combat loneliness. Activities include conversation, playing games, reading, and accompanying elders on walks.",
            price: "Starts at $18/hr"
        },
        {
            id: 3,
            title: "Housekeeping & Meal Prep",
            icon: "🧹",
            description: "Assistance with light cleaning, laundry, organization, and preparing nutritious meals tailored to dietary needs.",
            price: "Starts at $22/hr"
        },
        {
            id: 4,
            title: "Transportation & Errands",
            icon: "🚗",
            description: "Safe driving for medical appointments, grocery shopping, pharmacy runs, or social visits.",
            price: "Starts at $20/hr"
        },
        {
            id: 5,
            title: "24/7 Live-in Care",
            icon: "🏠",
            description: "Round-the-clock support for those who need constant supervision. Includes night watch and daily living assistance.",
            price: "Starts at $180/day"
        },
        {
            id: 6,
            title: "Tech Support for Seniors",
            icon: "📱",
            description: "Patient helpers to assist with setting up Zoom, using smartphones, fixing TV remotes, and staying connected online.",
            price: "Starts at $15/hr"
        }
    ];

    return (
        <div className="bg-gray-100 font-sans min-h-screen">

            <header className="relative py-35 text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero3.png" 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    /> 
                    <div className="absolute inset-0 bg-gray-900/80"></div>
                </div>
                <div className="max-w-4xl mx-auto relative z-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
                        Our Services
                    </h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        Comprehensive care solutions tailored to the unique needs of your loved ones.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl shadow-sm mb-6 text-gray-700">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {service.description}
                            </p>
                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="font-bold text-gray-900">{service.price}</span>
                                <Link href="/helper">
                                    <button className="text-sm font-bold text-gray-600 hover:text-gray-900">
                                        Find Helpers →
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="mt-20 bg-white rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 border border-gray-200 shadow-sm">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Safety is our Priority</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Every helper on SilverConnect undergoes a strict verification process. We ensure peace of mind for you and your family.
                        </p>
                        <ul className="space-y-3 text-gray-700 font-medium">
                            <li className="flex items-center gap-2">✅ Background Checks</li>
                            <li className="flex items-center gap-2">✅ Identity Verification</li>
                            <li className="flex items-center gap-2">✅ Certified Qualification Reviews</li>
                        </ul>
                    </div>
                    <div className="md:w-1/2 text-center">
                        <div className="bg-gray-50 p-8 rounded-2xl shadow-inner max-w-sm mx-auto border border-gray-100">
                            <div className="text-5xl mb-4">🛡️</div>
                            <h3 className="text-xl font-bold text-gray-800">100% Verified</h3>
                            <p className="text-gray-500 mt-2">Trusted by 5,000+ families</p>
                        </div>
                    </div>
                </section>

                <div className="text-center mt-20">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Need a custom service?</h2>
                    <Link href="/contact">
                        <button className="bg-gray-900 text-white font-bold px-8 py-3 rounded-full hover:bg-gray-700 transition shadow-lg">
                            Contact Support
                        </button>
                    </Link>
                </div>

            </main>
        </div>
    );
}