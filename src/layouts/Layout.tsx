import * as React from "react";
import { Icon, ModeToggle, Button, Input, H4, WebChangeEvent } from "@consensys/ui";
import { Account } from "@consensys/ui-web3";
import { Info, ChevronLeft } from 'lucide-react-native';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useDocumentStore } from '../store/documentStore';
import SideMenu from './SideMenu';
import ActionSideMenu from '../components/ActionSideMenu';

interface LayoutProps {
  children?: React.ReactNode;
  rightHeader?: React.ReactNode;
  status?: {
    message: string;
    type?: 'warning' | 'info' | 'error';
    actions?: React.ReactNode;
  };
  isLoading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, rightHeader, status, isLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { getCurrentDraft, updateDraftTitle, getAgreement } = useDocumentStore();
  const isEditMode = location.pathname === '/edit';
  const isDraftMode = location.pathname.startsWith('/drafts/');
  const isDocumentMode = location.pathname.startsWith('/agreements/');
  
  const draft = isDraftMode ? getCurrentDraft() : null;
  const agreement = isDocumentMode ? getAgreement(params.agreementId!) : null;
  
  const [title, setTitle] = React.useState(
    draft?.metadata.name || 
    agreement?.document.metadata?.name ||
    'Untitled Agreement'
  );
  
  React.useEffect(() => {
    if (draft) {
      setTitle(draft.metadata.name);
    } else if (agreement) {
      setTitle(agreement.document.metadata?.name || 'Untitled Agreement');
    }
  }, [draft, agreement]);

  const getStatusBackgroundColor = (type?: 'warning' | 'info' | 'error') => {
    switch (type) {
      case 'warning':
        return 'bg-warning-3';
      case 'error':
        return 'bg-error-3';
      case 'info':
      default:
        return 'bg-primary-3';
    }
  };

  const handleTitleChange = (e: WebChangeEvent) => {
    setTitle(e.target.value);
    if (draft?.id) {
      updateDraftTitle(draft.id, e.target.value);
    }
  };

  // Check if we should show the side menu
  const documentId = params.draftId || params.agreementId || params.documentId;
  const showSideMenu = Boolean(documentId) && !isLoading;

  // Determine if we should show the title input
  const showTitleInput = isEditMode || isDraftMode || isDocumentMode;

  return (
    <div className="h-screen bg-neutral-1 flex flex-col">
      {/* Navbar */}
      <div className="bg-neutral-1 shadow-md z-20">
        {/* Status Message */}
        {status && (
          <div className={`w-full flex flex-row h-14 items-center justify-between px-8 py-2 ${getStatusBackgroundColor(status.type)}`}>
            <div className="flex flex-row items-center">
              <Icon className="mr-2" icon={Info} />
              <p>{status.message}</p>
            </div>
            { status.actions &&
              <div className="flex flex-row items-center px-4 gap-2">
                {status.actions}
              </div>
            }
          </div>
        )}

        <div className="flex flex-row items-center justify-between px-8 py-6">
          {showTitleInput ? (
            <div className="flex flex-row items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center justify-center h-10"
              >
                <Button.Icon icon={ChevronLeft} />
              </Button>
              <div className="flex flex-row items-center gap-2">
                <Input
                  value={title}
                  variant="ghost"
                  className="text-primary-12 text-xl font-semibold h-10"
                  onChange={handleTitleChange}
                  readOnly={isDocumentMode}
                >
                  <Input.Field />
                </Input>
              </div>
            </div>
          ) : (
            <H4 className="text-primary-12">Agreements</H4>
          )}

          <div className="flex flex-row items-center px-4 gap-2">
            {rightHeader}
            <Account />
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <div className={`h-full mx-auto w-full transition-all duration-300 ease-in-out ${showSideMenu ? 'max-w-[1520px]' : 'max-w-[1200px]'}`}>
          <div className="flex flex-row gap-2 h-full">
            {/* Content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>

            {/* Side Menu */}
            {showSideMenu && (
              <div className="w-[320px] overflow-hidden">
                <SideMenu>
                  <ActionSideMenu />
                </SideMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;