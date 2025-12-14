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
                    // FIXED: Replaced unescaped quote with entity
                    a: "Yes. Every helper undergoes a mandatory background check, identity verification, and qualification review before their profile goes live."
                },
                {
                    q: "What if I am not satisfied with the helper?",
                    // FIXED: Replaced unescaped quotes with entity
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
        <div className="bg-gray-100 min-h-screen font-sans">
            
            <header className="bg-gradient-to-r from-gray-900 to-gray-500 text-white py-16 text-center px-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                <p className="text-gray-100 max-w-xl mx-auto">
                    Have questions? We&apos;re here to help. Find answers to the most common questions about our service.
                </p>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-3xl">
                
                {faqs.map((section, sIndex) => (
                    <div key={sIndex} className="mb-10">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-gray-500 pl-3">
                            {section.category}
                        </h2>
                        
                        <div className="space-y-4">
                            {section.questions.map((item, qIndex) => {
                                const uniqueIndex = `${sIndex}-${qIndex}`;
                                const isOpen = openIndex === uniqueIndex;

                                return (
                                    <div key={qIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <button 
                                            onClick={() => toggleFAQ(uniqueIndex)}
                                            className="w-full flex justify-between items-center p-5 text-left focus:outline-none hover:bg-gray-50 transition"
                                        >
                                            <span className={`font-medium text-lg ${isOpen ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {item.q}
                                            </span>
                                            <span className={`transform transition-transform duration-300 text-2xl text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
                                                ⌄
                                            </span>
                                        </button>
                                        
                                        <div 
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="text-center mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Still have questions?</h3>
                    <p className="text-gray-500 mb-6">Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team.</p>
                    <Link href="/contact">
                        <button className="bg-gray-900 text-white font-bold px-8 py-3 rounded-full hover:bg-gray-700 transition">
                            Contact Support
                        </button>
                    </Link>
                </div>

            </main>
        </div>
    );
}