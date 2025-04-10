import * as React from 'react';
import { View } from 'react-native';
import { Text, Button, Card } from '@ds3/react';
import { useEditStore } from '../store/editorStore';
import { useNavigate } from 'react-router';
import { useBlockNoteStore, BlockNoteMode } from '../store/blockNoteStore';
import Layout from '../layouts/Layout';
import { Plus } from 'lucide-react-native';
import AddressAvatar from '../web3/AddressAvatar';
import CreateAgreementModal from '../components/CreateAgreementModal';

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

const MOCK_OWNER_ADDRESS = '0x1234567890123456789012345678901234567890' as EthereumAddress;

const AgreementCard: React.FC<{
  title: string;
  status: 'draft' | 'signed';
  owner: EthereumAddress;
  onClick: () => void;
}> = ({ title, status, owner, onClick }) => (
  <Card className="w-full">
    <Button 
      variant="ghost" 
      onPress={onClick}
      className="w-full p-4"
    >
      <View className="flex flex-row items-center justify-between w-full">
        <View className="flex flex-col gap-2">
          <Text className="text-lg">{title}</Text>
          <View className="flex flex-row items-center gap-2">
            <AddressAvatar address={owner} className="w-5 h-5" />
            <Text className="text-sm text-neutral-11">{owner}</Text>
          </View>
        </View>
        <View>
          <Text 
            className={status === 'signed' ? 'text-success-11' : 'text-neutral-11'}
          >
            {status === 'signed' ? 'Signed' : 'Draft'}
          </Text>
        </View>
      </View>
    </Button>
  </Card>
);

const Agreements: React.FC = () => {
  const { editState } = useEditStore();
  const { setEditorMode } = useBlockNoteStore();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleDraftClick = () => {
    setEditorMode(BlockNoteMode.EDIT);
    navigate('/edit');
  };

  const handlePublishedClick = (id: string) => {
    navigate(`/${id}`);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
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
        {editState && (
          <AgreementCard
            title="Grants Agreement"
            status="draft"
            owner={MOCK_OWNER_ADDRESS}
            onClick={handleDraftClick}
          />
        )}

        {MOCK_PUBLISHED.map(agreement => (
          <AgreementCard
            key={agreement.id}
            title={agreement.title}
            status="signed"
            owner={agreement.owner}
            onClick={() => handlePublishedClick(agreement.id)}
          />
        ))}

        {!editState && MOCK_PUBLISHED.length === 0 && (
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