import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text, Button, Card } from '@ds3/react';
import { useEditStore } from '../store/editorStore';
import { useNavigate } from 'react-router';
import { useBlockNoteStore, BlockNoteMode } from '../store/blockNoteStore';
import Layout from '../layouts/Layout';
import { Plus, Trash2 } from 'lucide-react-native';
import AddressAvatar from '../web3/AddressAvatar';
import CreateAgreementModal from '../components/CreateAgreementModal';
import StatusLabel from '../components/StatusLabel';
import { useAccount } from 'wagmi';
import { GestureResponderEvent } from 'react-native';

type EthereumAddress = `0x${string}`;

// Mock data for published agreements
const MOCK_PUBLISHED = [
  {
    id: '123',
    title: 'Grants Agreement Smith Freeman 2025',
    status: 'signed',
    owner: '0x1234567890123456789012345678901234567890' as EthereumAddress,
  }
];

const AgreementCard: React.FC<{
  title: string;
  status: 'draft' | 'signed';
  owner: EthereumAddress;
  onClick: () => void;
  onDelete?: () => void;
  updatedAt?: string;
}> = ({ title, status, owner, onClick, onDelete, updatedAt }) => (
  <Pressable onPress={onClick}>
    <Card className="w-full hover:bg-neutral-3 transition-colors">
      <View className="flex flex-row items-center justify-between w-full p-4">
        <View className="flex flex-col gap-2 items-start flex-1">
          <Text className="text-lg">{title}</Text>
          <View className="flex flex-row items-center gap-2">
            <AddressAvatar address={owner} className="w-5 h-5" />
            <Text className="text-sm text-neutral-11">{owner}</Text>
          </View>
          {updatedAt && (
            <Text className="text-xs text-neutral-11">
              Last edited {new Date(updatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View className="flex flex-row items-center gap-2">
          <StatusLabel status={status} />
          {onDelete && (
            <Button
              variant="ghost"
              color="error"
              onPress={(e: GestureResponderEvent) => {
                e.stopPropagation();
                onDelete();
              }}
              accessibilityLabel="Delete draft"
            >
              <Button.Icon icon={Trash2} />
            </Button>
          )}
        </View>
      </View>
    </Card>
  </Pressable>
);

const Agreements: React.FC = () => {
  const { drafts, setCurrentDraft, deleteDraft } = useEditStore();
  const { setEditorMode } = useBlockNoteStore();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const { address } = useAccount();

  const handleDraftClick = (draftId: string) => {
    setCurrentDraft(draftId);
    setEditorMode(BlockNoteMode.EDIT);
    navigate('/edit');
  };

  const handlePublishedClick = (id: string) => {
    navigate(`/${id}`);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
  };

  return (
    <Layout
      rightHeader={
        <Button variant="soft" color="primary" onPress={handleCreateNew}>
          <Button.Icon icon={Plus} />
          <Button.Text>Create Agreement</Button.Text>
        </Button>
      }
    >
      <View className="flex flex-col gap-4">
        {drafts.length > 0 && (
          <>
            <Text className="text-lg font-semibold">Drafts</Text>
            {drafts.map(draft => (
              <AgreementCard
                key={draft.id}
                title={draft.title}
                status="draft"
                owner={address as EthereumAddress}
                onClick={() => handleDraftClick(draft.id)}
                onDelete={() => handleDeleteDraft(draft.id)}
                updatedAt={draft.updatedAt}
              />
            ))}
          </>
        )}

        {MOCK_PUBLISHED.length > 0 && (
          <>
            <Text className="text-lg font-semibold mt-4">Published</Text>
            {MOCK_PUBLISHED.map(agreement => (
              <AgreementCard
                key={agreement.id}
                title={agreement.title}
                status="signed"
                owner={agreement.owner}
                onClick={() => handlePublishedClick(agreement.id)}
              />
            ))}
          </>
        )}

        {drafts.length === 0 && MOCK_PUBLISHED.length === 0 && (
          <Text className="text-neutral-11">No agreements found</Text>
        )}
      </View>

      <CreateAgreementModal 
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </Layout>
  );
};

export default Agreements; 