import * as React from 'react';
import { Text } from '@ds3/react';

type Status = 'draft' | 'signed';

interface StatusLabelProps {
  status: Status;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ status }) => {
  return (
    <Text 
      className={`px-2 py-1 rounded-full text-sm ${
        status === 'signed' 
          ? 'bg-success-3 text-success-11' 
          : 'bg-neutral-3 text-neutral-11'
      }`}
    >
      {status === 'signed' ? 'Signed' : 'Draft'}
    </Text>
  );
};

export default StatusLabel; 