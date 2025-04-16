import * as React from 'react';
import { useParams } from 'react-router-dom';
import { View, TextInput } from 'react-native';
import { Button, Text, InputField, Input } from '@ds3/react';
import Layout from '../../layouts/Layout';
import { useDocumentStore, DocumentVariable } from '../../store/documentStore';
import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { Root } from 'mdast';
import type { Components } from 'react-markdown';
import { useForm, Controller } from 'react-hook-form';
import { isAddress } from 'viem';
import AddressAvatar from "../../web3/AddressAvatar.tsx";
import { DatePickerField } from '../../components/DatePickerField';
import dayjs from 'dayjs';

interface LocationState {
  draftId: string;
  title: string;
}

interface SpanProps {
  className?: string;
  children?: React.ReactNode;
  'data-name'?: string;
}

// Create a completely isolated input component
const VariableInput = React.memo(({ 
  name, 
  variable, 
  value, 
  onChange, 
  error
}: { 
  name: string;
  variable: DocumentVariable;
  value: string;
  onChange: (value: string) => void;
  error?: { message?: string } | string | undefined;
}) => {
  const inputRef = React.useRef<TextInput>(null);
  const [localValue, setLocalValue] = React.useState(value);
  const [localError, setLocalError] = React.useState<string | undefined>(undefined);

  // Update local value when prop changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateValue = React.useCallback((newValue: string) => {
    if (variable.validation?.required && !newValue) {
      return `${variable.name} is required`;
    }
    if (variable.type === 'address' && newValue && !isAddress(newValue)) {
      return 'Invalid Ethereum address';
    }
    if (variable.type === 'dateTime' && newValue && !dayjs(newValue).isValid()) {
      return 'Invalid date';
    }
    return undefined;
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

const MarkdownDocumentView: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const { getCurrentDraft, setCurrentDraft, updateDraft } = useDocumentStore();
  
  React.useEffect(() => {
    if (draftId) {
      setCurrentDraft(draftId);
    }
  }, [draftId, setCurrentDraft]);

  const draft = getCurrentDraft();
  if (!draftId || !draft) {
    return null;
  }

  // Get initial values from localStorage or draft
  const getInitialValues = React.useCallback(() => {
    const storedValues = localStorage.getItem(`draft_${draftId}_values`);
    if (storedValues) {
      return JSON.parse(storedValues);
    }
    return Object.entries(draft.variables).reduce((acc, [key, variable]) => ({
      ...acc,
      [key]: variable.value || ''
    }), {} as Record<string, string>);
  }, [draftId, draft.variables]);

  const form = useForm({
    defaultValues: getInitialValues(),
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    trigger
  } = form;

  // Watch form values and update localStorage
  React.useEffect(() => {
    const subscription = watch((values) => {
      if (!values) return;
      localStorage.setItem(`draft_${draftId}_values`, JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [watch, draftId]);

  // Only update draft on submit
  const onSubmit = React.useCallback((values: Record<string, string>) => {
    if (!draft) return;

    const updatedVariables = Object.entries(draft.variables).reduce((acc, [key, variable]) => ({
      ...acc,
      [key]: {
        ...variable,
        value: values[key] || ''
      }
    }), {} as Record<string, DocumentVariable>);

    updateDraft(draftId, draft.content.data as string, updatedVariables);
    // Clear localStorage after successful save since values are now persisted in the draft
    localStorage.removeItem(`draft_${draftId}_values`);
  }, [draft, draftId, updateDraft]);

  const rightHeader = (
    <Button 
      variant="soft" 
      color="primary" 
      onPress={handleSubmit(onSubmit)}
    >
      <Button.Text>Save</Button.Text>
    </Button>
  );

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
        const variable = draft?.variables[variableName];
        if (variable) {
          return (
            <Controller
              control={control}
              name={variableName}
              rules={{}}
              render={({ field: { onChange, value } }) => (
                <VariableInput
                  name={variableName}
                  variable={variable}
                  value={value}
                  onChange={onChange}
                  error={errors[variableName]}
                />
              )}
            />
          );
        }
      }
      return <Text className={className}>{children}</Text>;
    }
  }), [draft?.variables, control, errors]);

  const renderContent = React.useCallback(() => {
    let markdownContent: string;

    if (draft.content.type === 'md') {
      markdownContent = draft.content.data as string;
    } else if (draft.content.type === 'mdast') {
      const processor = unified()
        .use(remarkStringify as any);
      
      const result = processor.stringify(draft.content.data as Root);
      markdownContent = typeof result === 'string' ? result : String(result);
    } else {
      return null;
    }

    const processedContent = markdownContent.replace(
      /\$\{variables\.([^}]+)\}/g,
      (match, variableName) => {
        const variable = draft.variables[variableName];
        if (!variable) return match;

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
  }, [draft.content, draft.variables, components]);

  return (
    <Layout rightHeader={rightHeader}>
      <View className="flex-1 p-8">
        {renderContent()}
      </View>
    </Layout>
  );
};

export default MarkdownDocumentView; 