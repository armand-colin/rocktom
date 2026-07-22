import { useEffect } from "react";
import { useMutation } from "../../hooks/useMutation";
import { DocumentQueries } from "../../queries/document/DocumentQueries";
import { Popup } from "../popup/Popup";
import type { DocumentEntity } from "../../queries/document/DocumentEntity";
import { Button, ButtonTheme } from "../button/Button";
import { FileInput } from "../input/FileInput";
import './SelectDocumentPopup.scss'
import { Icon } from "../icon/Icon";
import { PopupManager } from "../../resources/PopupManager";
import { ConfirmPopup } from "../popup/confirmPopup/ConfirmPopup";
import { Instance } from "../../Instance";
import { UiSize } from "../UiSize";
import { Spinner } from "../spinner/Spinner";

export interface Props {
    close: () => void,
    selected?: string,
    onSelect: (document: DocumentEntity) => void
}

export function SelectDocumentPopup(props: Props) {
    const { data: documents, mutate: getAllDocuments } = useMutation(DocumentQueries.getAll)
    const { mutate: uploadDocument } = useMutation(DocumentQueries.upload)
    const { mutate: deleteDocument } = useMutation(DocumentQueries.remove)

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

    async function onDeleteDocument(document: DocumentEntity) {
        await deleteDocument(document.id)
            .then(() => getAllDocuments())
            .catch(() => {
                // TODO: do something
            })
    }

    function onAskDeleteDocument(document: DocumentEntity) {
        Instance.engine.getResource(PopupManager).add(close => <ConfirmPopup
            close={close}
            text="Are you sure you want to delete this document?"
            onConfirm={() => onDeleteDocument(document)}
            theme="danger"
        />)
    }

    return <Popup.BaseContainer className="SelectDocumentPopup">
        <Popup.BaseTitle
            title="Select document"
            close={props.close}
        />
        <div className="grid gap-5">
            <FileInput
                hidden
                onChange={onFileSelected}
                id="playback-file"
                name="playback-file"
            />
            {
                documents && documents.ok ?
                    <>
                        <DocumentsList
                            documents={documents.value}
                            selected={props.selected}
                            onClick={(document) => {
                                props.onSelect(document)
                                props.close()
                            }}
                            onDelete={onAskDeleteDocument}
                        />
                        <div className="flex justify-end">
                            <Button
                                primitive="label"
                                htmlFor="playback-file"
                                theme={ButtonTheme.Primary}
                            >
                                <Icon name="add" />
                                Upload
                            </Button>
                        </div>
                    </> :
                    <div className="flex justify-center align-center">
                        <Spinner />
                    </div>
            }
        </div>
    </Popup.BaseContainer>

}

function DocumentsList(props: {
    documents: DocumentEntity[],
    selected?: string,
    onClick: (document: DocumentEntity) => void
    onDelete: (document: DocumentEntity) => void
}) {
    if (props.documents.length === 0) {
        return <div className="p-4 rounded-md border-dashed border-grey-500 border flex justify-center align-center text-grey-500">
            <span>
                No documents found
            </span>
        </div>
    }
    return <ul>
        {props.documents.map(document => <DocumentItem
            key={document.id}
            document={document}
            selected={props.selected === document.id}
            onClick={() => props.onClick(document)}
            onDelete={() => props.onDelete(document)}
        />)}
    </ul>
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
        <span>
            {props.document.filename}
        </span>
        <Button shape="square" size={UiSize.S}
            onClick={e => {
                e.stopPropagation()
                props.onDelete()
            }}
        >
            <Icon name="delete" />
        </Button>
    </li>
}