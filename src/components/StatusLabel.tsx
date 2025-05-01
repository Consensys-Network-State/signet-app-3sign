import * as React from 'react';
import { Text } from '@ds3/react';

type Status = 'draft' | 'signed';

interface StatusLabelProps {
  status: Status;
  text?: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status, text }) => {
  const displayText = text || (status === 'signed' ? 'Signed' : 'Draft');
  
  return (
    <Text 
      className={`px-2 py-1 rounded-full text-sm ${
        status === 'signed' 
          ? 'bg-success-3 text-success-11' 
          : 'bg-neutral-3 text-neutral-11'
      }`}
    >
      {displayText}
    </Text>
  );
};

export default StatusLabel; 