'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="relative bg-gray-950 text-gray-300 py-12 mt-auto">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <h4 className="text-2xl font-bold text-white mb-2">SilverConnect</h4>
                        <p className="opacity-70 text-sm max-w-xs">
                            Connecting families with trusted, compassionate care for their elderly loved ones.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium">
                        <Link href="/" className="hover:text-white transition">Home</Link>
                        <Link href="/about" className="hover:text-white transition">About</Link>
                        <Link href="/services" className="hover:text-white transition">Services</Link>
                        <Link href="/faq" className="hover:text-white transition">FAQ</Link>
                        <Link href="/contact" className="hover:text-white transition">Contact</Link>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-500">
                    <p>&copy; 2025 SilverConnect Project. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}