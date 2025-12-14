'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const useCounter = (target) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (target === 0) return;
        const duration = 1500;
        const steps = 100;
        const stepTime = duration / steps;
        const increment = target / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(current));
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [target]);

    return count;
};

export default function AboutPage() {
    const happyFamilies = useCounter(5); 
    const verifiedPros = useCounter(100);

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            
            <header className="relative py-20 text-center px-4 overflow-hidden">
                
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero2.png" 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/80"></div>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
                        Our Mission
                    </h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        To bridge the gap between caring families and trusted professionals, ensuring every elderly individual receives the dignity and love they deserve.
                    </p>
                </div>
                
            </header>

            <section className="py-20 px-6">
                <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <img 
                            src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=800&auto=format&fit=crop" 
                            alt="Compassionate hand holding" 
                            className="rounded-2xl shadow-2xl"
                        />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Why We Started</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed text-lg">
                            Finding reliable care for aging parents shouldn&apos;t be stressful. We noticed that families often struggle to find verified, compassionate helpers who are available when needed.
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                            <b>SilverConnect</b> was built to solve this. We created a platform that prioritizes safety, transparency, and ease of use, connecting communities one helping hand at a time.
                        </p>
                        
                        <div className="flex gap-4">
                            <div className="text-center">
                                <span className="block text-4xl font-extrabold text-gray-900">
                                    {happyFamilies}k+ 
                                </span>
                                <span className="text-sm text-gray-500">Happy Families</span>
                            </div>
                            <div className="w-px bg-gray-300 h-12"></div>
                            <div className="text-center">
                                <span className="block text-4xl font-extrabold text-gray-900">
                                    {verifiedPros}%
                                </span>
                                <span className="text-sm text-gray-500">Verified Pros</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-20 px-6">
                <div className="container mx-auto text-center max-w-4xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12">Meet the Creator</h2>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg inline-block max-w-md border border-gray-100 hover:transform hover:scale-105 transition duration-300">
                        <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 overflow-hidden">
                            <img src="https://lh3.googleusercontent.com/a/ACg8ocIr3fK6ZAEwdZlMfUk-q1n1LKdPCNurKihbmFAiNKMy2gn6w6PBIg=s96-c" alt="Creator" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Project Developer</h3>
                        <p className="text-gray-700 font-medium mb-4">Lead Developer & Designer</p>
                        <p className="text-gray-500 italic">
                            &quot;I built SilverConnect to demonstrate how technology can solve real-world problems for our most vulnerable populations.&quot;
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Join our journey</h2>
                <Link href="/join">
                    <button className="bg-gradient-to-r from-gray-900 to-gray-500 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-700 transition shadow-xl text-lg">
                        Get Started Today
                    </button>
                </Link>
            </section>

        </div>
    );
}