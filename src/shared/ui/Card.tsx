import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
  rounded?: 'xl' | '2xl' | '32px';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  noPadding = false,
  hover = false,
  rounded = '32px',
  ...props 
}) => {
  const roundedClass =
    rounded === 'xl' ? 'rounded-xl' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-[32px]';
  
  return (
    <motion.div
      className={`
        bg-white dark:bg-emerald-900/30
        border border-emerald-100 dark:border-emerald-600/20
        ${roundedClass} shadow-sm
        ${!noPadding ? 'p-8' : ''}
        ${hover ? 'hover:shadow-md hover:scale-[1.01] transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};
