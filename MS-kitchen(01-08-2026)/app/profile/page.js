"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    Shield,
    Settings,
    Edit,
    Camera,
    Bell,
    Lock,
    LogOut,
    UserCheck,
    Calendar,
    MapPin,
    X,
    Check,
    Smartphone,
    Laptop,
    Trash2,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Profile Data State
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        employeeId: "",
        joinDate: "",
        status: "",
        location: "",
        avatar: "",
    });

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Temp state for editing
    const [editForm, setEditForm] = useState({ ...profile });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    ...data.user,
                    joinDate: new Date(data.user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                    }),
                    status: data.user.status || 'Active', // Default if missing
                    status: data.user.status || 'Active', // Default if missing
                });
            } else {
                console.error("Failed to fetch profile");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };



    const handleSaveProfile = async () => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(prev => ({
                    ...prev,
                    ...data.user
                })); // Update local state with returned data
                setIsEditModalOpen(false);
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred");
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "avatars");

        try {
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (uploadData.path) {
                // Update profile immediately
                const updateRes = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatar: uploadData.path })
                });

                if (updateRes.ok) {
                    const updateData = await updateRes.json();
                    setProfile(prev => ({ ...prev, ...updateData.user }));
                    setEditForm(prev => ({ ...prev, ...updateData.user }));
                } else {
                    alert("Failed to save avatar to profile");
                }
            } else {
                alert("Failed to upload image");
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            alert("An error occurred during upload");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Password updated successfully!");
                setIsPasswordModalOpen(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.message || "Failed to update password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("An error occurred");
        }
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to sign out?")) {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            router.push('/login');
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-black uppercase tracking-widest animate-pulse bg-background">Loading Profile...</div>;
    }

    return (
        <main className="min-h-screen flex-1 p-4 md:p-10 mb-20 md:mb-0 bg-background">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Admin Profile</h1>
                    <p className="text-muted-foreground font-black text-[10px] md:text-xs uppercase tracking-widest ">Manage your account settings</p>
                </div>
                <div className="hidden md:block">
                    <button
                        onClick={() => { setEditForm({ ...profile }); setIsEditModalOpen(true); }}
                        className="bg-muted text-foreground px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all hover:bg-muted/80 flex items-center gap-2 active:scale-95 border border-border shadow-sm"
                    >
                        <Edit size={16} strokeWidth={3} /> Edit Profile
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-[2.5rem] shadow-sm overflow-hidden p-6 md:p-8 text-center sticky top-28">
                        <div className="relative inline-block mb-6 group">
                            {profile.avatar ? (
                                <motion.div
                                    whileHover={{ rotate: 2, scale: 1.05 }}
                                    className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/20 overflow-hidden"
                                >
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    whileHover={{ rotate: 5, scale: 1.05 }}
                                    className="w-32 h-32 rounded-[2.5rem] bg-primary flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-orange-500/20 uppercase"
                                >
                                    {profile.name ? profile.name.charAt(0) : 'U'}
                                </motion.div>
                            )}
                            <label className={`absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center border-4 border-card hover:scale-110 transition-transform shadow-lg ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                {uploadingAvatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                            </label>
                        </div>

                        <h2 className="text-2xl font-black text-foreground tracking-tight">{profile.name}</h2>
                        <div className="mt-2 inline-flex items-center px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Shield size={12} className="mr-1.5" />
                            {profile.role}
                        </div>

                        <div className="mt-8 space-y-4 text-left border-t border-slate-50 pt-8">
                            <InfoRow icon={<Mail size={16} />} label="Email" value={profile.email} />
                            <InfoRow icon={<Phone size={16} />} label="Phone" value={profile.phone || 'Not Set'} />
                            <InfoRow icon={<User size={16} />} label="Employee ID" value={profile.employeeId || 'Not Set'} />
                            <InfoRow icon={<MapPin size={16} />} label="Location" value={profile.location || 'Not Set'} />
                        </div>

                        <button
                            onClick={() => { setEditForm({ ...profile }); setIsEditModalOpen(true); }}
                            className="w-full mt-10 md:hidden bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Edit size={16} strokeWidth={3} /> Edit Profile
                        </button>
                    </div>
                </div>

                {/* Settings & Statistics */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Highlights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <UserCheck size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Account Status</p>
                                <p className="text-lg font-black text-foreground tracking-tight">{profile.status}</p>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-card p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                <Calendar size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Joined Since</p>
                                <p className="text-lg font-black text-foreground tracking-tight">{profile.joinDate}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-card rounded-[2.5rem] shadow-sm p-6 md:p-8">
                        <h3 className="text-xl font-black text-foreground tracking-tight mb-8 uppercase tracking-tighter">Security & Session</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex items-center justify-center gap-2 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all active:scale-95 border border-border shadow-sm"
                            >
                                <Lock size={16} strokeWidth={3} />
                                Change Password
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all active:scale-95"
                            >
                                <LogOut size={16} strokeWidth={3} />
                                Terminate Session
                            </button>
                        </div>
                    </div>


                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <Modal title="Edit Profile" onClose={() => setIsEditModalOpen(false)}>
                        <div className="space-y-6">
                            <InputField label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            <InputField label="Email Address" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" readOnly disabled className=" cursor-not-allowed bg-muted" />
                            <InputField label="Phone Number" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                            <InputField label="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                            <InputField label="Employee ID" value={editForm.employeeId} onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })} />

                            <div className="pt-6 flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted transition-all border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {isPasswordModalOpen && (
                    <Modal title="Security Center" onClose={() => setIsPasswordModalOpen(false)}>
                        <div className="space-y-6">
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest text-center mb-8">Update your account password</p>
                            <InputField
                                label="Current Password"
                                type="password"
                                placeholder="••••••••"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            />
                            <InputField
                                label="New Password"
                                type="password"
                                placeholder="••••••••"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            />
                            <InputField
                                label="Confirm New Password"
                                type="password"
                                placeholder="••••••••"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            />

                            <div className="pt-6">
                                <button
                                    onClick={handleChangePassword}
                                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest transition-all hover:bg-primary-hover shadow-lg shadow-primary/20"
                                >
                                    Update Security
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </main>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-background/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-card rounded-[2.5rem] p-8 shadow-2xl w-full max-w-lg overflow-hidden"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">{title}</h2>
                    <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors border border-border">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

function InputField({ label, ...props }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
            <input
                {...props}
                className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-black text-foreground placeholder:text-muted-foreground/40 shadow-sm"
            />
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center border border-border">
                {icon}
            </div>
            <div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-foreground font-black text-sm tracking-tight">{value}</p>
            </div>
        </div>
    );
}




