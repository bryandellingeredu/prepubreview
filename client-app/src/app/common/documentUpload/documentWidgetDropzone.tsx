import {useCallback} from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify';
import { Header, Icon } from 'semantic-ui-react';

interface Props {
    setFiles: (files: any) => void;
    setFileName: (fileName: string) => void;
}

export default function DocumentWidgetDropzone({setFiles, setFileName} : Props) {

    const dzStyles = {
        border: 'dashed 3px black',
        borderColor: 'black',
        borderRadius: '5px',
        paddingTop: '30px',
        textAlign: 'center' as 'center',
        height: 200
    }

    const dzActive = {
        borderColor: 'green',
    }

    const onDrop = useCallback((acceptedFiles: any) => {
        if (acceptedFiles.length > 1) {
            toast.error('You may only upload one pubication at a time.', {
                position: "top-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
        } else {
        setFiles(acceptedFiles.map((file: any) => Object.assign(file, {
            preview: URL.createObjectURL(file)
            
        })))
        setFileName(acceptedFiles[0].name)
    }
    }, [setFiles])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <div {...getRootProps()} style={isDragActive ? {...dzStyles, ...dzActive} : dzStyles}>
            <input {...getInputProps()} />
            <Icon name='hand point down' size='huge' />
            <Header content='Drag And Drop Here, Or Click To Browse' />
        </div>
    )
}