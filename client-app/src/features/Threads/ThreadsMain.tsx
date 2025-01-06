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
import ThreadComponent from "./ThreadComponent";
import { SubjectMatterExpert } from "../../app/models/subjectMatterExpert";


export default observer(function ThreadsMain() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { publicationStore, usawcUserStore, userStore, smeStore  } = useStore();
    const { appUser} = userStore;
    const {publicationloading, getPublicationById} = publicationStore
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
    const {userSubjectLoading, userSubjects, loadUserSubjects} = smeStore

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

      useEffect(() => {
        if (userSubjects.length === 0 && !userSubjectLoading) loadUserSubjects();
      }, [loadUserSubjects, userSubjects, userSubjectLoading]);

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

    const updateThreadComments = (threadId: string, newComments: string) => {
        setPublication((prev) => {
          if (!prev.threads) {
            console.error("Threads are null.");
            toast.error('threads are null');
            return prev; // Return unchanged if threads are null
          }
          return {
            ...prev,
            threads: prev.threads.map((thread) =>
              thread.id === threadId ? { ...thread, comments: newComments } : thread
            ),
          };
        });
      };

      const removeSME = (threadId: string, personId: number) => {
        setPublication((prev) => {
            if (!prev.threads) {
                console.error("Threads are null.");
                toast.error("Threads are null.");
                return prev; // Return unchanged if threads are null
            }
            return {
                ...prev,
                threads: prev.threads.map((thread) =>
                    thread.id === threadId
                        ? {
                              ...thread,
                              subjectMatterExperts: thread.subjectMatterExperts
                                  ? thread.subjectMatterExperts.filter(
                                        (expert) => expert.personId !== personId
                                    )
                                  : [] 
                          }
                        : thread
                ),
            };
        });
    };


      const addSME = (threadId: string, personId: number) => {
        const newSME: SubjectMatterExpert = { id: uuidv4(), threadId, personId };
    
        setPublication((prev) => {
            if (!prev.threads) {
                console.error("Threads are null.");
                toast.error("Threads are null.");
                return prev; // Return unchanged if threads are null
            }
    
            return {
                ...prev,
                threads: prev.threads.map((thread) =>
                    thread.id === threadId
                        ? {
                              ...thread,
                              subjectMatterExperts: thread.subjectMatterExperts
                                  ? [...thread.subjectMatterExperts, newSME]
                                  : [newSME], // Ensure subjectMatterExperts is initialized if it's null or undefined
                          }
                        : thread
                ),
            };
        });
    };


    if(!id || publicationloading || usawcUserloading || loadingMeta || userSubjectLoading) return <LoadingComponent content="loading data..."/>

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
                    {(publication.threads || []).map((thread) => (
                       <ThreadComponent
                        key={thread.id}
                        thread={thread}
                        authorName={getAuthorName()}
                        updateThreadComments={updateThreadComments}
                        addSME={addSME}
                        removeSME={removeSME}
                        threadId={thread.id}
                        />
                     ))}
                     {(!publication.threads || publication.threads.length === 0) && (
                        <Segment>No threads available.</Segment>
                     )}
                </SegmentGroup>


        </Container>
    )
})