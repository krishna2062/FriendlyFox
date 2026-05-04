import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function CommentModal({ video, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(video.comments || []);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    setLoading(true);
    try {
      const res = await api.post(`/videos/${video._id}/comment`, {
        text: text.trim(),
      });
      setComments(res.data);
      setText('');
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-gray-900 rounded-t-2xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h3>
          <button onClick={onClose}>
            <IoClose size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <Link
                  to={`/profile/${comment.userId?._id}`}
                  className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold"
                >
                  {comment.userId?.profilePic ? (
                    <img
                      src={comment.userId.profilePic}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    comment.userId?.username?.charAt(0).toUpperCase()
                  )}
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${comment.userId?._id}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {comment.userId?.username}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-0.5">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {user ? (
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-800 flex gap-2"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="text-orange-500 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? '...' : 'Post'}
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-gray-800 text-center">
            <Link to="/login" className="text-orange-500 font-semibold">
              Log in to comment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
