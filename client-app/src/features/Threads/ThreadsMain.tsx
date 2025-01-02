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
import { Thread } from "../../app/models/thread";
import { v4 as uuidv4 } from "uuid";
import { ThreadType } from "../../app/models/threadType";

export default observer(function ThreadsMain() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { publicationStore, usawcUserStore, userStore  } = useStore();
    const { appUser} = userStore;
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
        publicationLinkName: '',
        threads: []
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
        if (id && appUser) {
            console.log('Fetching publication with id:', id);
    
            getPublicationById(id)
                .then((publication) => {
                    if (publication) {
                        if (!publication.threads?.length) {
                            const thread: Thread = {
                                id: uuidv4(),
                                isActive: true,
                                createdByPersonId: appUser.personId,
                                dateCreated: new Date(),
                                updatedByPersonId: null,
                                dateUpdated: null,
                                type: ThreadType.Author,
                                publicationId: publication.id,
                                subjectMatterExperts: [],
                                comments: '',
                            };
                            publication.threads = [thread];
                        }
                        setPublication(publication);
                    } else {
                        console.error('No publication found for id:', id);
                        toast.error(`No publication found for id: ${id}`);
                    }
                })
                .catch((error) => {
                    toast.error(`Error fetching publication: ${error.message}`);
                    console.error('Error fetching publication:', error);
                });
        }
    }, [id, getPublicationById, appUser]);

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

            <SegmentGroup>
                <Header as="h2" style={{ margin: '1rem 0' }}>Threads</Header>
                    {(publication.threads || []).map((thread) => (
                        <Segment key={thread.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>Type:</strong> {ThreadType[thread.type]} <br />
                                <strong>Created By:</strong> {usawcUsers.find((user) => user.personId === thread.createdByPersonId)?.firstName || 'Unknown'} <br />
                                <strong>Created At:</strong> {new Date(thread.dateCreated).toLocaleString()} <br />
                                <strong>Comments:</strong> {thread.comments || 'No comments'}
                            </div>
                         <Button color="blue" onClick={() => console.log(`Edit thread ${thread.id}`)}>Edit</Button>
                        </Segment>
                     ))}
                     {(!publication.threads || publication.threads.length === 0) && (
                        <Segment>No threads available.</Segment>
                     )}
                </SegmentGroup>


        </Container>
    )
})