import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiCloudUpload } from 'react-icons/bi';
import api from '../utils/api';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(selected.type)) {
      setError('Only MP4, WebM, and MOV formats are allowed');
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a video');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-black pt-4 pb-20 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Upload Video</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition"
            >
              <BiCloudUpload size={48} className="text-gray-500 mb-3" />
              <p className="text-gray-400 font-medium">
                Select video to upload
              </p>
              <p className="text-gray-600 text-sm mt-1">
                MP4, WebM, or MOV · Max 50MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <video
                src={preview}
                className="w-full max-h-80 rounded-xl object-contain bg-gray-900"
                controls
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={300}
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 outline-none focus:border-orange-500 transition resize-none"
          />

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Post Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
