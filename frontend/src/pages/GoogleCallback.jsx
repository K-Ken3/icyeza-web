import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const GoogleCallback = () => {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const token = params.get('token');
    const rawUser = params.get('user');

    if (error) {
      toast('Google sign-in did not complete. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    if (token && rawUser) {
      try {
        const user = JSON.parse(rawUser);
        loginWithGoogle(token, user);
        toast(`Welcome back, ${user.name.split(' ')[0]}!`);
        navigate(user.role === 'admin' ? '/admin' : '/account', { replace: true });
        return;
      } catch {
        // Invalid payload, fall through to login
      }
    }

    navigate('/login', { replace: true });
  }, [loginWithGoogle, toast, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <img
          src="/logo.png"
          alt="Icyeza One Coffee Shop"
          className="mx-auto rounded-xl object-contain"
          style={{ height: 56, filter: 'brightness(0.5) contrast(1.1) saturate(1.3)' }}
        />
        <div className="skeleton h-4 w-40 mx-auto mt-6" />
        <div className="skeleton h-4 w-52 mx-auto mt-3" />
      </div>
    </div>
  );
};

export default GoogleCallback;