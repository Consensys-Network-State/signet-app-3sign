import { FC } from 'react';
import { Button } from "@ds3/ui";
import { Edit2 as EditIcon } from 'lucide-react-native';

interface DocumentSignatureProps {
  name?: string;
  signature?: string;
  onEdit?: () => void;
  disabled?: boolean;
}

const DocumentSignature: FC<DocumentSignatureProps> = (props) => {
  const {
    signature,
    onEdit,
    disabled
  } = props;

  return (
    <div className="flex flex-col">
      <p className="block color-neutral-11">Signed By:</p>
      <div className="mt-4">
        <div className="flex-row items-center w-fit">
          <div className="border-l-4 border-secondary-9 pl-2 flex-1">
            <p className="text-h2 font-cursive font-normal text-neutral-12">{signature}</p>
          </div>
          {onEdit && !disabled && (
            <div className="flex items-center justify-center ml-3">
              <Button variant="ghost" size="sm" onPress={onEdit}>
                <Button.Icon icon={EditIcon} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentSignature; 