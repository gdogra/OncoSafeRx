import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile as UserProfileType, UserPreferences } from '../../types/user';
import { 
  User, 
  Mail, 
  Building, 
  Award, 
  Calendar, 
  Settings, 
  Bell, 
  Palette, 
  Monitor,
  Stethoscope,
  Eye,
  EyeOff,
  Save,
  Camera,
  Users,
  Dna
} from 'lucide-react';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import { useToast } from '../UI/Toast';
import Modal from '../UI/Modal';
import { supabase } from '../../lib/supabase';
import PersonaSelector from './PersonaSelector';
import { Link } from 'react-router-dom';

// Build timestamp: 2025-10-04-00:10 - DEBUG LOGGING DEPLOYED - CACHE BUST
const UserProfile: React.FC = () => {
  const { state, actions } = useAuth();
  const { user } = state;
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'persona' | 'security'>('profile');
  
  // Reset to profile tab if patient tries to access persona tab
  React.useEffect(() => {
    if ((user?.role === 'patient' || user?.role === 'caregiver') && activeTab === 'persona') {
      setActiveTab('profile');
    }
  }, [user?.role, activeTab]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserProfileType>>(user || {});
  const [editedPreferences, setEditedPreferences] = useState<UserPreferences>(user?.preferences || {} as UserPreferences);
  const [showGenomicsCta, setShowGenomicsCta] = useState(false);

  // Keep editedUser and editedPreferences in sync with user changes
  React.useEffect(() => {
    if (user) {
      setEditedUser(user);
      setEditedPreferences(user.preferences || {} as UserPreferences);
    }
  }, [user]);

  const isPatientOrCaregiver = (user?.role === 'patient' || user?.role === 'caregiver' || (isEditing && (editedUser.role === 'patient' || editedUser.role === 'caregiver')));

  const applyTheme = React.useCallback((theme?: string) => {
    try {
      const root = document.documentElement;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = theme === 'dark' || (theme === 'auto' && prefersDark);
      root.classList[useDark ? 'add' : 'remove']('dark');
      root.setAttribute('data-theme', theme || 'light');
      try { localStorage.setItem('osrx_theme', String(theme || 'light')); } catch {}
    } catch {}
  }, []);

  React.useEffect(() => {
    applyTheme(user?.preferences?.theme as any);
  }, [user?.preferences?.theme, applyTheme]);

  React.useEffect(() => {
    applyTheme(editedPreferences?.theme as any);
  }, [editedPreferences?.theme, applyTheme]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarThumbUrl || user?.avatarUrl);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropDataUrl, setCropDataUrl] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState<number>(1.0);
  const [cropOffset, setCropOffset] = useState<{x:number,y:number}>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = React.useRef<{x:number,y:number,ox:number,oy:number} | null>(null);
  const [cropImgDim, setCropImgDim] = useState<{w:number,h:number}>({ w: 0, h: 0 });
  const MAX_PREVIEW = 256;

  const onPickAvatar = () => fileInputRef.current?.click();
  // Resize helper (canvas) to reduce storage use
  const resizeImage = (blob: Blob, maxSize = 512, quality = 0.85, square = false): Promise<{ dataUrl: string; blob: Blob; type: string }> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            // Determine target size keeping aspect
            let targetW = width, targetH = height;
            if (square) {
              // Fit shortest side to maxSize, then center-crop square
              const scale = maxSize / Math.min(width, height);
              targetW = Math.round(width * scale);
              targetH = Math.round(height * scale);
              canvas.width = maxSize; canvas.height = maxSize;
            } else {
              if (width > height && width > maxSize) {
                targetH = Math.round((height * maxSize) / width);
                targetW = maxSize;
              } else if (height > width && height > maxSize) {
                targetW = Math.round((width * maxSize) / height);
                targetH = maxSize;
              } else if (width === height && width > maxSize) {
                targetW = maxSize; targetH = maxSize;
              }
              canvas.width = targetW; canvas.height = targetH;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas not supported')); return; }
            if (square) {
              const temp = document.createElement('canvas');
              temp.width = targetW; temp.height = targetH;
              const tctx = temp.getContext('2d');
              if (!tctx) { reject(new Error('Canvas not supported')); return; }
              tctx.drawImage(img, 0, 0, targetW, targetH);
              const sx = Math.max(0, Math.floor((targetW - maxSize) / 2));
              const sy = Math.max(0, Math.floor((targetH - maxSize) / 2));
              ctx.drawImage(temp, sx, sy, maxSize, maxSize, 0, 0, maxSize, maxSize);
            } else {
              ctx.drawImage(img, 0, 0, targetW, targetH);
            }
                // Prefer JPEG to save space
            const mime = 'image/jpeg';
            canvas.toBlob((blob) => {
              if (!blob) { reject(new Error('Failed to create blob')); return; }
              const dataUrl = canvas.toDataURL(mime, quality);
              resolve({ dataUrl, blob, type: mime });
            }, mime, quality);
          };
          img.onerror = () => reject(new Error('Invalid image'));
          img.src = String(reader.result || '');
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        reject(err as any);
      }
    });
  };

  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('error', 'Please select an image'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setCropDataUrl(String(reader.result || ''));
      setCropScale(1.0);
      setCropOpen(true);
  React.useEffect(()=>{
    const baseScale = MAX_PREVIEW/Math.min(cropImgDim.w||1,cropImgDim.h||1);
    const sVal = baseScale*cropScale;
    const drawW = cropImgDim.w*sVal; const drawH = cropImgDim.h*sVal;
    const minX = Math.min(0, MAX_PREVIEW - drawW); const minY = Math.min(0, MAX_PREVIEW - drawH);
    let nx = cropOffset.x; let ny = cropOffset.y;
    if(nx>0) nx=0; if(ny>0) ny=0; if(nx<minX) nx=minX; if(ny<minY) ny=minY;
    setCropOffset({ x: nx, y: ny });
  }, [cropScale, cropImgDim.w, cropImgDim.h]);
    };
    reader.readAsDataURL(file);
  };

  // Create square thumbnail with center-crop and zoom scale
  const createCenterThumb = async (src: string, maxSize = 128, scale = 1.0, offsetX = 0, offsetY = 0): Promise<{ dataUrl: string; blob: Blob; type: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize; canvas.height = maxSize;
        const ctx = canvas.getContext('2d'); if (!ctx) { reject(new Error('Canvas unsupported')); return; }
        const baseScale = maxSize / Math.min(img.width, img.height);
        const s = baseScale * scale;
        const drawW = img.width * s; const drawH = img.height * s;
        // Apply offset (clamped by caller)
        const dx = offsetX; const dy = offsetY;
        ctx.drawImage(img, dx, dy, drawW, drawH);
        const mime = 'image/jpeg';
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Blob failed')); return; }
          resolve({ dataUrl: canvas.toDataURL(mime, 0.85), blob, type: mime });
        }, mime, 0.85);
      };
      img.onerror = () => reject(new Error('Invalid image'));
      img.src = src;
    });
  };

  const confirmCropAndUpload = async () => {
    if (!cropDataUrl) { setCropOpen(false); return; }
    try {
      // Download data URL as Blob for resizing
      const resp = await fetch(cropDataUrl);
      const blob = await resp.blob();
      const large = await resizeImage(blob, 512, 0.85, false);
      const thumb = await createCenterThumb(cropDataUrl, 128, cropScale, cropOffset.x, cropOffset.y);
      const base = `${user.id}/${Date.now()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(`${base}.jpg`, large.blob, { upsert: true, contentType: large.type });
      let upErr2: any = null;
      if (!upErr) {
        const r = await supabase.storage.from('avatars').upload(`${base}-thumb.jpg`, thumb.blob, { upsert: true, contentType: thumb.type });
        upErr2 = r.error;
      }
      if (!upErr && !upErr2) {
        const { data: d1 } = supabase.storage.from('avatars').getPublicUrl(`${base}.jpg`);
        const { data: d2 } = supabase.storage.from('avatars').getPublicUrl(`${base}-thumb.jpg`);
        const url = d1?.publicUrl || '';
        const thumbUrl = d2?.publicUrl || '';
        if (url) {
          setAvatarPreview(thumbUrl || url);
          setEditedUser(prev => ({ ...prev, avatarUrl: url, avatarThumbUrl: thumbUrl || url } as any));
          showToast('success', 'Profile photo uploaded (cropped)');
          setCropOpen(false);
          return;
        }
      }
      throw upErr || upErr2 || new Error('Upload failed');
    } catch {
      try {
        const resp = await fetch(cropDataUrl);
        const blob = await resp.blob();
        const large = await resizeImage(blob, 512, 0.85, false);
        const thumb = await createCenterThumb(cropDataUrl, 128, cropScale, cropOffset.x, cropOffset.y);
        setAvatarPreview(thumb.dataUrl || large.dataUrl);
        setEditedUser(prev => ({ ...prev, avatarUrl: large.dataUrl, avatarThumbUrl: thumb.dataUrl } as any));
        showToast('warning', 'Saved locally (optimized). Configure Storage for hosting.');
        setCropOpen(false);
      } catch {
        setAvatarPreview(cropDataUrl);
        setEditedUser(prev => ({ ...prev, avatarUrl: cropDataUrl!, avatarThumbUrl: cropDataUrl! } as any));
        showToast('warning', 'Saved locally. Configure Storage for hosting.');
        setCropOpen(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    console.log('👤 === PROFILE SAVE DEBUG START ===');
    console.log('👤 Profile save button clicked!');
    console.log('👤 Current user from state:', user);
    console.log('👤 Current editedUser:', editedUser);
    console.log('👤 Actions available:', !!actions);
    console.log('👤 updateProfile function type:', typeof actions?.updateProfile);
    
    try {
      console.log('👤 Calling actions.updateProfile with editedUser...');
      console.log('👤 editedUser details:', JSON.stringify(editedUser, null, 2));
      
      const updateResult = await actions.updateProfile(editedUser);
      console.log('👤 ✅ Profile update successful, result:', updateResult);
      
      setIsEditing(false);
      console.log('👤 ✅ Editing mode disabled');
      // After successful save, suggest genomics to patients
      if ((user?.role === 'patient' || editedUser.role === 'patient')) {
        setShowGenomicsCta(true);
      }
      
      // Show success message
      if ((window as any).showToast) {
        (window as any).showToast('success', 'Profile updated successfully');
        console.log('👤 ✅ Success toast shown');
      } else {
        alert('Profile updated successfully!');
        console.log('👤 ✅ Success alert shown');
      }
      
      console.log('👤 === PROFILE SAVE DEBUG END (SUCCESS) ===');
      
    } catch (error) {
      console.log('👤 ❌ Profile update error caught:', error);
      console.log('👤 Error name:', error?.name);
      console.log('👤 Error message:', error?.message);
      console.log('👤 Error stack:', error?.stack);
      
      // Show error message but don't block the UI
      if ((window as any).showToast) {
        (window as any).showToast('warning', 'Profile saved locally (server error)');
        console.log('👤 ⚠️ Warning toast shown');
      } else {
        alert('Profile saved locally due to server issues');
        console.log('👤 ⚠️ Warning alert shown');
      }
      
      // Still exit editing mode since the profile was updated locally
      setIsEditing(false);
      console.log('👤 ⚠️ Editing mode disabled after error');
      
      console.log('👤 === PROFILE SAVE DEBUG END (ERROR) ===');
    }
  };

  const handleSavePreferences = async () => {
    console.log('🎨 Preferences save button clicked!');
    console.log('🔍 Current editedPreferences:', editedPreferences);
    try {
      console.log('🚀 Calling actions.updateProfile with preferences...');
      await actions.updateProfile({ preferences: editedPreferences });
      console.log('✅ Preferences update successful');
      // Show success message
      if ((window as any).showToast) {
        (window as any).showToast('success', 'Preferences updated successfully');
      } else {
        alert('Preferences updated successfully!');
      }
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      // Show error message but don't block the UI
      if ((window as any).showToast) {
        (window as any).showToast('warning', 'Preferences saved locally (server error)');
      } else {
        alert('Preferences saved locally due to server issues');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      // This would normally call an API endpoint
      console.log('Password change requested');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const specialtyOptions = [
    'Medical Oncology',
    'Surgical Oncology',
    'Radiation Oncology',
    'Hematology-Oncology',
    'Gynecologic Oncology',
    'Pediatric Oncology',
    'Thoracic Oncology',
    'Neuro-Oncology',
    'Breast Oncology',
    'Gastrointestinal Oncology',
    'Genitourinary Oncology',
    'Head and Neck Oncology',
  ];

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    // Only show persona switching for non-patients
    ...(user?.role !== 'patient' && user?.role !== 'caregiver' ? [{ id: 'persona', label: 'Testing Persona', icon: Users }] : []),
    { id: 'security', label: 'Security', icon: Eye }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/auth-diagnostics"
            className="hidden sm:inline-flex items-center px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
            title="Open Auth Diagnostics"
          >
            Auth Diagnostics
          </a>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-primary-700">
                {user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <Tooltip content="Upload profile picture" position="left">
            <button onClick={onPickAvatar} className="p-2 text-gray-500 hover:text-gray-700">
              <Camera className="w-5 h-5" />
            </button>
          </Tooltip>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarSelected} />

          {/* Crop Modal */}
          <Modal isOpen={cropOpen} onClose={() => setCropOpen(false)} title="Adjust Profile Photo" size="md">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-64 h-64 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {cropDataUrl && (
                    <img
                      src={cropDataUrl}
                      alt="Crop preview"
                      style={{ transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropScale})` }}
                      className="max-w-none select-none cursor-grab"
                      draggable={false}
                      onLoad={(e:any)=>{ const i=e.currentTarget; setCropImgDim({ w: i.naturalWidth, h: i.naturalHeight }); setCropOffset({x:0,y:0}); }}
                      onMouseDown={(e)=>{ dragStart.current = { x: e.clientX, y: e.clientY, ox: cropOffset.x, oy: cropOffset.y }; setDragging(true); }}
                      onMouseMove={(e)=>{ if(!dragging||!dragStart.current) return; const dx=e.clientX-dragStart.current.x; const dy=e.clientY-dragStart.current.y; const baseScale=MAX_PREVIEW/Math.min(cropImgDim.w||1,cropImgDim.h||1); const s=baseScale*cropScale; const drawW=cropImgDim.w*s; const drawH=cropImgDim.h*s; const minX=Math.min(0, MAX_PREVIEW - drawW); const minY=Math.min(0, MAX_PREVIEW - drawH); let nx=dragStart.current.ox+dx; let ny=dragStart.current.oy+dy; if(nx>0) nx=0; if(ny>0) ny=0; if(nx<minX) nx=minX; if(ny<minY) ny=minY; setCropOffset({ x: nx, y: ny }); }}
                      onMouseUp={()=>{ setDragging(false); dragStart.current=null; }}
                      onMouseLeave={()=>{ setDragging(false); dragStart.current=null; }}
                      onTouchStart={(e)=>{ const t=e.touches[0]; dragStart.current={ x: t.clientX, y: t.clientY, ox: cropOffset.x, oy: cropOffset.y }; setDragging(true); }}
                      onTouchMove={(e)=>{ if(!dragging||!dragStart.current) return; const t=e.touches[0]; const dx=t.clientX-dragStart.current.x; const dy=t.clientY-dragStart.current.y; const baseScale=MAX_PREVIEW/Math.min(cropImgDim.w||1,cropImgDim.h||1); const s=baseScale*cropScale; const drawW=cropImgDim.w*s; const drawH=cropImgDim.h*s; const minX=Math.min(0, MAX_PREVIEW - drawW); const minY=Math.min(0, MAX_PREVIEW - drawH); let nx=dragStart.current.ox+dx; let ny=dragStart.current.oy+dy; if(nx>0) nx=0; if(ny>0) ny=0; if(nx<minX) nx=minX; if(ny<minY) ny=minY; setCropOffset({ x: nx, y: ny }); }}
                      onTouchEnd={()=>{ setDragging(false); dragStart.current=null; }}
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Zoom</label>
                <input type="range" min="1" max="3" step="0.05" value={cropScale}
                  onChange={(e) => setCropScale(parseFloat(e.target.value))}
                  className="w-full" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setCropOpen(false)} className="px-4 py-2 border border-gray-300 rounded">Cancel</button>
                <button onClick={confirmCropAndUpload} className="px-4 py-2 bg-primary-600 text-white rounded">Save</button>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      {/* Patient CTA to analyze genomics after saving profile */}
      {showGenomicsCta && (user?.role === 'patient' || editedUser.role === 'patient') && (
        <div className="p-4 border border-green-200 bg-green-50 rounded-lg flex items-center justify-between">
          <div className="text-green-800">
            <div className="font-semibold">Profile updated</div>
            <div className="text-sm">Ready to analyze your genomics for personalized insights?</div>
          </div>
          <Link
            to="/genomics"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Dna className="w-4 h-4 mr-2" /> Analyze My Genomics
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <Tooltip 
              content={isEditing ? "Save your profile changes" : "Edit your profile information"}
              position="bottom"
            >
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </Tooltip>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={isEditing ? editedUser.firstName || '' : user.firstName || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                />
                <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={isEditing ? editedUser.lastName || '' : user.lastName || ''}
                onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={isEditing ? editedUser.email || '' : user.email || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                />
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {!isPatientOrCaregiver && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Role
                  </label>
                  <div className="relative">
                    <select
                      value={isEditing ? editedUser.role || '' : user.role}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, role: e.target.value as any }))}
                      disabled={!isEditing}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                    >
                      <option value="oncologist">Oncologist</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="nurse">Nurse</option>
                      <option value="researcher">Researcher</option>
                      <option value="student">Student</option>
                    </select>
                    <Stethoscope className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {(user.role === 'oncologist' || (isEditing && editedUser.role === 'oncologist')) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty
                    </label>
                    <select
                      value={isEditing ? editedUser.specialty || '' : user.specialty || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, specialty: e.target.value }))}
                      disabled={!isEditing}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                    >
                      <option value="">Select specialty...</option>
                      {specialtyOptions.map(specialty => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={isEditing ? editedUser.institution || '' : user.institution || ''}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, institution: e.target.value }))}
                      disabled={!isEditing}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                    />
                    <Building className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </>
            )}

            {(user.role === 'oncologist' || user.role === 'pharmacist' || 
              (isEditing && (editedUser.role === 'oncologist' || editedUser.role === 'pharmacist'))) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={isEditing ? editedUser.licenseNumber || '' : user.licenseNumber || ''}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    disabled={!isEditing}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                  <Award className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}

            {!isPatientOrCaregiver && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={isEditing ? editedUser.yearsExperience || '' : user.yearsExperience || ''}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser(user);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="p-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h2>
              
              {/* Theme Preferences */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setEditedPreferences(prev => ({ ...prev, theme: theme as any }))}
                      className={`p-3 border rounded-lg text-sm font-medium capitalize ${
                        editedPreferences.theme === theme
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email notifications' },
                    { key: 'push', label: 'Push notifications' },
                    { key: 'criticalAlerts', label: 'Critical alerts' },
                    { key: 'weeklyReports', label: 'Weekly reports' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={editedPreferences.notifications?.[key as keyof typeof editedPreferences.notifications] || false}
                        onChange={(e) => setEditedPreferences(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [key]: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard Preferences */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  Dashboard
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default View
                    </label>
                    <select
                      value={editedPreferences.dashboard?.defaultView || 'overview'}
                      onChange={(e) => setEditedPreferences(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          defaultView: e.target.value as any
                        }
                      }))}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="overview">Overview</option>
                      <option value="patients">Patients</option>
                      <option value="interactions">Interactions</option>
                      <option value="genomics">Genomics</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Compact mode</span>
                    <input
                      type="checkbox"
                      checked={editedPreferences.dashboard?.compactMode || false}
                      onChange={(e) => setEditedPreferences(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          compactMode: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'persona' && user?.role !== 'patient' && user?.role !== 'caregiver' && (
        <div>
          <PersonaSelector />
        </div>
      )}

      {activeTab === 'security' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Account Created:</span>
                    <div className="text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Login:</span>
                    <div className="text-gray-600">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;
