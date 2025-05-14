import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text, Button, Card } from '@ds3/ui';
import { useDocumentStore } from '../store/documentStore';
import { useNavigate } from 'react-router';
import Layout from '../layouts/Layout';
import { Plus } from 'lucide-react-native';
import { AddressAvatar } from '@ds3/web3';
import CreateAgreementModal from '../components/CreateAgreementModal';
import StatusLabel from '../components/StatusLabel';
import { useAccount } from 'wagmi';
import DeleteDraftDialog from '../components/DeleteDraftDialog';
import { useQuery } from '@tanstack/react-query';
import { getAgreementByUserId } from '../api';
import { useEffect } from 'react';
import { Document } from '../store/documentStore';

type EthereumAddress = `0x${string}`;

const AgreementCard: React.FC<{
  title: string;
  status: 'draft' | 'signed';
  owner: EthereumAddress;
  onClick: () => void;
  onDelete?: () => void;
  updatedAt?: string;
  state?: {
    name: string;
    description: string;
  };
}> = ({ title, status, owner, onClick, onDelete, updatedAt, state }) => (
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
          <StatusLabel 
            status={status === 'draft' ? 'warning' : undefined} 
            text={status === 'draft' ? 'Draft' : state?.name || 'Published'} 
          />
          {onDelete && (
            <DeleteDraftDialog onDelete={onDelete} />
          )}
        </View>
      </View>
    </Card>
  </Pressable>
);

const Agreements: React.FC = () => {
  const { drafts, setCurrentDraft, deleteDraft, addAgreements, agreements: savedAgreements } = useDocumentStore();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const { address } = useAccount();

  const { data: agreements, isLoading: isLoadingAgreements } = useQuery({
    queryKey: ['agreements', address],
    queryFn: () => getAgreementByUserId(address as string),
    refetchOnMount: 'always' as const,
  });

  useEffect(() => {
    if (!isLoadingAgreements && agreements) {
      addAgreements(agreements.data || [])
    }
  }, [agreements, isLoadingAgreements, addAgreements])

  const handleDraftClick = (draftId: string) => {
    setCurrentDraft(draftId);
    navigate(`/drafts/${draftId}`);
  };

  const handlePublishedClick = (id: string) => {
    navigate(`/agreements/${id}`);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteDraft = (draftId: string) => {
    localStorage.removeItem(`draft_${draftId}_values`);
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
      <View className="flex flex-col gap-4 pt-8 pb-8 px-8">
        {drafts.length > 0 && (
          <>
            <Text className="text-lg font-semibold">Drafts</Text>
            {drafts.map((draft: Document) => (
              <AgreementCard
                key={draft.id}
                title={draft.metadata.name}
                status="draft"
                owner={address as EthereumAddress}
                onClick={() => draft.id && handleDraftClick(draft.id)}
                onDelete={() => draft.id && handleDeleteDraft(draft.id)}
                state={{ name: 'Draft', description: 'Document is in draft state' }}
                updatedAt={(draft as any).updatedAt || draft.metadata.createdAt}
              />
            ))}
          </>
        )}

        {savedAgreements.length > 0 && (
          <>
            <Text className="text-lg font-semibold mt-4">Published</Text>
            {savedAgreements.map(agreement => (
              <AgreementCard
                key={agreement.id}
                title={agreement?.document?.metadata?.name}
                status="signed"
                owner={agreement.contributors[0] as EthereumAddress}
                onClick={() => handlePublishedClick(agreement.id)}
                state={agreement.state.State}
                updatedAt={agreement.updatedAt}
              />
            ))}
          </>
        )}

        {drafts.length === 0 && savedAgreements.length === 0 && (
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