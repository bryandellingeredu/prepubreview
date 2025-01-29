import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Header, Icon } from 'semantic-ui-react';
import { useStore } from '../../stores/store';

interface Props {
    setFiles: (files: any) => void;
    setFileName: (fileName: string) => void;
}

export default function DocumentWidgetDropzone({ setFiles, setFileName }: Props) {

        const { responsiveStore } = useStore();
        const {isMobile} = responsiveStore;

    const dzStyles = {
        border: 'dashed 3px black',
        borderColor: 'black',
        borderRadius: '5px',
        paddingTop: '30px',
        textAlign: 'center' as 'center',
        height: 200,
    };

    const dzActive = {
        borderColor: 'green',
    };

    const onDrop = useCallback((acceptedFiles: any, fileRejections: any) => {
        if (fileRejections.length > 0) {
            fileRejections.forEach((rejection: any) => {
                if (rejection.errors.find((error: any) => error.code === 'file-too-large')) {
                    toast.error('File size must not exceed 2GB.', {
                        position: "top-center",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                }
            });
        }

        if (acceptedFiles.length > 1) {
            toast.error('You may only upload one publication at a time.', {
                position: "top-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        } else if (acceptedFiles.length === 1) {
            setFiles(acceptedFiles.map((file: any) => Object.assign(file, {
                preview: URL.createObjectURL(file),
            })));
            setFileName(acceptedFiles[0].name);
        }
    }, [setFiles, setFileName]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 2 * 1024 * 1024 * 1024, // 2GB in bytes
    });

    return (
        <div {...getRootProps()} style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles}>
            <input {...getInputProps()} />
            <Icon name='hand point down' size='huge' />
            {!isMobile && 
            <Header content='Drag And Drop Here, Or Click To Browse' />
            }
        </div>
    );
}
