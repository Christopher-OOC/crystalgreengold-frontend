import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, ArrowRight, Eye, EyeOff, Type } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { API_BASE_URL } from '@/lib/config/api';
import { useUIStore } from '@/lib/store/uiStore';

interface LoginFormProps {
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSignUpClick, 
  onForgotPasswordClick, 
  onLoginSuccess 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const { toast } = useUIStore();
  
  // Try to use auth context, but handle if it's not available
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Auth context not available in LoginForm, using fallback');
    authContext = null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast.warning('Missing details', 'Please enter both username and password.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (authContext) {
        // Use auth context login
        await authContext.login({
          username: formData.username,
          password: formData.password,
        });
        console.log('Login successful via auth context');
        onLoginSuccess();
      } else {
        // Fallback: Direct API call
        console.log('Attempting direct API login...');
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok) {
          // Store tokens (adjust based on your API response structure)
          const accessToken = data.access_token || data.accessToken;
          const refreshToken = data.refresh_token || data.refreshToken;
          const memberId = data.member_id || data.memberId;

          if (accessToken) {

           localStorage.setItem('topnivo_member_id', memberId);
            localStorage.setItem('topnivo_access_token', accessToken);
            if (refreshToken) localStorage.setItem('topnivo_refresh_token', refreshToken);
            console.log('Login successful, tokens stored');
            toast.success('Welcome back');
            onLoginSuccess();
          } else {
            console.error('No access token in response:', data);
              toast.error('Login failed', 'No token was received from the server.');
            }
          } else {
          toast.error('Login failed', data.message || data.error || 'Invalid username or password.');
        }
      }
    } catch (err: any) {
      const message = err?.message || 'Invalid username or password. Please check your credentials and try again.';
      console.warn('Login failed:', message);
      if (!authContext) {
        toast.error('Login failed', message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto w-full">
      <div className="mb-3 text-center md:text-left">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-0.5 flex items-center justify-center md:justify-start gap-2">
          Welcome Back <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-[10px]">Sign in to your account to continue</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2.5"
      >
        <Input 
          id="username"
          label="Username" 
          icon={User} 
          placeholder="Enter your username" 
          value={formData.username}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        <div className="relative">
          <div className="flex justify-between items-center mb-1 px-1">
            <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <button 
              type="button"
              onClick={onForgotPasswordClick}
              className="text-[10px] font-semibold text-amber-500 hover:text-amber-600 transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
              <ShieldCheck size={16} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-12 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button 
          onClick={handleLogin} 
          className="w-full py-2 rounded-xl text-xs"
          isLoading={isLoading}
        >
          <span>Sign In</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="mt-3 p-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
          <p className="text-red-500 dark:text-red-400 text-[9px] leading-relaxed text-center">
            To sign up, please contact the person who invited you for your signup link.
          </p>
        </div>
      </motion.div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-[10px]">
          Don't have an account?{' '}
          <button 
            onClick={onSignUpClick} 
            className="text-amber-500 hover:text-amber-600 font-bold ml-1"
            disabled={isLoading}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};
