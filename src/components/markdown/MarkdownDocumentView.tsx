import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { View } from 'react-native';
import { Button, Text, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@ds3/react';
import Layout from '../../layouts/Layout';
import { Share2 } from 'lucide-react-native';
import { InputClipboard } from '../InputClipboard';
import { useDocumentStore } from '../../store/documentStore';
import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import ReactMarkdown from 'react-markdown';
import type { Root } from 'mdast';
import type { Components } from 'react-markdown';

interface LocationState {
  draftId: string;
  title: string;
}

const MarkdownDocumentView: React.FC = () => {
  const location = useLocation();
  const { draftId, title } = location.state as LocationState;
  const { getCurrentDraft, setCurrentDraft } = useDocumentStore();
  
  // Set the current draft when the component mounts
  React.useEffect(() => {
    setCurrentDraft(draftId);
  }, [draftId, setCurrentDraft]);

  const draft = getCurrentDraft();
  if (!draft) {
    return null;
  }

  const rightHeader = (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="soft">
          <Button.Icon icon={Share2}/>
          <Button.Text>Share</Button.Text>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            <Text>Shareable link to this agreement</Text>
          </DialogDescription>
        </DialogHeader>
        <InputClipboard value={`${window.location.origin}${location.pathname}`} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='soft' color="primary">
              <Text>Close</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const components: Components = {
    h1: ({ children }) => (
      <Text className="text-4xl font-bold mb-4">{children}</Text>
    ),
    h2: ({ children }) => (
      <Text className="text-3xl font-bold mb-3">{children}</Text>
    ),
    h3: ({ children }) => (
      <Text className="text-2xl font-bold mb-2">{children}</Text>
    ),
    p: ({ children }) => (
      <Text className="text-base mb-4">{children}</Text>
    ),
    ul: ({ children }) => (
      <View className="list-disc list-inside mb-4">{children}</View>
    ),
    ol: ({ children }) => (
      <View className="list-decimal list-inside mb-4">{children}</View>
    ),
    li: ({ children }) => (
      <Text className="text-base">{children}</Text>
    ),
    blockquote: ({ children }) => (
      <View className="border-l-4 border-gray-300 pl-4 italic mb-4">{children}</View>
    ),
    code: ({ children }) => (
      <Text className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 font-mono text-sm">{children}</Text>
    ),
    pre: ({ children }) => (
      <View className="bg-gray-100 dark:bg-gray-800 rounded p-4 mb-4">{children}</View>
    ),
    a: ({ children, href }) => (
      <Text className="text-blue-600 dark:text-blue-400 hover:underline">{children}</Text>
    ),
    strong: ({ children }) => (
      <Text className="font-bold">{children}</Text>
    ),
    em: ({ children }) => (
      <Text className="italic">{children}</Text>
    ),
  };

  const renderContent = () => {
    let markdownContent: string;

    if (draft.content.type === 'md') {
      markdownContent = draft.content.data as string;
    } else if (draft.content.type === 'mdast') {
      // Convert mdast to markdown string
      const processor = unified()
        .use(remarkStringify as any);
      
      const result = processor.stringify(draft.content.data as Root);
      markdownContent = typeof result === 'string' ? result : String(result);
    } else {
      return null;
    }

    return (
      <View className="prose dark:prose-invert max-w-none">
        <ReactMarkdown components={components}>{markdownContent}</ReactMarkdown>
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