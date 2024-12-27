import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useStore } from "../../app/stores/store";
import { useNavigate, useParams } from "react-router-dom";
import { Button, ButtonContent, Container, Divider, Header, Icon, Segment, SegmentGroup } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { Publication } from "../../app/models/publication";
import LoadingComponent from "../../app/layout/LoadingComponent";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import DocumentDownloadWidget from "../../app/common/documentDownload/documentDownloadWidget";

export default observer(function ThreadsMain() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { publicationStore, usawcUserStore  } = useStore();
    const {publicationloading, getPublicationById} = publicationStore
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;

    const [publication, setPublication] = useState<Publication>({
        id: '',
        createdByPersonId : 0 ,
        updatedByPersonId: null,
        authorPersonId : 0,  
        authorFirstName: '',
        authorMiddleName: '',
        authorLastName: '',
        title: '',
        dateCreated: new Date(),
        dateUpdated: null,
        publicationLink: '',
        publicationLinkName: ''
    })

    const [loadingMeta, setLoadingMeta] = useState(false);
    const [publicationName, setPublicationName] = useState("");

    useEffect(() => {
        if (id) {
          setLoadingMeta(true);
            agent.AttachmentMetaDatas.details(id)
                .then((metaData) => {
                    if (metaData && metaData.fileName) {
                        setPublicationName(metaData.fileName);
                        setLoadingMeta(false);
                    }else{
                      setLoadingMeta(false);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching metadata:", error);
                    toast.error('error loading file');
                    setLoadingMeta(false);
                });
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            console.log('Fetching publication with id:', id);
            getPublicationById(id)
                .then((publication) => {
                    if (publication) {
                        console.log('Publication fetched:', publication);
                        setPublication(publication);
                    } else {
                        console.error('No publication found for id:', id);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching publication:', error);
                });
        }
    }, [id, getPublicationById]);

    useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) loadUSAWCUsers();
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

    const getAuthorName = () => 
        publication.authorMiddleName ?
         `${publication.authorFirstName} ${publication.authorMiddleName}  ${publication.authorLastName} ` :
         `${publication.authorFirstName} ${publication.authorLastName} `

    const getCreatorName = () =>{
        const usawcUser = usawcUsers.find(x => x.personId === publication.createdByPersonId)
        return  usawcUser?.middleName ?
         `${usawcUser?.firstName} ${usawcUser?.middleName}  ${usawcUser?.lastName} ` :
         `${usawcUser?.firstName} ${usawcUser?.lastName} `
    }

    const handleEditButtonClick = () => {
        navigate(`/newpublicationform/${id}`); // Navigate to the newpublicationform route
    };

    const handleGoBackClick = () =>{
        navigate('/publicationsmain')
    }

    const handleLinkClick = () => {
        const url = publication.publicationLink
        debugger;
        window.open(url, "_blank", "noopener,noreferrer");
    }


    if(!id || publicationloading || usawcUserloading || loadingMeta) return <LoadingComponent content="loading data..."/>

    return(
        <Container fluid>
             <Navbar />
             <div style={{ display: "flex",
                          justifyContent: "space-between",
                          alignItems:"center",
                          marginTop: "1rem",
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          }}>
                 <Button icon labelPosition='left' color='black' onClick={handleGoBackClick}>
                    <Icon name='arrow left' />
                        BACK
                    </Button>
            </div>
             <Divider horizontal>
                <Header as="h1" className="industry">
                    {publication.title}
                </Header>
            </Divider>
            <SegmentGroup horizontal style={{backgroundColor: '#F1E4C7'}}>
                <Segment style={{ display: 'flex', alignItems: 'center' }}>
                    <strong className="industry">ENTERED BY: &nbsp; </strong> {getCreatorName()} </Segment>
                <Segment style={{ display: 'flex', alignItems: 'center' }}><strong className="industry">AUTHOR: &nbsp; </strong> {getAuthorName()}</Segment>
                <Segment style={{ display: 'flex', alignItems: 'center' }}>
                <strong className="industry">PUBLICATION: &nbsp;</strong>
                    {publicationName && 
                        <DocumentDownloadWidget id={id} publicationName={publicationName} />
                     }
                     {
                        !publicationName && publication.publicationLink &&
                        <Button basic color='blue' icon labelPosition="left" 
                        onClick={handleLinkClick}>
                               <Icon name='paperclip' />
                               {publication.publicationLinkName ? publication.publicationLinkName.length  > 20 ? `${publication.publicationLinkName.substring(0, 20)}...` : publication.publicationLinkName : 'link to document'} 
                         </Button>
                     }
                 </Segment>
                 
                 <Segment style={{ display: 'flex', alignItems: 'center' }}><strong className="industry">STATUS: &nbsp; </strong> Pending</Segment>


                <Segment style={{ display: 'flex', alignItems: 'center' }}>
                    
                <Button animated='vertical' color='brown' floated="right" onClick={handleEditButtonClick}>
                    <ButtonContent hidden>EDIT</ButtonContent>
                        <ButtonContent visible>
                            <Icon name='edit' />
                        </ButtonContent>
                </Button>
                </Segment>
            </SegmentGroup>
        </Container>
    )
})