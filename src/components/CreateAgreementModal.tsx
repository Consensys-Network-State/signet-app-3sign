import * as React from 'react';
import { View } from 'react-native';
import { Button, Text, Card, CardContent, Dialog, DialogContent, DialogFooter, Alert, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@ds3/react';
import AddressAvatar from '../web3/AddressAvatar';
import { useNavigate } from 'react-router';
import { useDocumentStore, Document } from '../store/documentStore';
import mouTemplate from '../templates/mou-template.json';
import { Trash2 } from 'lucide-react-native';

interface TemplateInfo {
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

interface TemplateOption {
  id: string;
  title: string;
  selected: boolean;
  type: 'markdown';
  isCustom?: boolean;
  template?: Document;
  category: 'default' | 'custom';
}

interface CreateAgreementModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_TEMPLATES: TemplateOption[] = [
  {
    id: 'mou',
    title: 'Memorandum of Understanding',
    selected: true,
    type: 'markdown',
    category: 'default'
  }
];

const TEMPLATE_INFO: Record<string, TemplateInfo> = {
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

interface DeleteTemplateDialogProps {
  onDelete: () => void;
  disabled?: boolean;
}

const DeleteTemplateDialog: React.FC<DeleteTemplateDialogProps> = ({
  onDelete,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild disabled={disabled}>
        <Button 
          variant="ghost" 
          color="error" 
          onPress={() => setIsOpen(true)}
        >
          <Button.Icon icon={Trash2} />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[520px] max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Delete Template</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' onPress={() => setIsOpen(false)}>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button 
            variant="soft" 
            color="error" 
            onPress={handleDelete} 
            loading={isLoading}
          >
            <Button.Text>{isLoading ? 'Deleting...' : 'Delete'}</Button.Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({ open, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState('mou');
  const [importError, setImportError] = React.useState<string | null>(null);
  const [templateOptions, setTemplateOptions] = React.useState<TemplateOption[]>(DEFAULT_TEMPLATES);
  const navigate = useNavigate();
  const { createDraft } = useDocumentStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load custom templates from localStorage on mount
  React.useEffect(() => {
    const savedTemplates = localStorage.getItem('customTemplates');
    if (savedTemplates) {
      const customTemplates = JSON.parse(savedTemplates) as TemplateOption[];
      // Ensure all custom templates have the category property
      const updatedCustomTemplates = customTemplates.map(template => ({
        ...template,
        category: 'custom' as const
      }));
      setTemplateOptions([...DEFAULT_TEMPLATES, ...updatedCustomTemplates]);
    }
  }, []);

  const validateTemplate = (template: any): template is Document => {
    if (!template.metadata || !template.variables || !template.content) {
      setImportError('Invalid template format: missing required fields');
      return false;
    }

    if (!template.metadata.name || !template.metadata.author) {
      setImportError('Invalid template format: missing required metadata');
      return false;
    }

    if (template.content.type !== 'md' && template.content.type !== 'mdast') {
      setImportError('Invalid template format: unsupported content type');
      return false;
    }

    return true;
  };

  const handleImportClick = () => {
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedTemplate = JSON.parse(text);

      if (!validateTemplate(parsedTemplate)) {
        return;
      }

      // Create a new template option
      const newTemplate: TemplateOption = {
        id: `custom-${Date.now()}`,
        title: parsedTemplate.metadata.name,
        selected: false,
        type: 'markdown',
        isCustom: true,
        template: parsedTemplate,
        category: 'custom'
      };

      // Update template options
      const updatedOptions = [...templateOptions, newTemplate];
      setTemplateOptions(updatedOptions);

      // Save to localStorage
      const customTemplates = updatedOptions.filter(opt => opt.isCustom);
      localStorage.setItem('customTemplates', JSON.stringify(customTemplates));

      // Select the new template
      setSelectedTemplate(newTemplate.id);
    } catch (error) {
      setImportError('Failed to parse template file. Please ensure it is a valid JSON file.');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (DEFAULT_TEMPLATES.some(t => t.id === templateId)) {
      return; // Don't allow deleting default templates
    }

    const updatedOptions = templateOptions.filter(opt => opt.id !== templateId);
    setTemplateOptions(updatedOptions);

    // Update localStorage
    const customTemplates = updatedOptions.filter(opt => opt.isCustom);
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));

    // If the deleted template was selected, select the first template
    if (selectedTemplate === templateId) {
      setSelectedTemplate(updatedOptions[0].id);
    }
  };

  const handleCreate = React.useCallback(() => {
    const selectedOption = templateOptions.find(opt => opt.id === selectedTemplate);
    if (!selectedOption) return;

    if (selectedOption.isCustom && selectedOption.template) {
      const draftId = createDraft(
        selectedOption.template.metadata.name,
        selectedOption.template.content.data as string,
        selectedOption.template.variables,
        selectedOption.template.execution
      );
      onClose();
      navigate(`/drafts/${draftId}`);
    } else {
      const template = mouTemplate as Document;
      const draftId = createDraft(
        template.metadata.name,
        template.content.data,
        template.variables,
        template.execution
      );
      onClose();
      navigate(`/drafts/${draftId}`);
    }
  }, [selectedTemplate, templateOptions, onClose, navigate, createDraft]);

  // Group templates by category
  const groupedTemplates = React.useMemo(() => {
    const groups = {
      default: [] as TemplateOption[],
      custom: [] as TemplateOption[]
    };
    
    templateOptions.forEach(template => {
      groups[template.category].push(template);
    });
    
    return groups;
  }, [templateOptions]);

  const selectedTemplateInfo = templateOptions.find(opt => opt.id === selectedTemplate);
  const templateContent = selectedTemplateInfo?.isCustom 
    ? {
        title: selectedTemplateInfo.template?.metadata.name || '',
        author: {
          name: selectedTemplateInfo.template?.metadata.author || '',
          address: '0x0000000000000000000000000000000000000000' as `0x${string}`
        },
        smartContracts: {
          name: 'None',
          address: '0x0000000000000000000000000000000000000000' as `0x${string}`
        },
        description: selectedTemplateInfo.template?.metadata.description || ''
      }
    : TEMPLATE_INFO[selectedTemplate];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json"
          style={{ display: 'none' }}
        />
        <View className="flex-row flex-1">
          {/* Left sidebar */}
          <View className="w-64 border-r border-neutral-6 p-4">
            <View className="flex-col gap-4">
              {/* Default Templates */}
              {groupedTemplates.default.length > 0 && (
                <View className="flex-col gap-2">
                  <Text className="text-sm font-medium text-neutral-11">Default Templates</Text>
                  {groupedTemplates.default.map((option) => (
                    <View key={option.id} className="flex-row items-center gap-2">
                      <Button
                        variant={selectedTemplate === option.id ? "soft" : "ghost"}
                        color={selectedTemplate === option.id ? "primary" : "neutral"}
                        onPress={() => setSelectedTemplate(option.id)}
                        className="flex-1 justify-start"
                      >
                        <Text>{option.title}</Text>
                      </Button>
                    </View>
                  ))}
                </View>
              )}

              {/* Custom Templates */}
              {groupedTemplates.custom.length > 0 && (
                <View className="flex-col gap-2">
                  <Text className="text-sm font-medium text-neutral-11">Custom Templates</Text>
                  {groupedTemplates.custom.map((option) => (
                    <View key={option.id} className="flex-row items-center gap-2">
                      <Button
                        variant={selectedTemplate === option.id ? "soft" : "ghost"}
                        color={selectedTemplate === option.id ? "primary" : "neutral"}
                        onPress={() => setSelectedTemplate(option.id)}
                        className="flex-1 justify-start"
                      >
                        <Text>{option.title}</Text>
                      </Button>
                      <DeleteTemplateDialog
                        onDelete={() => handleDeleteTemplate(option.id)}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Main content */}
          <View className="flex-1 p-6">
            <Text className="text-2xl font-semibold mb-6">
              {selectedTemplateInfo?.title}
            </Text>

            {templateContent && (
              <>
                <View className="flex-row gap-8 mb-6">
                  <View className="flex-1">
                    <Text className="text-neutral-11 mb-2">Author</Text>
                    <View className="flex-row items-center gap-2">
                      <AddressAvatar address={templateContent.author.address} className="w-6 h-6" />
                      <Text>{templateContent.author.name}</Text>
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-neutral-11 mb-2">Smart Contracts</Text>
                    <View className="flex-row items-center gap-2">
                      <AddressAvatar address={templateContent.smartContracts.address} className="w-6 h-6" />
                      <Text>{templateContent.smartContracts.name}</Text>
                    </View>
                  </View>
                </View>

                <View className="bg-neutral-3 rounded-lg p-4 mb-6">
                  <Text className="text-neutral-11">{templateContent.description}</Text>
                </View>
              </>
            )}

            <Card className="mb-6">
              <CardContent>
                <Text className="text-neutral-11">Preview</Text>
              </CardContent>
            </Card>
          </View>
        </View>

        {importError && (
          <Alert variant="error" className="m-4">
            <Text>{importError}</Text>
          </Alert>
        )}

        <DialogFooter className="border-t border-neutral-6 p-4">
          <Button variant="soft" color="neutral" className="mr-auto" onPress={handleImportClick}>
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