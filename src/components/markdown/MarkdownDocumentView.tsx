import * as React from 'react';
import { View, TextInput } from 'react-native';
import { Text, InputField, Input } from '@ds3/react';
import { DocumentVariable } from '../../store/documentStore';
import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { Root } from 'mdast';
import type { Components } from 'react-markdown';
import { Controller } from 'react-hook-form';
import { isAddress } from 'viem';
import AddressAvatar from "../../web3/AddressAvatar.tsx";
import { DatePickerField } from '../../components/DatePickerField';
import dayjs from 'dayjs';

interface SpanProps {
  className?: string;
  children?: React.ReactNode;
  'data-name'?: string;
}

// Create a shared validation function
const createValidationRules = (variable: DocumentVariable) => {
  const rules: Record<string, any> = {
    required: variable.validation?.required ? `${variable.name} is required` : false,
  };

  rules.validate = (value: string) => {
    if (!value) {
      return rules.required || true;
    }

    if (variable.type === 'address' && !isAddress(value)) {
      return 'Invalid Ethereum address';
    }

    if (variable.type === 'dateTime' && !dayjs(value).isValid()) {
      return 'Invalid date';
    }

    const { validation } = variable;
    if (!validation) return true;

    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return `Invalid ${variable.name.toLowerCase()} format`;
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `${variable.name} must be at least ${validation.minLength} characters`;
    }

    if (validation.min) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue < validation.min) {
        return `${variable.name} must be at least ${validation.min}`;
      }
    }

    if (validation.enum && !validation.enum.includes(value)) {
      return `${variable.name} must be one of: ${validation.enum.join(', ')}`;
    }

    return true;
  };

  return rules;
};

// Create a completely isolated input component
const VariableInput = React.memo(({ 
  name, 
  variable, 
  value, 
  onChange, 
  onBlur,
  error,
  disabled = false,
}: { 
  name: string;
  variable: DocumentVariable;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: { message?: string } | string | undefined;
  disabled?: boolean;
}) => {
  const inputRef = React.useRef<TextInput>(null);
  const [localValue, setLocalValue] = React.useState(value);
  const [localError, setLocalError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateValue = React.useCallback((newValue: string) => {
    const rules = createValidationRules(variable);
    const result = rules.validate(newValue);
    return result === true ? undefined : result;
  }, [variable]);

  const handleChange = React.useCallback((newValue: string) => {
    setLocalValue(newValue);
    const validationError = validateValue(newValue);
    setLocalError(validationError);
    onChange(newValue);
  }, [onChange, validateValue]);

  const errorMessage = localError || (typeof error === 'string' ? error : error?.message);

  if (variable.type === 'address') {
    return (
      <InputField
        // @ts-ignore - using RN TextInput interface
        ref={inputRef}
        value={localValue}
        onChangeText={handleChange}
        variant="underline"
        placeholder={variable.name}
        error={errorMessage}
        className="w-[300px]"
        disabled={disabled}
      >
        {isAddress(localValue) && (
          <AddressAvatar address={localValue} className="w-6 h-6" />
        )}
        <Input.Field />
      </InputField>
    );
  }

  if (variable.type === 'dateTime') {
    return (
      <DatePickerField
        value={localValue ? dayjs(localValue) : undefined}
        onChange={(date) => handleChange(date ? date.format() : '')}
        placeholder="Select date"
        error={errorMessage}
        className="w-[300px]"
        disabled={disabled}
      />
    );
  }

  return (
    <InputField
      // @ts-ignore - using RN TextInput interface
      ref={inputRef}
      value={localValue}
      onChangeText={handleChange}
      variant="underline"
      placeholder={variable.name}
      error={errorMessage}
      className="w-[300px]"
      disabled={disabled}
    />
  );
}, (prevProps, nextProps) => {
  const prevError = typeof prevProps.error === 'string' ? prevProps.error : prevProps.error?.message;
  const nextError = typeof nextProps.error === 'string' ? nextProps.error : nextProps.error?.message;
  
  return (
    prevProps.value === nextProps.value &&
    prevError === nextError
  );
});

// Types for the component props
export interface MarkdownDocumentViewProps {
  control: any;
  content: {
    type: 'md' | 'mdast';
    data: string | Root;
  };
  variables?: Record<string, any>;
  errors?: Record<string, any>;
  editableFields?: string[];
}

const MarkdownDocumentView: React.FC<MarkdownDocumentViewProps> = ({
  control,
  content,
  variables = {},
  errors = {},
  editableFields = []
}) => {
  // Create stable components
  const components = React.useMemo<Components>(() => ({
    h1: ({ children }) => <Text className="text-4xl font-bold mb-4">{children}</Text>,
    h2: ({ children }) => <Text className="text-3xl font-bold mb-3">{children}</Text>,
    h3: ({ children }) => <Text className="text-2xl font-bold mb-2">{children}</Text>,
    p: ({ children }) => <Text className="text-base mb-4">{children}</Text>,
    ul: ({ children }) => (
      <View className="mb-4">
        {React.Children.map(children, (child) => {
          if (typeof child === 'string') {
            return <Text>{child}</Text>;
          }
          return child;
        })}
      </View>
    ),
    ol: ({ children }) => (
      <View className="mb-4">
        {React.Children.map(children, (child) => {
          if (typeof child === 'string') {
            return <Text>{child}</Text>;
          }
          return child;
        })}
      </View>
    ),
    li: ({ children }) => {
      const content = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return <Text className="text-base">{child}</Text>;
        }
        return child;
      });

      return (
        <View className="flex-row">
          <Text className="text-base">• </Text>
          {content}
        </View>
      );
    },
    blockquote: ({ children }) => (
      <View className="border-l-4 border-gray-300 pl-4 italic mb-4">{children}</View>
    ),
    code: ({ children }) => (
      <Text className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 font-mono text-sm">{children}</Text>
    ),
    pre: ({ children }) => (
      <View className="bg-gray-100 dark:bg-gray-800 rounded p-4 mb-4">{children}</View>
    ),
    a: ({ children }) => <Text className="text-blue-600 dark:text-blue-400 hover:underline">{children}</Text>,
    strong: ({ children }) => <Text className="font-bold">{children}</Text>,
    em: ({ children }) => <Text className="italic">{children}</Text>,
    u: ({ children }) => <Text className="underline">{children}</Text>,
    span: ({ className, children, ...props }: SpanProps) => {
      if (className === 'variable-input' && props['data-name']) {
        const variableName = props['data-name'];
        const variable = variables[variableName];
        const disabled = !editableFields.find(field => field === variableName);
        if (variable) {
          return (
            <Controller
              control={control}
              name={variableName}
              rules={createValidationRules(variable)}
              render={({ field: { onChange, value, onBlur } }) => (
                <VariableInput
                  name={variableName}
                  variable={variable}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors[variableName]}
                  disabled={disabled}
                />
              )}
            />
          );
        }
      }
      return <Text className={className}>{children}</Text>;
    }
  }), [variables, control, errors, editableFields]);

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
        // Split the path into parts (e.g. "partyAName.name" -> ["partyAName", "name"])
        const parts = variablePath.split('.');
        const variableName = parts[0];
        
        // If there are sub-properties, try to access them directly
        if (parts.length > 1) {
          const variable = variables[variableName];
          if (!variable) return match;
          
          // Traverse the object to get the nested value
          let nestedValue: any = variable;
          for (let i = 1; i < parts.length; i++) {
            nestedValue = nestedValue[parts[i]];
            if (nestedValue === undefined) return match;
          }
          return String(nestedValue);
        }

        // For top-level variables in editable mode, render as input field
        return `<span class="variable-input" data-name="${variableName}"></span>`;
      }
    );

    return (
      <View className="prose dark:prose-invert max-w-none">
        <ReactMarkdown 
          components={components}
          rehypePlugins={[rehypeRaw]}
        >
          {processedContent}
        </ReactMarkdown>
      </View>
    );
  }, [content, variables, components]);

  return (
    <>
      {renderContent()}
    </>
  );
};

export default MarkdownDocumentView; 