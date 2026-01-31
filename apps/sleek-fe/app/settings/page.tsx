"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../firebase/AuthProvider';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Lock, Mail, Bell, Trash2, User, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const router = useRouter();

  const [emailNotifications, setEmailNotifications] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('settings.emailNotifications') || 'true'); } catch { return true; }
  });
  const [profilePublic, setProfilePublic] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('settings.profilePublic') || 'true'); } catch { return true; }
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('settings.emailNotifications', JSON.stringify(emailNotifications));
  }, [emailNotifications]);

  useEffect(() => {
    localStorage.setItem('settings.profilePublic', JSON.stringify(profilePublic));
  }, [profilePublic]);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null); setLoading(true);
    try {
      if (!user?.email) throw new Error('No authenticated user');
      // Attempt to call backend to change password; fallback to a success message
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, oldPassword, newPassword }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => 'Failed to change password');
        throw new Error(text || 'Failed to change password');
      }
      setMessage('Password changed successfully');
      setOldPassword(''); setNewPassword('');
    } catch (err: any) {
      console.error('Change password error', err);
      setError(err?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
      setTimeout(() => setError(null), 6000);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      await signInWithGoogle();
      setMessage('Connected with Google');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Google connect failed', err);
      setError('Google sign-in failed.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (err: any) {
      console.error('Disconnect failed', err);
      setError('Failed to disconnect');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      if (!res.ok) throw new Error('Failed to delete account');
      await signOutUser();
      router.push('/');
    } catch (err: any) {
      console.error('Delete account error', err);
      setError('Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Signed in as <strong>{user?.email || 'Guest'}</strong></div>
            <Button variant="outline" onClick={() => router.push('/')}>Home</Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><User className="w-5 h-5" /> Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-700">Email</div>
                <div className="font-medium">{user?.email || 'Not signed in'}</div>
              </div>
              <div className="text-right">
                <Button variant="outline" onClick={() => router.push('/profile')}>Edit Profile</Button>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Current password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <Input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" className="bg-green-600 text-white" disabled={loading}>Change password</Button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h2>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-700">Email notifications</div>
              <div className="text-xs text-gray-500">Receive updates about deals and safety alerts.</div>
            </div>
            <div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-700">Profile visibility</div>
              <div className="text-xs text-gray-500">Make your profile visible to other users on the platform.</div>
            </div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={profilePublic} onChange={(e) => setProfilePublic(e.target.checked)} />
              <span className="text-sm">Public</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Zap className="w-5 h-5" /> Connected accounts</h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleConnectGoogle}>Connect Google</Button>
            <Button variant="outline" onClick={handleDisconnect}>Disconnect</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Danger zone</h2>
          <div className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data.</div>
          <div className="flex gap-3">
            <Button className="bg-red-600 text-white" onClick={handleDeleteAccount} disabled={loading}>Delete account</Button>
            <Button variant="outline" onClick={() => router.push('/profile')}>Back to profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
