import { schema } from "../blocks/BlockNoteSchema.tsx";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useAccount } from "wagmi";

const DocumentView = ({ document, owner, signatories }) => {
    const editor = useCreateBlockNote({
        schema,
        initialContent: document
    })

    const { address } = useAccount();

    if (address.toLowerCase() !== owner && !signatories.find((a) => a === address.toLowerCase())) {
        return <span>You don't have access to this document</span>
    }

    return <BlockNoteView
        editor={editor}
        editable={false}
        slashMenu={false}
    />
}

export default DocumentView;
