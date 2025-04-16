import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { View } from 'react-native';
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

interface LocationState {
  draftId: string;
  title: string;
}

interface InlineInputProps {
  name: string;
  variable: any;
  control: any;
  errors: any;
}

const InlineInput: React.FC<InlineInputProps> = ({ name, variable, control, errors }) => {
  const rules: any = {
    required: variable.validation?.required ? `${variable.name} is required` : false,
  };

  // Add address-specific validation if the variable is of type 'address'
  if (variable.type === 'address') {
    rules.validate = (value: string) => isAddress(value) || 'Invalid Ethereum address';
  } else {
    // Add other validation rules for non-address types
    rules.minLength = variable.validation?.minLength ? {
      value: variable.validation.minLength,
      message: `${variable.name} must be at least ${variable.validation.minLength} characters`
    } : undefined;
    rules.maxLength = variable.validation?.maxLength ? {
      value: variable.validation.maxLength,
      message: `${variable.name} must be at most ${variable.validation.maxLength} characters`
    } : undefined;
    rules.pattern = variable.validation?.pattern ? {
      value: new RegExp(variable.validation.pattern),
      message: `Invalid ${variable.name} format`
    } : undefined;
  }

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        if (variable.type === 'address') {
          return (
            <InputField
              {...field}
              variant="underline"
              placeholder={variable.name}
              error={errors[name]?.message}
            >
              {isAddress(field.value) && (
                <AddressAvatar address={field.value} className="w-6 h-6" />
              )}
              <Input.Field />
            </InputField>
          );
        }
        
        return (
          <InputField
            {...field}
            variant="underline"
            placeholder={variable.name}
            error={errors[name]?.message}
          />
        );
      }}
    />
  );
};

interface SpanProps {
  className?: string;
  children?: React.ReactNode;
  'data-name'?: string;
}

const MarkdownDocumentView: React.FC = () => {
  const location = useLocation();
  const { draftId, title } = location.state as LocationState;
  const { getCurrentDraft, setCurrentDraft, updateDraft } = useDocumentStore();
  
  React.useEffect(() => {
    setCurrentDraft(draftId);
  }, [draftId, setCurrentDraft]);

  const draft = getCurrentDraft();
  if (!draft) {
    return null;
  }

  const form = useForm({
    defaultValues: Object.entries(draft.variables).reduce((acc, [key, variable]) => ({
      ...acc,
      [key]: variable.value || ''
    }), {} as Record<string, string>)
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = form;

  const onSubmit = (data: Record<string, string>) => {
    const updatedVariables = Object.entries(draft.variables).reduce((acc, [key, variable]) => ({
      ...acc,
      [key]: {
        ...variable,
        value: data[key]
      }
    }), {} as Record<string, DocumentVariable>);

    updateDraft(draftId, draft.content.data as string, updatedVariables);
  };

  const rightHeader = (
    <Button variant="soft" color="primary" onPress={handleSubmit(onSubmit)}>
      <Button.Text>Save</Button.Text>
    </Button>
  );

  const components: Components = {
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
    // Add a custom component to handle our variable inputs using a standard HTML element
    span: ({ className, children, ...props }: SpanProps) => {
      if (className === 'variable-input' && props['data-name']) {
        const variableName = props['data-name'];
        const variable = draft?.variables[variableName];
        if (variable) {
          return (
            <InlineInput
              name={variableName}
              variable={variable}
              control={control}
              errors={errors}
            />
          );
        }
      }
      return <Text className={className}>{children}</Text>;
    }
  };

  const renderContent = () => {
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

    // Pre-process the content to replace variables with React components
    const processedContent = markdownContent.replace(
      /\$\{variables\.([^}]+)\}/g,
      (match, variableName) => {
        const variable = draft.variables[variableName];
        if (!variable) return match;

        // Use a standard span element with our custom class and data attribute
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
  };

  return (
    <Layout rightHeader={rightHeader}>
      <View className="flex-1 p-8">
        {renderContent()}
      </View>
    </Layout>
  );
};

export default MarkdownDocumentView; 