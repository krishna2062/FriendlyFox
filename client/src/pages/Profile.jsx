import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Loader from '../components/Loader';

export default function Profile() {
  const { id } = useParams();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = user && user._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userRes, videosRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/videos/user/${id}`),
        ]);
        setProfile(userRes.data);
        setVideos(videosRes.data);
        setEditForm({
          username: userRes.data.username,
          bio: userRes.data.bio || '',
        });
      } catch (err) {
        setError('User not found');
        console.error('Profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/users/update', editForm);
      setProfile(res.data);
      if (isOwnProfile) {
        updateUser({
          ...user,
          username: res.data.username,
          bio: res.data.bio,
        });
      }
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="pt-8 pb-4 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-3 overflow-hidden flex items-center justify-center text-2xl font-bold">
          {profile?.profilePic ? (
            <img
              src={profile.profilePic}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            profile?.username?.charAt(0).toUpperCase()
          )}
        </div>

        {editing ? (
          <div className="space-y-3 max-w-xs mx-auto">
            <input
              type="text"
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
              placeholder="Username"
            />
            <textarea
              value={editForm.bio}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 resize-none"
              placeholder="Bio"
              rows={2}
              maxLength={200}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-gray-800 text-white rounded-lg py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">@{profile?.username}</h2>
            {profile?.bio && (
              <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                {profile.bio}
              </p>
            )}

            {isOwnProfile && (
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 bg-gray-800 px-4 py-2 rounded-lg text-sm"
                >
                  <FiEdit2 size={14} /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-gray-800 px-4 py-2 rounded-lg text-sm text-red-400"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 py-4 border-t border-b border-gray-800">
        <div className="text-center">
          <p className="font-bold text-lg">{videos.length}</p>
          <p className="text-gray-400 text-xs">Videos</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">
            {videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0)}
          </p>
          <p className="text-gray-400 text-xs">Likes</p>
        </div>
      </div>

      {/* Videos grid */}
      <div className="grid grid-cols-3 gap-0.5 mt-0.5">
        {videos.map((video) => (
          <div
            key={video._id}
            className="aspect-[9/16] bg-gray-900 relative group"
          >
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
              onMouseOver={(e) => e.target.play()}
              onMouseOut={(e) => {
                e.target.pause();
                e.target.currentTime = 0;
              }}
            />
            <div className="absolute bottom-1 left-1 text-xs text-white/80 bg-black/40 px-1 rounded">
              {video.likes?.length || 0} ♥
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No videos yet</p>
        </div>
      )}
    </div>
  );
}
