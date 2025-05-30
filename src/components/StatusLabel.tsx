import * as React from 'react';

export type Status = 'success' | 'error' | 'warning' | 'info';

interface StatusLabelProps {
  status?: Status;
  text?: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status = 'info', text = 'Status' }) => {  
  const getStatusStyles = (status: Status) => {
    switch (status) {
      case 'success':
        return 'bg-success-3 text-success-11';
      case 'error':
        return 'bg-error-3 text-error-11';
      case 'warning':
        return 'bg-warning-3 text-warning-11';
      case 'info':
        return 'bg-primary-3 text-primary-11';
      default:
        return 'bg-neutral-3 text-neutral-11';
    }
  };
  
  return (
    <div className={`px-2 py-1 rounded-full text-sm ${getStatusStyles(status)}`}>
      {text}
    </div>
  );
};

export default StatusLabel; 