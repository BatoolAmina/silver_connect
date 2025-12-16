'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const API_BASE_URL = 'https://backend-minor-project.onrender.com';
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // State for image handling
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imageURLInput, setImageURLInput] = useState(''); // Holds the URL currently in the text input

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        image: '', // This will hold the confirmed URL
        phone: '',
        address: '',
        bio: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        
        const validName = parsedUser.name || parsedUser.fullName || "User";
        const validImage = parsedUser.image || `https://i.pravatar.cc/150?u=${validName}`;
        
        const userData = { 
            ...parsedUser, 
            name: validName, 
            image: validImage 
        };
        
        setUser(userData);
        setImageURLInput(validImage);
        setFormData({
            name: validName,
            email: userData.email || '',
            role: userData.role || '',
            image: validImage,
            phone: userData.phone || '',
            address: userData.address || '',
            bio: userData.bio || ''
        });
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleRandomizeAvatar = () => {
        const randomId = Math.floor(Math.random() * 1000);
        const newUrl = `https://i.pravatar.cc/150?img=${randomId}`;
        setImageURLInput(newUrl);
        setFormData({ ...formData, image: newUrl });
        setSelectedImageFile(null);
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            setImageURLInput(''); // Clear URL input when a file is selected
            setFormData({ ...formData, image: URL.createObjectURL(file) }); // Show local preview
        }
        setMessage({ type: '', text: '' });
    };
    
    // Function to handle image upload separately
    const uploadImage = async () => {
        const dataToSend = new FormData();
        dataToSend.append('image', selectedImageFile);

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${user.email}/image-upload`, {
                method: 'PUT',
                body: dataToSend
            });
            
            const data = await res.json();
            
            if (res.ok) {
                return { success: true, newImageUrl: data.user.image };
            } else {
                return { success: false, message: data.detailedError || data.error || data.message || 'Image upload failed.' };
            }

        } catch (err) {
            console.error(err);
            return { success: false, message: 'Server error during image file upload.' };
        }
    };


    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            let finalImageUrl = imageURLInput; // CRITICAL: Start with the URL input value.
            
            // 1. Handle Image Upload/URL Update
            if (selectedImageFile) {
                const uploadResult = await uploadImage();
                
                if (!uploadResult.success) {
                    return setMessage({ type: 'error', text: `Image Error: ${uploadResult.message}` });
                }
                finalImageUrl = uploadResult.newImageUrl;
            } else if (imageURLInput !== user.image) {
                // If no file was selected, but the URL input has changed (manual paste or randomize),
                // the finalImageUrl is already set to imageURLInput at the start of this function.
                // We just need to make sure the image property in formData is updated for the userPayload
                finalImageUrl = imageURLInput;
            }

            // 2. Prepare the payload for the User update (text fields + final image URL)
            const userPayload = {
                fullName: formData.name,
                image: finalImageUrl, // Use the finalized URL
                phone: formData.phone,
                address: formData.address,
                bio: formData.bio
            };

            // 3. Update the main User profile (JSON update)
            const userRes = await fetch(`${API_BASE_URL}/api/users/${user.email}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userPayload)
            });

            const userData = await userRes.json();

            if (!userRes.ok) {
                return setMessage({ type: 'error', text: `Failed to update Profile Text: ${userData.message || 'Unknown error.'}` });
            }

            // 4. Finalize and update session
            const updatedStorageUser = { 
                ...userData.user, 
                name: userData.user.name || userData.user.fullName
            };
            
            localStorage.setItem('user', JSON.stringify(updatedStorageUser));
            
            setUser(updatedStorageUser);
            setIsEditing(false);
            setSelectedImageFile(null);
            
            let successMessage = "✅ Profile updated successfully! Reloading...";
            
            setMessage({ type: 'success', text: successMessage });
            setTimeout(() => window.location.reload(), 1500); 

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error during profile update. Check connection/logs." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if(!window.confirm("Are you sure? This cannot be undone.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${user.email}`, { method: 'DELETE' });
            if (res.ok) {
                localStorage.removeItem('user'); 
                window.location.href = '/signup'; 
            } else {
                setMessage({ type: 'error', text: "Failed to delete account." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Server error during account deletion." });
        }
    };

    const getMessageClasses = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'error':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'hidden';
        }
    };

    if (!user) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>; 

    return (
        <div className="min-h-screen bg-gray-100 font-sans pb-20">
            
            <div className="h-64 bg-gradient-to-r from-gray-900 to-gray-500 relative">
                 <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    <div className="md:w-1/3">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="p-8 text-center">
                                <div className="relative inline-block group mb-4">
                                    <img 
                                        src={isEditing ? formData.image : user.image} 
                                        alt={user.name} 
                                        className="relative w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                                        onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${user.name}` }} 
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                                
                                <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-gray-300">
                                    {user.role || 'Member'}
                                </div>

                                {!isEditing && (
                                    <div className="mt-6 text-left space-y-3 border-t border-gray-100 pt-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span>📞</span> {user.phone || "No phone added"}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span>📍</span> {user.address || "No address added"}
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-400 uppercase">About Me</p>
                                            <p className="text-sm text-gray-600 italic mt-1">
                                                &quot;{user.bio || "No bio yet."}&quot;
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:w-2/3 space-y-8">
                        
                        {message.text && (
                            <div className={`p-4 rounded-lg border font-medium ${getMessageClasses(message.type)}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
                                    <p className="text-gray-500 text-sm">Update your personal information</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsEditing(!isEditing);
                                        if (isEditing) {
                                            setFormData({ 
                                                ...user, 
                                                name: user.name,
                                                image: user.image 
                                            });
                                            setImageURLInput(user.image);
                                            setSelectedImageFile(null);
                                        }
                                        setMessage({ type: '', text: '' });
                                    }}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                                        isEditing 
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                        : 'bg-gray-900 text-white hover:bg-gray-700 shadow-md'
                                    }`}
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                
                                {isEditing && (
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 animate-fadeIn mb-6">
                                        
                                        {/* File Upload Option */}
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Upload New Picture (File)</label>
                                        <input 
                                            type="file" 
                                            name="imageFile" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-900 hover:file:bg-gray-300" 
                                        />
                                        {selectedImageFile && (
                                            <p className="text-xs text-green-500 mt-1">File selected: {selectedImageFile.name}</p>
                                        )}
                                        
                                        <p className="text-center text-gray-400 font-semibold my-4">-- OR --</p>

                                        {/* URL Input Option */}
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Paste Image URL</label>
                                        <div className="flex gap-3">
                                            <input 
                                                type="text" 
                                                name="imageURLInput" 
                                                value={imageURLInput} 
                                                onChange={(e) => {
                                                    setImageURLInput(e.target.value);
                                                    setSelectedImageFile(null); // Clear file choice if user edits URL
                                                    setFormData({ ...formData, image: e.target.value });
                                                }} 
                                                placeholder="Paste Image URL"
                                                className="flex-grow bg-white border border-gray-300 text-gray-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                                            />
                                            <button type="button" onClick={handleRandomizeAvatar} className="bg-white border border-gray-300 text-gray-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-50">🎲 Random</button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                        <input 
                                            type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing}
                                            className={`w-full border rounded-xl p-3 outline-none transition font-medium ${isEditing ? 'border-gray-400 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                        <input type="email" value={formData.email} disabled className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl p-3 outline-none cursor-not-allowed"/>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                        <input 
                                            type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing}
                                            placeholder="+1 (555) 000-0000"
                                            className={`w-full border rounded-xl p-3 outline-none transition font-medium ${isEditing ? 'border-gray-400 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Address / Location</label>
                                        <input 
                                            type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing}
                                            placeholder="e.g. New York, NY"
                                            className={`w-full border rounded-xl p-3 outline-none transition font-medium ${isEditing ? 'border-gray-400 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Bio / About Me</label>
                                    <textarea 
                                        name="bio" rows="4" value={formData.bio} onChange={handleChange} disabled={!isEditing}
                                        placeholder="Tell us a little about yourself..."
                                        className={`w-full border rounded-xl p-3 outline-none transition font-medium ${isEditing ? 'border-gray-400 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                                    ></textarea>
                                </div>

                                {isEditing && (
                                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-800 shadow-lg transition transform hover:-translate-y-0.5"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-8">
                            <h3 className="text-red-700 font-bold text-lg mb-2">⚠️ Danger Zone</h3>
                            <p className="text-gray-600 text-sm mb-6">Deleting your account is permanent. All data will be lost.</p>
                            <button onClick={handleDeleteAccount} className="bg-white border-2 border-red-100 text-red-600 font-bold px-6 py-2 rounded-xl hover:bg-red-50 hover:border-red-200 transition">
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}