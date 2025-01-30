import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useStore } from "../../app/stores/store";
import { useNavigate, useParams } from "react-router-dom";
import { Button, ButtonContent, ButtonGroup, Container, Divider, Header, Icon, Message, Popup, Segment, SegmentGroup } from "semantic-ui-react";
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
import { StatusType } from "../../app/models/statusType";


export default observer(function ThreadsMain() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { publicationStore, usawcUserStore, userStore, smeStore, securityOfficerStore, responsiveStore  } = useStore();
    const {isMobile} = responsiveStore;
    const { appUser} = userStore;
    const {publicationloading, getPublicationById} = publicationStore
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
    const {userSubjectLoading, userSubjects, loadUserSubjects} = smeStore;
    const {securityOfficerLoading, securityOfficers, loadSecurityOfficers} = securityOfficerStore;

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
        threads: [],
        status: StatusType.Pending,
        logicalDeleteIn: false,
        deletedByPersonId: null,
        dateDeleted: null
    })

    const [scrollTrigger, setScrollTrigger] = useState(false);
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [publicationName, setPublicationName] = useState("");

    useEffect(() => {
        if (scrollTrigger) {
            // Wait for the DOM update to complete
            setTimeout(() => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth',
                });
                setScrollTrigger(false); // Reset the trigger
            }, 0); // Short delay to ensure render is complete
        }
    }, [scrollTrigger]);

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
                                order: 1,
                                isActive: true,
                                createdByPersonId: appUser.personId,
                                dateCreated: new Date(),
                                updatedByPersonId: null,
                                dateUpdated: null,
                                type: ThreadType.Author,
                                publicationId: publication.id,
                                subjectMatterExperts: [],
                                commentsAsHTML: '',
                                comments: '{"blocks":[{"key":"4gl4r","text":"I have reviewed this article. It contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":143,"style":"ITALIC"}],"entityRanges":[],"data":{}}],"entityMap":{}}',
                                securityOfficerId: '',
                                assignedToPersonId: appUser.personId,
                                reviewStatus: ''
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
    }, [id, getPublicationById, appUser, ]);

    useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) loadUSAWCUsers();
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

      useEffect(() => {
        if (userSubjects.length === 0 && !userSubjectLoading) loadUserSubjects();
      }, [loadUserSubjects, userSubjects, userSubjectLoading]);

      useEffect(() =>{
        if(securityOfficers.length === 0 && !securityOfficerLoading) loadSecurityOfficers();
      }, [securityOfficers, securityOfficerLoading, loadSecurityOfficers] )

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
        window.open(url, "_blank", "noopener,noreferrer");
    }

    const handleSetReviewStatus = (threadId: string, reviewStatus: string) =>{
        setPublication((prev) => {
            if (!prev.threads) {
              console.error("Threads are null.");
              toast.error('threads are null');
              return prev; // Return unchanged if threads are null
            }
            return {
              ...prev,
              threads: prev.threads.map((thread) =>
                thread.id === threadId ? { ...thread, reviewStatus: reviewStatus } : thread
              ),
            };
          });
        };
    

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

    const updateSecurityOfficerId = (threadId: string, newSecurityOfficerId: string) => {
        setPublication((prev) => ({
            ...prev,
            threads: (prev.threads ?? []).map((thread) =>
                thread.id === threadId
                    ? { ...thread, securityOfficerId: newSecurityOfficerId }
                    : thread
            ),
        }));
        setScrollTrigger(true);
    };

    const removeSecurityOfficer = (threadId: string) => {
        setPublication((prev) => ({
            ...prev,
            threads: (prev.threads ?? []).map((thread) =>
                thread.id === threadId
                    ? { ...thread, securityOfficerId: '' }
                    : thread
            ),
        }));
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
        setScrollTrigger(true);
    };

    const getStatus = () => {
        if (StatusType[publication.status] === 'SentToSMEForReview') return 'Waiting for SME Review';
        if (StatusType[publication.status] === 'SentToSecurityForReview') return 'Waiting for Operational Security Officer Review'
        if (StatusType[publication.status] === 'RejectedBySME') return "Rejected by SME, Awaiting Author's Revision"
        if (StatusType[publication.status] === 'RejectedBySecurity') return "Rejected by Security Officer, Awaiting Author's Revision" 
        return StatusType[publication.status];
    }

    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const handleCancel = () => {
        setOpen(false);
    };

    const handleDelete = async () =>{
        setDeleting(true)
        try{
           await publicationStore.deletePublication(publication.id);
           setPublication({ ...publication, logicalDeleteIn: true });
        }catch(error){
            toast.error('an error occured during delete')
        }finally{
            setDeleting(false);
        }
    }


    if(!id || publicationloading || usawcUserloading || loadingMeta || userSubjectLoading || securityOfficerLoading) return <LoadingComponent content="loading data..."/>


    
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
            {publication.logicalDeleteIn &&
               <Message negative>
               <Message.Header>
                   <span className="industry">
                       THIS PUBLICATION HAS BEEN DELETED
                   </span>
               </Message.Header>
           </Message>
            }
            {!publication.logicalDeleteIn && 
            <>
             <Divider horizontal>
                <Header as="h1" className="industry">
                    {publication.title}
                </Header>
            </Divider>
            <SegmentGroup horizontal={!isMobile} style={{backgroundColor: '#F1E4C7'}}>
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
                 
                 <Segment style={{ display: 'flex', alignItems: 'center' }}><strong className="industry">STATUS: &nbsp; </strong> {getStatus()}</Segment>


                <Segment style={{ display: 'flex', alignItems: 'center' }}>
                
                {(appUser?.isAdmin || appUser?.personId === publication.authorPersonId || appUser?.personId === publication.createdByPersonId) && 
                <ButtonGroup>
                <Button animated='vertical' color='brown'  onClick={handleEditButtonClick}>
                    <ButtonContent hidden>EDIT</ButtonContent>
                        <ButtonContent visible>
                            <Icon name='edit' />
                        </ButtonContent>
                </Button>
            
                <Popup
                
                trigger={
                  <Button animated='vertical'
                   color='red' icon  onClick={() => setOpen(true)}>
                      <ButtonContent hidden>DELETE</ButtonContent>
                        <ButtonContent visible>
                            <Icon name='x' />
                        </ButtonContent>
                </Button>
                 }
                   on="click"
                  open={open}
                  onClose={() => setOpen(false)}
                  position="top center"
                content={
                <div>
                   <p>Are you sure you want to delete this Publication</p>
                      <Button color="red" onClick={handleDelete} loading={deleting}>
                        Yes
                      </Button>
                    <Button color="grey" onClick={handleCancel}>
                       No
                     </Button>
                </div>
                }
              
                />
                
               

                </ButtonGroup>
                }
               


                </Segment>
            </SegmentGroup>

            <SegmentGroup>
                    {(publication.threads || [])
                    .sort((a, b) => {
                        // Sort by isActive first (active threads come first)
                        if (a.isActive !== b.isActive) {
                          return a.isActive ? -1 : 1;
                        }
                        // Then sort by dateCreated (most recent first)
                        return b.order - a.order;
                      })
                    .map((thread) => (
                       <ThreadComponent
                        key={thread.id}
                        thread={thread}
                        authorName={getAuthorName()}
                        updateThreadComments={updateThreadComments}
                        addSME={addSME}
                        updateSecurityOfficerId={updateSecurityOfficerId}
                        removeSecurityOfficer={removeSecurityOfficer}
                        removeSME={removeSME}
                        threadId={thread.id}
                        handleSetReviewStatus={handleSetReviewStatus}
                        authorPersonId={publication.authorPersonId}
                        creatorPersonId={publication.createdByPersonId}
                        />
                     ))}
                     {(!publication.threads || publication.threads.length === 0) && (
                        <Segment>No threads available.</Segment>
                     )}
                </SegmentGroup>
                </>
           }


        </Container>
    )
})