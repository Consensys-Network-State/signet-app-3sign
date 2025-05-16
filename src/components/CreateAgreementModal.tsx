import * as React from 'react';
import { Button, Card, CardContent, Dialog, DialogContent, DialogFooter, Alert, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@ds3/ui';
import { AddressAvatar }from '@ds3/web3';
import { useNavigate } from 'react-router';
import { useDocumentStore, Document } from '../store/documentStore';
import mouTemplate from '../templates/mou-template.json';
import mouWithPaymentTemplate from '../templates/grant-with-tx.json';
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
  }[];
  description: string;
}

interface TemplateOption {
  id: string;
  isCustom?: boolean;
  template: Document;
  category: 'default' | 'custom';
}

interface CreateAgreementModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_TEMPLATES: TemplateOption[] = [
  {
    id: 'mou',
    category: 'default',
    template: mouTemplate as Document
  }, 
  {
    id: 'mou-with-payment',
    category: 'default',
    template: mouWithPaymentTemplate as Document
  }
];

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
          onClick={() => setIsOpen(true)}
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
            <Button variant='ghost' onClick={() => setIsOpen(false)}>
              <Button.Text>Cancel</Button.Text>
            </Button>
          </DialogClose>
          <Button 
            variant="soft" 
            color="error" 
            onClick={handleDelete} 
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
        selectedOption.template.contracts,
        selectedOption.template.execution
      );
      onClose();
      navigate(`/drafts/${draftId}`);
    } else {
      const template = selectedOption.template;
      const draftId = createDraft(
        template.metadata.name,
        template.content.data,
        template.variables,
        template.contracts,
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
  const templateContent = React.useMemo<TemplateInfo | null>(() => {
    if (!selectedTemplateInfo) return null;

    const smartContracts = selectedTemplateInfo.template.contracts || [{ id: 'None', address: '0x0000000000000000000000000000000000000000' as `0x${string}` }];
    return {
      title: selectedTemplateInfo.template.metadata.name || '',
      author: {
        name: selectedTemplateInfo.template.metadata.author || '',
        address: '0x0000000000000000000000000000000000000000' as `0x${string}`
      },
      smartContracts: smartContracts.map((contract) => ({
        name: contract.id,
        address: contract.address as `0x${string}`
      })),
      description: selectedTemplateInfo.template?.metadata.description || ''
    }
  }, [selectedTemplateInfo])
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0">
        <DialogHeader className="p-5 border-b border-neutral-6">
          <DialogTitle>Create Agreement</DialogTitle>
        </DialogHeader>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json"
          style={{ display: 'none' }}
        />
        <div className="flex flex-row flex-1">
          {/* Left sidebar */}
          <div className="w-64 border-r border-neutral-6 p-4">
            <div className="flex-col gap-4">
              {/* Default Templates */}
              {groupedTemplates.default.length > 0 && (
                <div className="flex-col gap-2">
                  <p className="text-sm font-medium text-neutral-11">Default Templates</p>
                  {groupedTemplates.default.map((option) => (
                    <div key={option.id} className="flex-row items-center gap-2">
                      <Button
                        variant={selectedTemplate === option.id ? "soft" : "ghost"}
                        color={selectedTemplate === option.id ? "primary" : "neutral"}
                        onClick={() => setSelectedTemplate(option.id)}
                        className="flex-1 justify-start w-full"
                      >
                        <Button.Text>{option.template.metadata.name}</Button.Text>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Templates */}
              {groupedTemplates.custom.length > 0 && (
                <div className="flex-col gap-2">
                  <p className="text-sm font-medium text-neutral-11">Custom Templates</p>
                  {groupedTemplates.custom.map((option) => (
                    <div key={option.id} className="flex-row items-center gap-2">
                      <Button
                        variant={selectedTemplate === option.id ? "soft" : "ghost"}
                        color={selectedTemplate === option.id ? "primary" : "neutral"}
                        onClick={() => setSelectedTemplate(option.id)}
                        className="flex-1 justify-start"
                      >
                        <Button.Text>{option.template.metadata.name}</Button.Text>
                      </Button>
                      <DeleteTemplateDialog
                        onDelete={() => handleDeleteTemplate(option.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6">
            <p className="text-2xl font-semibold mb-6">
              {selectedTemplateInfo?.template?.metadata?.name}
            </p>

            {templateContent && (
              <>
                <div className="flex flex-row gap-8 mb-6">
                  <div className="flex-1">
                    <p className="text-neutral-11 mb-2">Author</p>
                    <div className="flex flex-row items-center gap-2">
                      <AddressAvatar address={templateContent.author.address} className="w-6 h-6" />
                      <p>{templateContent.author.name}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-neutral-11 mb-2">Smart Contracts</p>
                    <div className="flex-1 gap-2">
                      {templateContent.smartContracts.map((contract) => (
                        <div className="flex flex-row items-center gap-2" key={contract.address}>
                          <AddressAvatar address={contract.address} className="w-6 h-6" />
                          <p>{contract.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-3 rounded-lg p-4 mb-6">
                  <p className="text-neutral-11">{templateContent.description}</p>
                </div>
              </>
            )}

            <Card className="mb-6">
              <CardContent>
                <p className="text-neutral-11">Preview</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {importError && (
          <Alert variant="error" className="m-4">
            <p>{importError}</p>
          </Alert>
        )}

        <DialogFooter className="border-t border-neutral-6 p-4">
          <Button variant="soft" color="neutral" className="mr-auto" onClick={handleImportClick}>
            <Button.Text>Import Template</Button.Text>
          </Button>
          <div className="flex flex-row gap-2">
            <Button variant="ghost" onClick={onClose}>
              <Button.Text>Cancel</Button.Text>
            </Button>
            <Button variant="soft" color="primary" onClick={handleCreate}>
              <Button.Text>Create</Button.Text>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgreementModal; 