import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading this page. Please try again or contact support if the issue persists.",
  onRetry,
  onBack
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      
      <h2 className="text-2xl font-black text-emerald-950 dark:text-white uppercase tracking-tight mb-3">
        {title}
      </h2>
      
      <p className="text-emerald-600 dark:text-emerald-400 max-w-md mb-8 leading-relaxed">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="px-8 py-3 rounded-2xl flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>Try Again</span>
          </Button>
        )}
        
        {onBack && (
          <Button 
            variant="outline"
            onClick={onBack}
            className="px-8 py-3 rounded-2xl flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
};
