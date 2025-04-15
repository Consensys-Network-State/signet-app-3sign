import * as React from 'react';
import { View } from 'react-native';
import { Button, Text, Card, CardContent, Dialog, DialogContent, DialogFooter } from '@ds3/react';
import AddressAvatar from '../web3/AddressAvatar';
import { useNavigate } from 'react-router';
import { useEditStore } from '../store/editorStore';
import { useBlockNoteStore, BlockNoteMode } from '../store/blockNoteStore';
import { useDocumentStore } from '../store/documentStore';
import newAgreement from '../templates/new-agreement.json';
import grantAgreement from '../templates/grant-agreement.json';
import mouTemplate from '../templates/mou-template.json';
import { Block } from '../blocks/BlockNoteSchema';

interface CreateAgreementModalProps {
  open: boolean;
  onClose: () => void;
}

interface TemplateContent {
  title: string;
  author: {
    name: string;
    address: `0x${string}`;
  };
  smartContracts: {
    name: string;
    address: `0x${string}`;
  };
  description: string;
}

const TEMPLATE_OPTIONS = [
  {
    id: 'grants',
    title: 'Grants Agreement',
    selected: true,
    type: 'blocknote'
  },
  {
    id: 'empty',
    title: 'Empty Template',
    selected: false,
    type: 'blocknote'
  },
  {
    id: 'mou',
    title: 'Memorandum of Understanding',
    selected: false,
    type: 'markdown'
  }
];

const TEMPLATE_CONTENT: Record<string, TemplateContent> = {
  grants: {
    title: 'Grants Agreement',
    author: {
      name: 'Lawyer Co',
      address: '0x1234567890123456789012345678901234567890',
    },
    smartContracts: {
      name: 'Sabler',
      address: '0x1234567890123456789012345678901234567890',
    },
    description: 'A comprehensive template for grant agreements, including monthly unlock schedules and standard legal clauses.',
  },
  empty: {
    title: 'Empty Template',
    author: {
      name: 'Legal Team',
      address: '0x1234567890123456789012345678901234567890',
    },
    smartContracts: {
      name: 'None',
      address: '0x1234567890123456789012345678901234567890',
    },
    description: 'Start with a blank template to create your own custom agreement from scratch.',
  },
  mou: {
    title: 'Memorandum of Understanding',
    author: {
      name: 'Agreements Protocol',
      address: '0x1234567890123456789012345678901234567890',
    },
    smartContracts: {
      name: 'None',
      address: '0x1234567890123456789012345678901234567890',
    },
    description: 'A template for non-binding memorandum of understanding between two parties, with support for variable interpolation and markdown formatting.',
  },
};

const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({ open, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState('grants');
  const content = TEMPLATE_CONTENT[selectedTemplate];
  const navigate = useNavigate();
  const { createDraft } = useEditStore();
  const { setEditorMode } = useBlockNoteStore();
  const { createDraft: createMarkdownDraft } = useDocumentStore();

  const handleCreate = React.useCallback(() => {
    const selectedOption = TEMPLATE_OPTIONS.find(opt => opt.id === selectedTemplate);
    
    if (selectedOption?.type === 'markdown') {
      // Create a markdown draft using documentStore
      const draftId = createMarkdownDraft(
        content.title,
        mouTemplate.content.data,
        Object.entries(mouTemplate.variables).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: {
            ...value,
            id: key
          }
        }), {})
      );
      onClose();
      navigate('/markdown-editor', { 
        state: { 
          draftId,
          title: content.title
        }
      });
    } else {
      // For Blocknote templates, use existing flow
      const template = selectedTemplate === 'grants' 
        ? grantAgreement as unknown as Block[]
        : newAgreement as unknown as Block[];
      const draftId = createDraft(content.title, template);
      setEditorMode(BlockNoteMode.EDIT);
      onClose();
      navigate('/edit');
    }
  }, [onClose, navigate, createDraft, createMarkdownDraft, content.title, setEditorMode, selectedTemplate]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        <View className="flex-row flex-1">
          {/* Left sidebar */}
          <View className="w-64 border-r border-neutral-6 p-4">
            <View className="flex-col gap-2">
              {TEMPLATE_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedTemplate === option.id ? "soft" : "ghost"}
                  color={selectedTemplate === option.id ? "primary" : "neutral"}
                  onPress={() => setSelectedTemplate(option.id)}
                  className="justify-start w-full"
                >
                  <Text>{option.title}</Text>
                </Button>
              ))}
            </View>
          </View>

          {/* Main content */}
          <View className="flex-1 p-6">
            <Text className="text-2xl font-semibold mb-6">{content.title}</Text>

            <View className="flex-row gap-8 mb-6">
              <View className="flex-1">
                <Text className="text-neutral-11 mb-2">Author</Text>
                <View className="flex-row items-center gap-2">
                  <AddressAvatar address={content.author.address} className="w-6 h-6" />
                  <Text>{content.author.name}</Text>
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-neutral-11 mb-2">Smart Contracts</Text>
                <View className="flex-row items-center gap-2">
                  <AddressAvatar address={content.smartContracts.address} className="w-6 h-6" />
                  <Text>{content.smartContracts.name}</Text>
                </View>
              </View>
            </View>

            <View className="bg-neutral-3 rounded-lg p-4 mb-6">
              <Text className="text-neutral-11">{content.description}</Text>
            </View>

            <Card className="mb-6">
              <CardContent>
                <Text className="text-neutral-11">Preview</Text>
              </CardContent>
            </Card>
          </View>
        </View>

        <DialogFooter className="border-t border-neutral-6 p-4">
          <Button variant="soft" color="neutral" className="mr-auto">
            <Text>Import Template</Text>
          </Button>
          <View className="flex-row gap-2">
            <Button variant="ghost" onPress={onClose}>
              <Text>Cancel</Text>
            </Button>
            <Button variant="soft" color="primary" onPress={handleCreate}>
              <Text>Create</Text>
            </Button>
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgreementModal; 