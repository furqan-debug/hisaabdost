
import React from 'react';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionIndicatorProps {
  hasAction?: boolean;
  isSuccess: boolean;
  isError: boolean;
}

const ActionIndicator = React.memo(({ hasAction, isSuccess, isError }: ActionIndicatorProps) => {
  if (!hasAction && !isSuccess && !isError) return null;

  return (
    <motion.div 
      className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-600/30"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      {isSuccess && (
        <div className="flex items-center gap-1 text-green-400">
          <CheckCircle size={14} />
          <span className="text-xs">Action completed</span>
        </div>
      )}
      
      {isError && (
        <div className="flex items-center gap-1 text-red-400">
          <XCircle size={14} />
          <span className="text-xs">Action failed</span>
        </div>
      )}
      
      {hasAction && !isSuccess && !isError && (
        <div className="flex items-center gap-1 text-blue-400">
          <Zap size={14} />
          <span className="text-xs">Processing action...</span>
        </div>
      )}
    </motion.div>
  );
});

ActionIndicator.displayName = 'ActionIndicator';

export default ActionIndicator;
