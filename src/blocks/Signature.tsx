import { FC } from 'react';

interface SignatureProps {
  name?: string;
  address?: string;
}

const Signature: FC<SignatureProps> = (props) => {
  const {
    name,
    address
  } = props;

  return (
    <>
      <div className="mb-4 color-neutral-11">Signed By:</div>
      <div className="border-l-4 border-secondary-9 pl-2">
        <div className="text-12 color-neutral-12">{name}</div>
        <div className="color-neutral-a11">{address}</div>
      </div>
    </>
  );
};

export default Signature;
