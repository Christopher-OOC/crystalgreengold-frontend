import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, ArrowLeft, Send } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSignUpClick: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin, onSignUpClick }) => {
  const [username, setUsername] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      {!isSent ? (
        <>
          <div className="mb-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-950 dark:text-white mb-2">Reset Password</h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm text-center md:text-left">
              Enter your username and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              id="username"
              label="Username" 
              icon={User} 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button 
              type="submit" 
              className="w-full py-3 rounded-xl"
              isLoading={isLoading}
            >
              <span>Send Reset Instructions</span>
              <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>

            <button 
              type="button"
              onClick={onBackToLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 text-amber-400 hover:text-amber-400 font-semibold transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={18} />
              <span>Back to login</span>
            </button>
          </form>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 py-6"
        >
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={24} />
          </div>
          <h2 className="text-2xl font-bold text-emerald-950 dark:text-white">Instructions Sent!</h2>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm">
            We've sent password reset instructions to the email associated with <span className="font-bold text-emerald-950 dark:text-white">{username}</span>.
          </p>
          <Button variant="secondary" onClick={onBackToLogin} className="w-full py-3 rounded-xl">
            Return to Login
          </Button>
        </motion.div>
      )}

      <div className="mt-8 pt-6 border-t border-emerald-50 dark:border-emerald-900 text-center">
        <p className="text-emerald-600 dark:text-emerald-400 text-sm">
          Don't have an account? <button onClick={onSignUpClick} className="text-amber-400 hover:text-amber-400 font-bold ml-1">Sign up</button>
        </p>
      </div>
    </div>
  );
};
