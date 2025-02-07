import { Button, Grid, Header, Icon } from "semantic-ui-react";
import DocumentWidgetDropzone from "./documentWidgetDropzone";
import { useState, useEffect } from "react";
import { useStore } from "../../stores/store";

interface Props {
    loading: boolean;
    uploadPublication: (file: Blob) => void;
    setFileName: (fileName: string) => void;
}

export default function DocumentUploadWidget({ loading, uploadPublication, setFileName }: Props) {
    const { responsiveStore } = useStore();
    const { isMobile } = responsiveStore;
    
    const [files, setFiles] = useState<File[]>([]);

    // Automatically upload the file when it's set
    useEffect(() => {
        if (files.length > 0) {
            uploadPublication(files[0]); // Start upload immediately
        }
    }, [files, uploadPublication]);

    const getFileIcon = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return 'fa-file-pdf';
            case 'doc':
            case 'docx': return 'fa-file-word';
            case 'mp4':
            case 'avi':
            case 'mkv': return 'fa-file-video';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return 'fa-file-image';
            case 'zip':
            case 'rar':
            case '7z': return 'fa-file-archive';
            case 'txt': return 'fa-file-alt';
            case 'xls':
            case 'csv':
            case 'xlsx': return 'fa-file-excel';
            case 'ppt':
            case 'pptx': return 'fa-file-powerpoint';
            default: return 'fa-file';
        }
    };

    return (
        <Grid>
            <Grid.Column width={4}>
                <Header sub content="STEP 1 - ADD PUBLICATION" />
                <DocumentWidgetDropzone setFiles={setFiles} setFileName={setFileName} />
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub content="PUBLICATION" />
                {files.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                        <Header as="h2" icon textAlign="center">
                            <i className={`fas ${getFileIcon(files[0].name)} fa-2x`}></i> &nbsp;
                            {files[0].name.length > 50 ? `${files[0].name.substring(0, 47)}...` : files[0].name}
                        </Header>
                    </div>
                )}
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub content="STEP 2 - UPLOAD PUBLICATION" />
                {files.length > 0 && (
                    <div style={{ marginTop: "60px", textAlign: "center" }}>
                        <Button
                            type="button"
                            size={isMobile ? "small" : "big"}
                            icon
                            labelPosition="left"
                            primary
                            loading={loading}
                        >
                            <Icon name="upload" />
                            Uploading...
                        </Button>
                    </div>
                )}
            </Grid.Column>
        </Grid>
    );
}
