import { IconButton } from '@ds3/react';
import { Link } from 'lucide-react-native';

interface LinkVariableProps {
  onClick: () => void;
  className?: string;
}

export function LinkVariable({ onClick, className }: LinkVariableProps) {
  return (
    <IconButton
      icon={Link}
      variant="ghost"
      size="sm"
      onPress={onClick}
      aria-label="Link variable"
      className={className}
    />
  );
}
