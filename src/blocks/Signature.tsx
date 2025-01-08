import { FC } from 'react';

interface SignatureProps {
  name?: string;
  address?: string;
}

const Signature: FC<SignatureProps> = (props) => {
  const {
    name = "SupC0D3R",
    address = "0xA8fa580C55BDC32e678f27EE9EAf608f2cE7fF"
  } = props;
  return (
    <div className="mb-4">
      <div className="mb-4 color-neutral-11">Signed By:</div>

      <div className="border-l-4 border-secondary-9 pl-2">
        <div className="text-12 color-neutral-12">{name}</div>
        <div className="color-neutral-a11">{address}</div>
      </div>
    </div>
  );
};

export default Signature;
