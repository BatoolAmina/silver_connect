'use client'; 

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const ProfileDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userImage = user.image || `https://i.pravatar.cc/150?u=${user.email}`;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDashboardLink = () => {
        if (user.role === 'admin') return '/admin';
        if (user.role === 'helper') return '/helper-dashboard';
        return '/dashboard';
    };

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-3 transition-all duration-300 hover:opacity-80"
            >
                <img 
                    src={userImage} 
                    alt="" 
                    className="w-10 h-10 rounded-xl ring-2 ring-slate-900/10 object-cover shadow-sm grayscale hover:grayscale-0 transition-all" 
                />
                <div className="hidden lg:flex flex-col items-start leading-tight text-left">
                    <span className="font-black text-[11px] uppercase tracking-widest text-slate-950">{user.name || user.fullName}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${user.role === 'admin' ? 'text-blue-600' : 'text-slate-500'}`}>
                        {user.role} Authorization
                    </span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[1.5rem] shadow-2xl py-3 border border-slate-100 animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <p className="font-black text-xs uppercase tracking-widest text-slate-950 truncate">{user.name || user.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5 uppercase tracking-tighter">{user.email}</p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                        <Link 
                            href="/profile" 
                            className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 hover:text-slate-950 rounded-xl transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            Profile Metrics
                        </Link>
                        
                        <Link 
                            href={getDashboardLink()}
                            className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 hover:text-slate-950 rounded-xl transition-all"
                            onClick={() => setIsOpen(false)}
                        >
                            {user.role === 'admin' ? 'Admin Console' : (user.role === 'helper' ? 'Specialist Suite' : 'Command Center')}
                        </Link>
                        
                        <div className="pt-2 mt-2 border-t border-slate-50">
                            <button 
                                onClick={onLogout} 
                                className="w-full flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                Terminate Session
                            </button>
                        </div>
                    </div>
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
            className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-slate-950 relative group ${
                isActive ? 'text-slate-950' : 'text-slate-500'
            }`}
        >
            {label}
            <div className={`h-0.5 w-full bg-slate-950 mt-1 rounded-full transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></div>
        </Link>
    );
};

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const loadUser = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error("Auth sync error");
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();
        window.addEventListener('userUpdated', loadUser);
        window.addEventListener('storage', loadUser);
        return () => {
            window.removeEventListener('userUpdated', loadUser);
            window.removeEventListener('storage', loadUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const getDashboardLink = () => {
        if (!user) return '/dashboard';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'helper') return '/helper-dashboard';
        return '/dashboard';
    };

    let navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/helper', label: 'Registry' },
        { href: '/services', label: 'Protocol' },
        { href: '/faq', label: 'Support' },
    ];
    
    if (user && user.role === 'admin') {
        navLinks.push({ href: '/admin', label: "Override" });
    } else {
        navLinks.push({ href: '/contact', label: 'Contact' });
    }

    return (
        <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-100">
            <div className="max-w-[1800px] mx-auto px-6 md:px-8 h-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="w-18 h-18 flex items-center justify-center overflow-hidden transition-all group-hover:rotate-12 group-hover:scale-110">
                        <Image 
                            src="/logo-black.png"
                            alt="SilverConnect Logo"
                            width={90}
                            height={90}
                            className="object-contain p-1.5"
                        />
                    </div>

                    <span className="text-xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
                        Silver<span className="text-slate-400 font-light">Connect</span>
                    </span>
                </Link>
                <div className="hidden lg:flex items-center space-x-10 xl:space-x-14">
                    {navLinks.map((link) => (
                        <NavLink key={link.href} href={link.href} label={link.label} />
                    ))}
                </div>
                
                <div className="hidden lg:flex items-center">
                    {!user ? (
                        <div className="flex items-center gap-8">
                            <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-950 transition-colors">
                                Authorization
                            </Link>
                            <Link href="/signup" className="bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-3.5 rounded-2xl hover:bg-black shadow-2xl transition-all active:scale-95">
                                Enlist Now
                            </Link>
                        </div>
                    ) : (
                        <ProfileDropdown user={user} onLogout={handleLogout} />
                    )}
                </div>

                {/* MOBILE TRIGGER */}
                <div className="lg:hidden flex items-center gap-5">
                    {user && (
                         <img 
                            src={user.image || `https://i.pravatar.cc/150?u=${user.email}`} 
                            alt="" 
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 grayscale" 
                        />
                    )}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="text-slate-950 p-2 focus:outline-none"
                    >
                        <div className={`w-6 h-0.5 bg-slate-950 mb-1.5 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-slate-950 mb-1.5 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-slate-950 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            <div className={`lg:hidden bg-white overflow-hidden transition-all duration-500 ease-in-out border-b border-slate-100 ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-2 space-y-4 flex flex-col items-center py-10">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-sm font-black uppercase tracking-widest italic transition-all ${pathname === link.href ? 'text-slate-950 translate-x-2' : 'text-slate-400'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    <div className="w-full h-px bg-slate-50 my-2"></div>
                    
                    {!user ? (
                        <div className="flex flex-col w-full gap-4 px-6">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-center font-black uppercase tracking-widest text-slate-500 py-4 border border-slate-100 rounded-[1.5rem]">Authorization</Link>
                            <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="text-center font-black uppercase tracking-widest bg-slate-950 text-white py-5 rounded-[1.5rem] shadow-xl">Enlistment</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full gap-6 text-center px-6">
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Active Interface</p>
                                <Link 
                                    href={getDashboardLink()} 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="block text-sm font-black uppercase tracking-widest text-slate-950 italic"
                                >
                                    {user.role === 'admin' ? 'Admin Console' : (user.role === 'helper' ? 'Specialist Suite' : 'Command Center')}
                                </Link>
                                <Link 
                                    href="/profile" 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-6 border border-slate-200 py-3 rounded-xl"
                                >
                                    Update Profile Logs
                                </Link>
                            </div>
                            <button onClick={handleLogout} className="font-black uppercase tracking-widest text-red-600 text-xs py-2 underline underline-offset-4 mb-10">Terminate Session</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;