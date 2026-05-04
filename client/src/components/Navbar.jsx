import { Link, useLocation } from 'react-router-dom';
import { AiFillHome } from 'react-icons/ai';
import { BiPlus } from 'react-icons/bi';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-sm border-t border-gray-800">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 px-4 py-1 ${
            isActive('/') ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <AiFillHome size={24} />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/upload"
          className="flex flex-col items-center gap-0.5 px-4 py-1"
        >
          <div className="bg-orange-500 rounded-lg p-1">
            <BiPlus size={24} className="text-white" />
          </div>
        </Link>

        <Link
          to={`/profile/${user._id}`}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 ${
            location.pathname.startsWith('/profile')
              ? 'text-orange-500'
              : 'text-gray-400'
          }`}
        >
          <FiUser size={24} />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
