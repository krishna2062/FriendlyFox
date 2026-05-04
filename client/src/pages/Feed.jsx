import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';
import Loader from '../components/Loader';

export default function Feed() {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchVideos = useCallback(async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await api.get(`/videos/feed?page=${pageNum}&limit=5`);
      const { videos: newVideos, totalPages: tp } = res.data;

      setVideos((prev) => (append ? [...prev, ...newVideos] : newVideos));
      setTotalPages(tp);
      setError('');
    } catch (err) {
      setError('Failed to load videos');
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(1);
  }, [fetchVideos]);

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (
        scrollHeight - scrollTop - clientHeight < 200 &&
        !loadingMore &&
        page < totalPages
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchVideos(nextPage, true);
      }
    },
    [page, totalPages, loadingMore, fetchVideos]
  );

  const handleLikeUpdate = (videoId, newLikes) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === videoId ? { ...v, likes: newLikes } : v))
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => fetchVideos(1)}
          className="bg-orange-500 px-6 py-2 rounded-lg font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-2">
        <p className="text-2xl">🦊</p>
        <p className="text-gray-400">No videos yet</p>
        <p className="text-gray-500 text-sm">Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      onScroll={handleScroll}
    >
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
          onLikeUpdate={handleLikeUpdate}
        />
      ))}
      {loadingMore && <Loader />}
    </div>
  );
}
