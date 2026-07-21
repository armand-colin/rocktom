import { useEffect } from "react";
import { useMutation } from "../../hooks/useMutation";
import { DocumentQueries } from "../../queries/document/DocumentQueries";
import { Popup } from "../popup/Popup";
import type { DocumentEntity } from "../../queries/document/DocumentEntity";
import { Button } from "../button/Button";
import { FileInput } from "../input/FileInput";
import './SelectDocumentPopup.scss'
import { Icon } from "../icon/Icon";
import { PopupManager } from "../../resources/PopupManager";
import { ConfirmPopup } from "../popup/confirmPopup/ConfirmPopup";
import { Instance } from "../../Instance";

export interface Props {
    close: () => void,
    selected?: string,
    onSelect: (document: DocumentEntity) => void
}

export function SelectDocumentPopup(props: Props) {
    const { data: documents, mutate: getAllDocuments } = useMutation(DocumentQueries.getAll)
    const { mutate: uploadDocument } = useMutation(DocumentQueries.upload)

    useEffect(() => {
        getAllDocuments()
    }, [])

    function onFileSelected(file: File | null) {
        if (!file) {
            return
        }

        uploadDocument(file)
            .then(() => getAllDocuments())
    }

    function onDeleteDocument(document: DocumentEntity) {
        
    }

    function onAskDeleteDocument(document: DocumentEntity) {
        Instance.engine.getResource(PopupManager).add(close => <ConfirmPopup
            close={close}
            text="Are you sure you want to delete this document?"
            onConfirm={() => onAskDeleteDocument(document)}
        />)
    }

    return <Popup.BaseContainer className="SelectDocumentPopup">
        <Popup.BaseTitle
            title="Select document"
            close={props.close}
        />
        <div>
            <FileInput
                hidden
                onChange={onFileSelected}
                id="playback-file"
                name="playback-file"
            />
            <Button primitive="label" htmlFor="playback-file">
                Upload
            </Button>
            {
                documents ?
                    documents.ok ?
                        <ul>
                            {documents.value.map(document => <DocumentItem
                                key={document.id}
                                document={document}
                                selected={props.selected === document.id}
                                onClick={() => {
                                    props.onSelect(document)
                                    props.close()
                                }}
                                onDelete={() => onAskDeleteDocument(document)}
                            />)}
                        </ul> :
                        <></> :
                    <>Loading...</>
            }
        </div>
    </Popup.BaseContainer>

}

function DocumentItem(props: {
    document: DocumentEntity,
    selected: boolean,
    onClick: () => void,
    onDelete: () => void
}) {
    return <li
        className="DocumentItem"
        data-selected={!!props.selected}
        onClick={props.onClick}
    >
        <span>{props.document.filename}</span>
        <span>{props.document.duration}</span>
        <Button shape="square" onClick={props.onDelete}>
            <Icon name="delete" />
        </Button>
    </li>
}