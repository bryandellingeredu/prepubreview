import { Button, Grid, Header, Icon } from "semantic-ui-react";
import DocumentWidgetDropzone from "./documentWidgetDropzone";
import { useState } from "react";

interface Props{
    loading: boolean
    uploadPublication: (file: Blob) => void;
    setFileName: (fileName: string) => void;
}

export default function DocumentUploadWidget({loading, uploadPublication, setFileName} : Props) {
    
    const handleUploadPublication = () => {
          uploadPublication(files[0]);
      };


    const [files, setFiles] = useState<any>([])

    const getFileIcon = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
      
        switch (extension) {
          case 'pdf':
            return 'fa-file-pdf'; // PDF icon
          case 'doc':
          case 'docx':
            return 'fa-file-word'; // Word document icon
          case 'mp4':
          case 'avi':
          case 'mkv':
            return 'fa-file-video'; // Video file icon
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
            return 'fa-file-image'; // Image file icon
          case 'zip':
          case 'rar':
          case '7z':
            return 'fa-file-archive'; // Archive file icon
          case 'txt':
            return 'fa-file-alt'; // Text file icon
          case 'xls':
          case 'csv':
          case 'xlsx':
            return 'fa-file-excel'; // Excel file icon
          case 'ppt':
          case 'pptx':
            return 'fa-file-powerpoint'; // PowerPoint file icon
          default:
            return 'fa-file'; // Default file icon
        }
      };

    return (
        <Grid>
            <Grid.Column width={4}>
                 <Header  sub content='STEP 1 - ADD PUBLICATION' />
                 <DocumentWidgetDropzone setFiles={setFiles} setFileName={setFileName} />
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                 <Header  sub content='PUBLICATION' />
                 {files && files.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <Header as='h2' icon textAlign='center'>
                        {/* Determine the icon based on the file extension */}
                         <i className={`fas ${getFileIcon(files[0].name)} fa-2x`}></i>
                         &nbsp;
                            {/* Display the file name, truncating if too long */}
                            {files[0].name.length > 50
                             ? files[0].name.substring(0, 47) + '...'
                            : files[0].name}
                            </Header>
                    </div>
                    )}
            </Grid.Column>
            <Grid.Column width={1} />

            <Grid.Column width={4}>
                 <Header  sub content='STEP 2 - UPLOAD PUBLICATION' />
                 {files && files.length > 0 && (
            <div style={{marginTop: '60px', textAlign: 'center'}}>
            <Button type='button' size='big' icon labelPosition='left' primary onClick = {handleUploadPublication}  loading={loading} >
          
      <Icon name='upload' />
      Upload
    </Button>
    </div>
    )}
            </Grid.Column>
        </Grid>
    )
}