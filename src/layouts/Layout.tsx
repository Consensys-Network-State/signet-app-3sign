import * as React from "react";
import { View } from "react-native";
import {Icon, ModeToggle, Text, Button, Input} from "@ds3/react";
import Account from "../web3/Account.tsx";
import { H4 } from "@ds3/react/src/components/Heading.tsx";
import { Info, ChevronLeft } from 'lucide-react-native';
import { useNavigate, useLocation } from 'react-router';
import { useEditStore } from '../store/editorStore';
import StatusLabel from '../components/StatusLabel';

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
  const { getCurrentDraft, updateDraftTitle } = useEditStore();
  const isEditMode = location.pathname === '/edit';
  const currentDraft = isEditMode ? getCurrentDraft() : null;
  const [title, setTitle] = React.useState(currentDraft?.title || 'Untitled Agreement');
  
  React.useEffect(() => {
    if (currentDraft) {
      setTitle(currentDraft.title);
    }
  }, [currentDraft]);

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
    if (currentDraft) {
      updateDraftTitle(currentDraft.id, newTitle);
    }
  };

  return (
    <View className="h-screen bg-neutral-1">
      <View className="flex flex-col h-full">

        {/* Navbar */}
        <View className="bg-neutral-1 shadow-md sticky top-0 z-20">
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
            {isEditMode ? (
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
                  <StatusLabel status="draft" />
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

        {/* Main Content */}
        <View className="flex-1 flex-grow overflow-y-auto">
          <View className="mx-auto w-full max-w-[1200px] p-8 m-12 rounded-4">
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}

export default Layout;