import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { FaCommentDots } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CommentModal from './CommentModal';

export default function VideoCard({ video, onLikeUpdate }) {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(video.likes || []);
  const isLiked = user && likes.includes(user._id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await api.post(`/videos/${video._id}/like`);
      setLikes(res.data.likes);
      if (onLikeUpdate) onLikeUpdate(video._id, res.data.likes);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <div className="relative h-screen w-full snap-start flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="h-full w-full object-contain"
        loop
        muted
        playsInline
        onClick={togglePlay}
      />

      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <Link
          to={`/profile/${video.userId?._id}`}
          className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-white"
        >
          {video.userId?.profilePic ? (
            <img
              src={video.userId.profilePic}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold">
              {video.userId?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <button onClick={handleLike} className="flex flex-col items-center">
          {isLiked ? (
            <AiFillHeart size={32} className="text-red-500" />
          ) : (
            <AiOutlineHeart size={32} className="text-white" />
          )}
          <span className="text-xs text-white mt-1">{likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center"
        >
          <FaCommentDots size={28} className="text-white" />
          <span className="text-xs text-white mt-1">
            {video.comments?.length || 0}
          </span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute left-3 bottom-20 max-w-[70%]">
        <Link
          to={`/profile/${video.userId?._id}`}
          className="font-bold text-white text-sm hover:underline"
        >
          @{video.userId?.username}
        </Link>
        {video.caption && (
          <p className="text-white text-sm mt-1 line-clamp-2">
            {video.caption}
          </p>
        )}
      </div>

      {showComments && (
        <CommentModal
          video={video}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
}
