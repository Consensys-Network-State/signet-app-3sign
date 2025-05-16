import * as React from 'react';
import { DocumentVariable } from '../store/documentStore';
import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { Root } from 'mdast';
import type { Components } from 'react-markdown';
import { Controller } from 'react-hook-form';
import VariableInput, { createValidationRules } from './VariableInput';
import ErrorBoundary from './ErrorBoundary';
import ErrorCard from './ErrorCard';

interface SpanProps {
  className?: string;
  children?: React.ReactNode;
  'data-name'?: string;
}

// Types for the component props
export interface MarkdownDocumentViewProps {
  control: any;
  content: {
    type: 'md' | 'mdast';
    data: string | Root;
  };
  variables?: Record<string, DocumentVariable>;
  errors?: Record<string, any>;
  nextActions?: Array<{
    conditions: Array<{
      input: any; // Accept any input structure to fix the type errors
    }>;
  }> | any[]; // Also accept other array types to fix errors
  userAddress?: string;
  initialParams?: Record<string, string>;
  isInitializing?: boolean;
}

// Markdown-specific error fallback
const MarkdownErrorFallback = ({ error }: { error: Error }) => (
  <ErrorCard
    title="Error Rendering Document"
    message="There was a problem displaying this content. Please check that all variables are defined correctly."
    details={error}
    className="w-full"
  />
);

const MarkdownDocumentView: React.FC<MarkdownDocumentViewProps> = ({
  control,
  content,
  variables = {},
  errors = {},
  nextActions = [],
  userAddress,
  initialParams = {},
  isInitializing = false
}) => {
  // Helper function to check if a field should be enabled
  const isFieldEnabled = React.useCallback((variableName: string) => {
    try {
      // If we're initializing, only enable fields in initialParams
      if (isInitializing) {
        return Object.keys(initialParams || {}).includes(variableName);
      }

      // Otherwise check next actions
      if (!nextActions || !Array.isArray(nextActions) || nextActions.length === 0 || !userAddress) {
        return false;
      }

      return nextActions.some(action => {
        if (!action || !action.conditions || !Array.isArray(action.conditions)) {
          return false;
        }
        
        return action.conditions.some((condition: { input: any }) => {
          const input = condition?.input;
          
          if (!input) {
            return false;
          }
          
          if (input.type === 'EVMTransaction') {
            // TODO: Handle EVMTransaction Input types in markdown if applicable
            return false;
          }

          // Check if this variable is in the input's data requirements
          const isFieldInInput = Object.keys(input.data || {}).includes(variableName);
          // Check if the current user is the required issuer
          const isCorrectIssuer = userAddress && input.issuer ? 
            input.issuer.toLowerCase() === userAddress.toLowerCase() : 
            false;
          
          return isFieldInInput && isCorrectIssuer;
        }) || false;
      });
    } catch (error) {
      console.error("Error in isFieldEnabled:", error);
      return false;
    }
  }, [nextActions, userAddress, isInitializing, initialParams]);

  // Create stable components
  const components = React.useMemo<Components>(() => ({
    h1: ({ children }) => <h1 className="text-4xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold mb-2">{children}</h3>,
    p: ({ children, ...props }) => <p className="text-base mb-4" {...props}>{children}</p>,
    ul: ({ children }) => (
      <ul className="mb-4">
        {React.Children.map(children, (child) => {
          if (typeof child === 'string') {
            return <li>{child}</li>;
          }
          return child;
        })}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4">
        {React.Children.map(children, (child) => {
          if (typeof child === 'string') {
            return <li>{child}</li>;
          }
          return child;
        })}
      </ol>
    ),
    li: ({ children }) => {
      const content = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return <span className="text-base">{child}</span>;
        }
        return child;
      });

      return (
        <li className="flex-row">
          <span className="text-base">• </span>
          {content}
        </li>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4">{children}</blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 font-mono text-sm">{children}</code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 mb-4">{children}</pre>
    ),
    a: ({ children, href }) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline">{children}</a>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    u: ({ children }) => <u className="underline">{children}</u>,
    div: ({ className, children, ...props }: any) => {
      if (className === 'variable-input' && props['data-name']) {
        const variableName = props['data-name'];
        const variable = variables[variableName];
        const enabled = isFieldEnabled(variableName);
        
        if (variable) {
          return (
            <Controller
              control={control}
              name={variableName}
              rules={createValidationRules(variable)}
              render={({ field: { onChange, value, onBlur } }) => (
                <VariableInput
                  variable={variable}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors[variableName]}
                  disabled={!enabled}
                />
              )}
            />
          );
        }
        // Return a fallback when variable is not found
        return <div className={className}>Unknown variable: {variableName}</div>;
      }
      return <div className={className}>{children}</div>;
    },
    span: ({ className, children, ...props }: SpanProps) => {
      if (className === 'variable-input' && props['data-name']) {
        const variableName = props['data-name'];
        const variable = variables[variableName];
        const enabled = isFieldEnabled(variableName);
        
        if (variable) {
          return (
            <Controller
              control={control}
              name={variableName}
              rules={createValidationRules(variable)}
              render={({ field: { onChange, value, onBlur } }) => (
                <VariableInput
                  variable={variable}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors[variableName]}
                  disabled={!enabled}
                />
              )}
            />
          );
        }
        // Return a fallback when variable is not found
        return <span className={className}>Unknown variable: {variableName}</span>;
      }
      return <span className={className}>{children}</span>;
    }
  }), [variables, control, errors, isFieldEnabled]);

  const renderContent = React.useCallback(() => {
    let markdownContent: string;

    if (content.type === 'md') {
      markdownContent = content.data as string;
    } else if (content.type === 'mdast') {
      const processor = unified()
        .use(remarkStringify as any);
      
      const result = processor.stringify(content.data as Root);
      markdownContent = typeof result === 'string' ? result : String(result);
    } else {
      return null;
    }

    const processedContent = markdownContent.replace(
      /\$\{variables\.([^}]+)\}/g,
      (match, variablePath) => {
        try {
          // Split the path into parts (e.g. "partyAName.name" -> ["partyAName", "name"])
          const parts = variablePath.split('.');
          const variableName = parts[0];
          
          if (!variableName || !variables) {
            console.warn(`Missing variable name or variables object: ${match}`);
            return match;
          }
          
          // If there are sub-properties, try to access them directly
          if (parts.length > 1) {
            const variable = variables[variableName];
            if (!variable) {
              console.warn(`Variable not found: ${variableName}`);
              return match;
            }
            
            // Traverse the object to get the nested value
            let nestedValue: any = variable;
            for (let i = 1; i < parts.length; i++) {
              if (nestedValue === null || nestedValue === undefined) {
                console.warn(`Nested property path broken at: ${parts.slice(0, i).join('.')}`);
                return match;
              }
              nestedValue = nestedValue[parts[i]];
            }
            return nestedValue !== undefined ? String(nestedValue) : match;
          }

          // For top-level variables in editable mode, render as input field
          // Use a div instead of span to avoid nesting issues
          return `<div class="variable-input" data-name="${variableName}"></div>`;
        } catch (error) {
          console.error(`Error processing variable: ${match}`, error);
          return match;
        }
      }
    );

    return (
      <article className="prose dark:prose-invert max-w-none">
        <ErrorBoundary 
          fallback={(error: Error) => <MarkdownErrorFallback error={error} />}
        >
          <ReactMarkdown 
            components={components}
            rehypePlugins={[rehypeRaw]}
          >
            {processedContent}
          </ReactMarkdown>
        </ErrorBoundary>
      </article>
    );
  }, [content, variables, components]);

  return (
    <>
      {renderContent()}
    </>
  );
};

export default MarkdownDocumentView; 