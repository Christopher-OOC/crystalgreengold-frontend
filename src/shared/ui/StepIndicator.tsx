import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center space-x-4 mb-8">
    {[1, 2, 3].map((step) => (
      <React.Fragment key={step}>
        <motion.div 
          initial={false}
          animate={{
            scale: step === currentStep ? 1.1 : 1,
            backgroundColor: step === currentStep ? '#f59e0b' : step < currentStep ? '#10b981' : 'transparent',
            borderColor: step === currentStep ? '#f59e0b' : step < currentStep ? '#10b981' : 'currentColor',
            color: step <= currentStep ? '#ffffff' : '#94a3b8'
          }}
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-500 ${
            step === currentStep 
              ? 'shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {step < currentStep ? <CheckCircle2 size={16} /> : <span className="text-sm font-bold">{step}</span>}
        </motion.div>
        {step < 3 && (
          <div className="w-12 h-0.5 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: step < currentStep ? '100%' : '0%' }}
              className="absolute inset-0 bg-emerald-500"
            />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);
