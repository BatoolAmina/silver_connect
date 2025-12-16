'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ProfileDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userImage = user.image || `https://i.pravatar.cc/150?u=${user.name}`;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            >
                <img 
                    src={userImage} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-gray-300 object-cover" 
                />
                <span className="hidden lg:block font-medium text-gray-700">{user.name}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fadeIn">
                    <div className="px-4 py-3 text-sm border-b border-gray-100">
                        <p className="font-bold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                        href="/profile" 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setIsOpen(false)}
                    >
                        My Profile
                    </Link>
                    
                    <Link 
                        href="/dashboard" 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setIsOpen(false)}
                    >
                        My Dashboard
                    </Link>
                    
                    <button 
                        onClick={onLogout} 
                        className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

const NavLink = ({ href, label }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    
    return (
        <Link 
            href={href} 
            className={`relative font-semibold transition-colors group ${
                isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-950'
            }`}
        >
            {label}
            <span className={`absolute bottom-[-4px] left-0 h-0.5 bg-gray-900 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </Link>
    );
};

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.fullName && !parsedUser.name) {
                parsedUser.name = parsedUser.fullName;
            }
            setUser(parsedUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    let navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/services', label: 'Services' },
        { href: '/how-it-works', label: 'How It Works' },
    ];
    
    if (user && user.role === 'admin') {
        navLinks.push({ href: '/admin', label: "Admin Portal" });
    } else if (user && user.role === 'helper') {
        navLinks.push({ href: '/contact', label: 'Contact' });
    } else {
        navLinks.push({ href: '/contact', label: 'Contact' });
        navLinks.push({ href: '/join', label: 'Join Team' });
    }

    const allPossibleMobileLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/services', label: 'Services' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/contact', label: 'Contact' },
        { href: '/join', label: 'Join Team' },
        { href: '/admin', label: 'Admin Portal' },
    ];

    return (
        <nav className="bg-white/90 backdrop-blur-md text-gray-800 p-4 shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:opacity-80 transition">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">S</div>
                    SilverConnect
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <NavLink key={link.href} href={link.href} label={link.label} />
                    ))}
                </div>
                
                <div className="hidden md:flex items-center space-x-4">
                    {!user ? (
                        <div className="flex gap-3">
                            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2">
                                Login
                            </Link>
                            <Link href="/signup" className="bg-gray-900 text-white font-bold py-2 px-5 rounded-full hover:bg-gray-950 shadow-lg transform hover:-translate-y-0.5 transition-all">
                                Sign Up
                            </Link>
                        </div>
                    ) : (
                        <ProfileDropdown user={user} onLogout={handleLogout} />
                    )}
                </div>

                <div className="md:hidden">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        aria-label="Toggle Menu" 
                        className="text-gray-900 hover:text-gray-950 p-2"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`overflow-hidden md:hidden transition-all duration-300 ease-in-out bg-white border-t ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 flex flex-col space-y-4">
                    {allPossibleMobileLinks.map((link) => {
                        const isLinkVisible = (() => {
                            if (link.href === '/admin' && user?.role !== 'admin') return false;
                            
                            if (link.href === '/join' && (user?.role === 'admin' || user?.role === 'helper')) return false;

                            if (link.href === '/contact' && user?.role === 'admin') return false;
                            
                            if (link.href === '/dashboard' || link.href === '/profile') return false;
                            
                            return true;
                        })();

                        if (isLinkVisible) {
                            return (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`font-medium text-lg p-2 rounded-lg ${
                                        link.href === '/admin' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        }
                        return null;
                    })}
                    
                    <div className="w-full pt-4 border-t border-gray-100">
                        {!user ? (
                            <div className="flex flex-col gap-3">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-center text-gray-900 font-bold py-2 border border-gray-200 rounded-lg">
                                    Login
                                </Link>
                                <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="text-center bg-gray-900 text-white font-bold py-3 rounded-lg shadow-md">
                                    Sign Up
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <img 
                                        src={user.image || `https://i.pravatar.cc/150?u=${user.name}`} 
                                        alt={user.name} 
                                        className="w-10 h-10 rounded-full object-cover" 
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                
                                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-center bg-gray-100 text-gray-700 font-bold py-2 rounded-lg">
                                    My Profile
                                </Link>
                                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-center bg-gray-100 text-gray-700 font-bold py-2 rounded-lg">
                                    My Dashboard
                                </Link>
                                
                                <button onClick={handleLogout} className="text-center bg-red-50 text-red-500 font-bold py-2 rounded-lg border border-red-100">
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;