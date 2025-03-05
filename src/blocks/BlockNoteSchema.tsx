import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from '@blocknote/core';
import { SablierBlock } from './SablierBlock';
import { SignatureBlock } from './SignatureBlock';
import { WalletAddressInline } from './WalletAddressInline';
import { DateTimeInline } from './DateTimeInline';

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    sablier: SablierBlock,
    signature: SignatureBlock
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    walletAddress: WalletAddressInline,
    dateTime: DateTimeInline,
  },
});

export type Block = typeof schema.Block;
export type { SablierBlock } from './SablierBlock';
export type { SignatureBlock } from './SignatureBlock';
