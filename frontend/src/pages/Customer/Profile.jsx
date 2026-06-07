import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Camera, Mail, Phone, Shield, User as UserIcon, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setEditData({ name: user.name, phone: user.phone || '' });
    }
  }, [user]);

  if (!user) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full" /></div>;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/users/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update local context user
      updateUser({ ...user, profileImageUrl: res.data });
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-12"
    >
      <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden relative">
        {/* Cover Background */}
        <div className="h-48 bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20"></div>
        
        {/* Profile Avatar */}
        <div className="px-8 pb-8 relative -mt-24 text-center sm:text-left sm:flex items-end gap-6">
          <div className="relative inline-block mx-auto sm:mx-0 group cursor-pointer">
            <div className={`w-40 h-40 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-2xl flex items-center justify-center ${uploading ? 'opacity-50' : ''}`}>
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={64} className="text-muted-foreground" />
              )}
            </div>
            
            {/* Upload Overlay */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <Camera size={32} />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 mb-4 flex-1">
            {isEditing ? (
              <input 
                type="text" 
                className="text-4xl font-black tracking-tight bg-transparent border-b border-accent outline-none w-full max-w-md text-foreground placeholder:text-muted" 
                value={editData.name} 
                onChange={e => setEditData({...editData, name: e.target.value})} 
                placeholder="Your Name"
              />
            ) : (
              <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
            )}
            <br />
            <span className="inline-block bg-secondary text-secondary-foreground text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 shadow-sm border border-border">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-8 pb-12">
          <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
            <h3 className="text-xl font-bold">Account Details</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors bg-accent/10 px-3 py-1.5 rounded-lg">
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={async () => {
                  try {
                    const res = await api.put('/users/profile', editData);
                    updateUser(res.data);
                    setIsEditing(false);
                  } catch (e) {
                    alert('Failed to update profile');
                  }
                }} className="flex items-center gap-1 text-sm font-bold bg-accent text-accent-foreground px-4 py-1.5 rounded-lg hover:-translate-y-0.5 transition-transform shadow-sm">
                  <Save size={16} /> Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditData({ name: user.name, phone: user.phone || '' }); }} className="flex items-center gap-1 text-sm font-bold bg-secondary text-foreground px-4 py-1.5 rounded-lg border border-border hover:bg-secondary/80 transition-colors">
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-border">
              <div className="p-3 bg-card rounded-xl text-accent shadow-sm"><Mail size={24} /></div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Email Address</p>
                <p className="font-bold">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-border">
              <div className="p-3 bg-card rounded-xl text-accent shadow-sm"><Phone size={24} /></div>
              <div className="w-full">
                <p className="text-sm text-muted-foreground font-semibold">Phone Number</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="font-bold bg-transparent border-b border-accent outline-none w-full text-foreground mt-1" 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})} 
                    placeholder="Enter phone number" 
                  />
                ) : (
                  <p className="font-bold">{user.phone || 'Not Provided'}</p>
                )}
              </div>
            </div>

            {user.role === 'CUSTOMER' && (
              <>
                <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-border">
                  <div className="p-3 bg-card rounded-xl text-green-500 shadow-sm"><Shield size={24} /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Karma Points</p>
                    <p className="font-bold text-lg text-green-500">{user.karmaPoints || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-border">
                  <div className="p-3 bg-card rounded-xl text-accent shadow-sm"><UserIcon size={24} /></div>
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground font-semibold">Skill Level</p>
                    <select 
                      className="mt-1 bg-transparent border-b border-border text-foreground font-bold outline-none w-full pb-1"
                      value={user.skillLevel || 'Beginner'}
                      onChange={async (e) => {
                        const newSkill = e.target.value;
                        try {
                          const res = await api.put('/users/profile', { skillLevel: newSkill });
                          updateUser(res.data);
                        } catch (err) {
                          alert("Failed to update skill level");
                        }
                      }}
                    >
                      <option className="bg-background text-foreground" value="Beginner">Beginner</option>
                      <option className="bg-background text-foreground" value="Intermediate">Intermediate</option>
                      <option className="bg-background text-foreground" value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
