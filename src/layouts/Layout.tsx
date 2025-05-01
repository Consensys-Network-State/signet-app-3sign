import * as React from "react";
import { View } from "react-native";
import {Icon, ModeToggle, Text, Button, Input} from "@ds3/react";
import Account from "../web3/Account.tsx";
import { H4 } from "@ds3/react/src/components/Heading.tsx";
import { Info, ChevronLeft } from 'lucide-react-native';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useEditStore } from '../store/editorStore';
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
}

const Layout: React.FC<LayoutProps> = ({ children, rightHeader, status }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { getCurrentDraft, updateDraftTitle } = useEditStore();
  const { getCurrentDraft: getCurrentMarkdownDraft, updateDraftTitle: updateMarkdownDraftTitle } = useDocumentStore();
  const isEditMode = location.pathname === '/edit';
  const isDraftMode = location.pathname.startsWith('/drafts/');
  
  const blockNoteDraft = isEditMode ? getCurrentDraft() : null;
  const markdownDraft = isDraftMode ? getCurrentMarkdownDraft() : null;
  
  const [title, setTitle] = React.useState(
    blockNoteDraft?.title || 
    markdownDraft?.metadata.name || 
    'Untitled Agreement'
  );
  
  React.useEffect(() => {
    if (blockNoteDraft) {
      setTitle(blockNoteDraft.title);
    } else if (markdownDraft) {
      setTitle(markdownDraft.metadata.name);
    }
  }, [blockNoteDraft, markdownDraft]);

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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (blockNoteDraft) {
      updateDraftTitle(blockNoteDraft.id, newTitle);
    } else if (markdownDraft) {
      updateMarkdownDraftTitle(markdownDraft.id, newTitle);
    }
  };

  // Check if we should show the side menu
  const showSideMenu = Boolean(params.draftId || params.agreementId || params.documentId);

  return (
    <View className="h-screen bg-neutral-1 flex flex-col">
      {/* Navbar */}
      <View className="bg-neutral-1 shadow-md z-20">
        {/* Status Message */}
        {status && (
          <View className={`w-full flex flex-row h-14 items-center justify-between px-8 py-2 ${getStatusBackgroundColor(status.type)}`}>
            <View className="flex flex-row items-center">
              <Icon className="mr-2" icon={Info} />
              <Text>{status.message}</Text>
            </View>
            { status.actions &&
              <View className="flex flex-row items-center px-4 gap-2">
                {status.actions}
              </View>
            }
          </View>
        )}

        <View className="flex flex-row items-center justify-between px-8 py-6">
          {(isEditMode || isDraftMode) ? (
            <View className="flex flex-row items-center gap-2">
              <Button
                variant="ghost"
                onPress={() => navigate('/')}
                className="flex items-center justify-center h-10"
              >
                <Button.Icon icon={ChevronLeft} />
              </Button>
              <View className="flex flex-row items-center gap-2">
                <Input
                  value={title}
                  variant="ghost"
                  className="text-primary-12 text-xl font-semibold h-10"
                  {...{ onChangeText: handleTitleChange }}
                >
                  <Input.Field />
                </Input>
              </View>
            </View>
          ) : (
            <Button
              variant="ghost"
              onPress={() => navigate('/')}
              className="p-0"
            >
              <H4 className="text-primary-12">Agreements</H4>
            </Button>
          )}

          <View className="flex flex-row items-center px-4 gap-2">
            {rightHeader}
            <Account />
            <ModeToggle />
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 min-h-0">
        <View className={`h-full mx-auto w-full transition-all duration-300 ease-in-out ${showSideMenu ? 'max-w-[1520px]' : 'max-w-[1200px]'}`}>
          <View className="flex flex-row gap-2 h-full">
            {/* Content */}
            <View className="flex-1 overflow-auto">
              {children}
            </View>

            {/* Side Menu */}
            {showSideMenu && (
              <View className="w-[320px] overflow-hidden">
                <SideMenu>
                  <ActionSideMenu />
                </SideMenu>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default Layout;