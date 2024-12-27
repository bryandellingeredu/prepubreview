import { useState } from "react";
import { AttachmentMetaData } from "../../models/attachmentMetaData";
import agent from "../../api/agent";
import { observer } from "mobx-react-lite";
import { toast } from "react-toastify";
import { useStore } from "../../stores/store";
import { Button, Icon } from "semantic-ui-react";


interface Props{
    id: string,
    publicationName: string
}

export default observer(function DocumentDownloadWidget ({id, publicationName} : Props){
    const { userStore, } = useStore();
    const apiUrl = import.meta.env.VITE_API_URL;
    const { token } = userStore;

    const [downloading, setDownloading] = useState(false);

    const handleDownloadClick = async () => {
      setDownloading(true)
      try{
        const metaData: AttachmentMetaData = await agent.AttachmentMetaDatas.details(id);
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        const requestOptions = {
          method: 'GET',
          headers: headers,
        };
        const attachmentData = await fetch(
          `${apiUrl}/upload/${metaData.id}`,
          requestOptions,
        );
        const data = await attachmentData.arrayBuffer();
        const file = new Blob([data], { type: metaData.fileType });
        const fileUrl = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = metaData.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(fileUrl);
        
      }catch(error )
      {
        console.log(error);
        toast.error('an error occured during download');
      }finally{
        setDownloading(false);
      }
    }

    return(
        <Button basic color='blue' type='button' icon labelPosition="left" loading={downloading}
        onClick={handleDownloadClick}>
               <Icon name='download' />
               {publicationName.length > 20 ? `${publicationName.substring(0, 20)}...` : publicationName} 
         </Button>
    )
  
})