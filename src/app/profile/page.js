'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://backend-minor-project.onrender.com';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imageURLInput, setImageURLInput] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', role: '', image: '', phone: '', address: '', bio: ''
    });

    const updateUserData = (updatedUser) => {
        const validName = updatedUser.fullName || updatedUser.name || "Authorized User";
        const validImage = updatedUser.image || `https://i.pravatar.cc/150?u=${updatedUser.email}`;
        const userData = { ...updatedUser, name: validName, image: validImage };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setImageURLInput(validImage);
        setFormData({
            name: validName,
            email: userData.email || '',
            role: userData.role || 'user',
            image: validImage,
            phone: userData.phone || '',
            address: userData.address || '',
            bio: userData.bio || ''
        });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { router.push('/login'); return; }
        const parsedUser = JSON.parse(storedUser);
        updateUserData(parsedUser);
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            setImageURLInput(''); 
            setFormData({ ...formData, image: URL.createObjectURL(file) });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('phone', formData.phone);
        dataToSend.append('location', formData.address);
        dataToSend.append('bio', formData.bio);
        if (selectedImageFile) dataToSend.append('image', selectedImageFile);
        else dataToSend.append('imageURL', imageURLInput);

        try {
            const res = await fetch(`${API_BASE_URL}/api/helper-profile/${user.email}`, {
                method: 'PUT',
                body: dataToSend
            });
            if (res.ok) {
                const updatedData = await res.json();
                updateUserData(updatedData);
                window.dispatchEvent(new Event('userUpdated'));
                setIsEditing(false);
                setSelectedImageFile(null);
                setMessage({ type: 'success', text: "✓ PROFILE SYNCHRONIZED." });
            } else {
                setMessage({ type: 'error', text: "✓ UPDATE REJECTED." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "✓ TRANSMISSION ERROR." });
        } finally { setIsSaving(false); }
    };

    const handleDeleteAccount = async () => {
        if(!window.confirm("PERMANENT DATA PURGE: ARE YOU CERTAIN?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${user.email}`, { method: 'DELETE' });
            if (res.ok) {
                localStorage.removeItem('user'); 
                window.location.href = '/signup'; 
            }
        } catch (err) { setMessage({ type: 'error', text: "PURGE FAILED." }); }
    };
    
    if (!user) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-black tracking-widest text-[9px] uppercase italic">Decrypting Profile...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-200 font-sans text-slate-900">
            <div className="h-48 bg-slate-950 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/60"></div>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 md:px-25 -mt-20 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    <aside className="w-full lg:w-[360px] lg:sticky lg:top-24">
                        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 p-8 text-center">
                            <div className="relative inline-block mb-4">
                                <img src={isEditing ? formData.image : user.image} alt="" className="w-32 h-32 rounded-3xl border-4 border-slate-50 object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute -bottom-1 -right-1 bg-slate-950 text-white px-3 py-1 rounded-lg font-black text-[8px] uppercase border-2 border-white">Verified</div>
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-slate-950">{user.name}</h2>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mb-4">{user.email}</p>
                            
                            <div className={`inline-block text-white text-[8px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] ${user.role === 'admin' ? 'bg-blue-600' : 'bg-slate-950'}`}>
                                {user.role} Authorization
                            </div>
                            
                            {!isEditing && (
                                <div className="mt-6 text-left space-y-4 border-t border-slate-50 pt-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm opacity-30">📞</span>
                                        <div>
                                            <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Secure Link</p>
                                            <p className="text-[13px] font-bold text-slate-700">{user.phone || "UNSET"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm opacity-30">📍</span>
                                        <div>
                                            <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Operational Base</p>
                                            <p className="text-[13px] font-bold uppercase text-slate-700">{user.address || "UNSET"}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-50">
                                        <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Dossier Summary</p>
                                        <p className="text-[12px] text-slate-500 italic leading-snug">
                                            &quot;{user.bio || "No archives available."}&quot;
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                    <main className="flex-1 w-full space-y-6">
                        {message.text && (
                            <div className={`p-4 rounded-xl border font-black text-[9px] tracking-widest uppercase ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                                <div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] block mb-1">Identity Protocol</span>
                                    <h3 className="text-3xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">Security Settings</h3>
                                </div>
                                <button onClick={() => { setIsEditing(!isEditing); if (isEditing) updateUserData(user); setMessage({ type: '', text: '' }); }}
                                    className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isEditing ? 'bg-slate-100 text-slate-400' : 'bg-slate-950 text-white hover:bg-black active:scale-95'}`}>
                                    {isEditing ? 'Discard' : 'Modify Credentials'}
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                {isEditing && (
                                    <div className="bg-slate-100 p-4 rounded-2xl border border-dashed border-slate-200 animate-in zoom-in-95 duration-300">
                                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Cloudinary Asset Override</label>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-[9px] font-black file:bg-slate-950 file:text-white file:border-none file:px-3 file:py-1.5 file:rounded-lg file:mr-4 file:uppercase file:tracking-widest cursor-pointer bg-white p-2 rounded-lg border border-slate-100 mb-3" />
                                        <div className="relative flex items-center my-3 text-slate-300 font-black uppercase text-[7px] tracking-widest">
                                            <div className="flex-grow h-px bg-slate-200"></div><span className="mx-4">OR URL</span><div className="flex-grow h-px bg-slate-200"></div>
                                        </div>
                                        <input type="text" value={imageURLInput} onChange={(e) => { setImageURLInput(e.target.value); setSelectedImageFile(null); setFormData({ ...formData, image: e.target.value }); }} placeholder="System Asset URL" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] font-bold focus:ring-1 focus:ring-slate-950 outline-none" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-800 uppercase tracking-widest ml-1 italic">Legal Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={`w-full border-b-2 p-2 outline-none transition font-bold text-[14px] ${isEditing ? 'border-slate-950 bg-transparent text-slate-950' : 'border-slate-50 bg-transparent text-slate-600'}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-800 uppercase tracking-widest ml-1 italic">Verified Email</label>
                                        <input type="email" value={formData.email} disabled className="w-full border-b-2 border-slate-50 bg-transparent text-slate-600 p-2 outline-none text-[14px] font-bold uppercase cursor-not-allowed"/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Secure Contact</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={`w-full border-b-2 p-2 outline-none transition font-bold text-[14px] ${isEditing ? 'border-slate-950 bg-transparent text-slate-950' : 'border-slate-50 bg-transparent text-slate-600'}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Operational Zone</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} className={`w-full border-b-2 p-2 outline-none transition font-bold text-[14px] ${isEditing ? 'border-slate-950 bg-transparent text-slate-950' : 'border-slate-50 bg-transparent text-slate-600'}`} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Dossier Summary</label>
                                    <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} disabled={!isEditing} className={`w-full border rounded-xl p-3 outline-none transition font-medium text-[13px] italic leading-relaxed ${isEditing ? 'border-slate-950 bg-white text-slate-700' : 'border-slate-50 bg-slate-50 text-slate-600 shadow-inner'}`}></textarea>
                                </div>

                                {isEditing && (
                                    <div className="pt-2 flex justify-end">
                                        <button type="submit" disabled={isSaving} className="bg-slate-950 text-white font-black px-10 py-3 rounded-xl shadow-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-black active:scale-95 transition-all">
                                            {isSaving ? 'Processing...' : 'Commit Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-red-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-center md:text-left">
                                <h3 className="text-red-600 font-black text-[9px] uppercase tracking-[0.3em] italic leading-none mb-1">Termination Zone</h3>
                                <p className="text-slate-400 text-[11px] font-medium leading-none">Permanent purge of all system logs.</p>
                            </div>
                            <button onClick={handleDeleteAccount} className="bg-transparent border-2 border-red-50 text-red-500 font-black text-[9px] uppercase tracking-widest px-5 py-2 rounded-xl hover:bg-red-50 active:scale-95 transition-all">
                                Purge Account
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}