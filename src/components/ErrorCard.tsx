import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Button } from '@ds3/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

export interface ErrorCardProps {
  title?: string;
  message?: string;
  details?: string | Error;
  showDetails?: boolean;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while processing your request.',
  details,
  showDetails: initialShowDetails = false,
  onRetry,
  retryText = 'Try Again',
  className = '',
}) => {
  const [showDetails, setShowDetails] = React.useState(initialShowDetails);
  
  // Format error details for display
  const formattedDetails = React.useMemo(() => {
    if (!details) return null;
    
    if (details instanceof Error) {
      return details.stack || details.toString();
    }
    
    return details;
  }, [details]);
  
  return (
    <Card className={`border-error-7 ${className}`}>
      <CardHeader className="bg-error-3 border-b border-error-6">
        <div className="flex flex-row items-center gap-2">
          <AlertTriangle className="text-error-10 h-5 w-5" />
          <CardTitle className="text-error-11">{title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <p className="text-neutral-12 mb-4">{message}</p>
        
        {formattedDetails && (
          <div className="mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-primary-11 hover:text-primary-10 mb-2 underline focus:outline-none"
            >
              {showDetails ? 'Hide technical details' : 'Show technical details'}
            </button>
            
            {showDetails && (
              <pre className="p-3 bg-black/10 rounded text-sm overflow-x-auto whitespace-pre-wrap max-h-[200px] overflow-y-auto text-neutral-12 font-mono">
                {formattedDetails}
              </pre>
            )}
          </div>
        )}
      </CardContent>
      
      {onRetry && (
        <CardFooter className="bg-neutral-2 border-t border-neutral-6 p-4">
          <Button 
            onClick={onRetry} 
            variant="soft" 
            color="error" 
            size="sm"
          >
            <Button.Icon icon={RefreshCw} />
            <Button.Text>{retryText}</Button.Text>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorCard; 