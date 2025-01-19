import { observer } from "mobx-react-lite";
import {
  Button,
  CardGroup,
  Header,
  HeaderContent,
  HeaderSubheader,
  Icon,
  Label,
  Message,
  MessageHeader,
  Radio,
  Segment,
} from "semantic-ui-react";
import { ThreadType } from "../../app/models/threadType";
import { Thread } from "../../app/models/thread";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import RichTextEditor from "./RichTextEditor";
import SMEPicker from "./SMEPicker";
import SMECard from "./SMECard";
import SecurityOfficerPicker from "./SecurityOfficerPicker";
import SecurityOfficerCard from "./SecurityOfficerCard";
import { toast } from "react-toastify";
import { InitialThreadDTO } from "../../app/models/initialThreadDTO";
import { stateToHTML } from 'draft-js-export-html';
import { convertFromRaw} from 'draft-js';
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from 'react-router-dom';

interface Props {
  thread: Thread;
  authorName: string;
  updateThreadComments: (threadId: string, newComments: string) => void;
  addSME: (threadId: string, personId: number) => void;
  removeSME: (threadId: string, personId: number) => void;
  updateSecurityOfficerId: (threadId: string, newSecurityOfficerId: string) => void;
  removeSecurityOfficer: (threadId: string) => void;
  threadId: string;
  handleSetReviewStatus: (threadId: string, reviewStatus : string) => void;
}

export default observer(function ThreadComponent({
  thread,
  authorName,
  updateThreadComments,
  addSME,
  removeSME,
  updateSecurityOfficerId,
  removeSecurityOfficer,
  threadId,
  handleSetReviewStatus
}: Props) {
  const navigate = useNavigate();
  const { usawcUserStore, modalStore, smeStore, securityOfficerStore, publicationStore } = useStore();
  const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
  const {openModal} = modalStore;
  const {addInitialThread} = publicationStore;
  useEffect(() => {
    if (usawcUsers.length === 0 && !usawcUserloading) loadUSAWCUsers();
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

  const handleAddSMEButtonClick = () =>{
    setSmeError(false);
    openModal(
      <SMEPicker addSME={addSME} removeSME={removeSME}  threadId={threadId} />, 'fullscreen'
    )
  }

  const handleAddSecurityOfficerButtonClick = () => {
    setSecurityOfficerError(false);
    openModal(
      <SecurityOfficerPicker threadId={threadId} updateSecurityOfficerId={updateSecurityOfficerId} removeSecurityOfficer={removeSecurityOfficer} />, 'fullscreen'
    )
  }
  
  const [saving, setSaving] = useState(false);
  const [smeError, setSmeError] = useState(false);
  const [securityOfficerError, setSecurityOfficerError] = useState(false);

  const handleSendToSMEClick = async () =>{
    if(!thread.subjectMatterExperts || thread.subjectMatterExperts.length <1 ){
       setSmeError(true);
       return;
    }else{
      setSmeError(false);
    }
    if(!thread.securityOfficerId){
      setSecurityOfficerError(true);
      return;
   }else{
     setSecurityOfficerError(false);
   }
   setSaving(true);
   try{
    const rawContent = JSON.parse(thread.comments);
    const contentState = convertFromRaw(rawContent);
     const initalThreadDTO : InitialThreadDTO = {
      id: thread.id,
      publicationId: thread.publicationId,
      comments: thread.comments,
      commentsAsHTML: stateToHTML(contentState),
      securityOfficerId: thread.securityOfficerId,
      subjectMatterExpertIds: thread.subjectMatterExperts.map(x => x.personId),
      nextThreadId: uuidv4()
     }
     await addInitialThread(initalThreadDTO);
     navigate(`/senttosmeconfirmation/${thread.publicationId}`);
   }catch(error){
    toast.error('an error occured during save')
   }finally{
    setSaving(false);
   }
  }

  const getAssignedToName = () => {
    const person = usawcUserStore.getUserByPersonId(thread.assignedToPersonId!)
    if (person){
      return person.middleName ?
      `${person.firstName} ${person.middleName}  ${person.lastName} ` :
      `${person.firstName} ${person.lastName} `
    }
  }

 const setReviewStatus = (reviewStatus : string) => handleSetReviewStatus(threadId, reviewStatus)

  if (usawcUserloading) return <LoadingComponent content="loading data..." />;

  return (
    <Segment key={thread.id} style={{ backgroundColor: "#F1E4C7" }}>
      <Header
        as="h2"
        style={{ margin: "1rem 0" }}
        textAlign="center"
        className="industry"
      >
        {ThreadType[thread.type] === 'Author' ? 'Author Information' : `${ThreadType[thread.type]} Review `} 
        <Header.Subheader>
        {ThreadType[thread.type] !== 'Author' && <strong className="industry">ASSIGNED AT: </strong>} {new Date(thread.dateCreated).toLocaleString()}
        </Header.Subheader>
        {ThreadType[thread.type] === 'Author' && 
          <Header.Subheader>{authorName}</Header.Subheader>
        }
        {ThreadType[thread.type] !== 'Author' && 
          <Header.Subheader><strong className="industry">ASSIGNED TO: </strong>{getAssignedToName()}</Header.Subheader>
        }
      </Header>

  
      <div className="editor-container">
        <Header as="h4" className="industry">
          <Icon name="comments" />
          <HeaderContent> {ThreadType[thread.type]} Comments</HeaderContent>
          {thread.isActive && 
          <>
          <HeaderSubheader>
            Use the rich text editor to enter comments
          </HeaderSubheader>
          <HeaderSubheader>
            Use Shift + Enter for a line break
          </HeaderSubheader>
          </>
         }
        </Header>
        <RichTextEditor
          content={thread.comments}
          threadId={thread.id}
          updateThreadComments={updateThreadComments}
          disabled={!thread.isActive}
        />
      </div>
      {ThreadType[thread.type] === "Author" && 
      <>
      <div className={`editor-container ${smeError ? 'error-border' : ''}`}>
       <Header as="h4" className="industry">
       <Icon name="graduation cap" />
       <HeaderContent>Subject Matter Expert/s</HeaderContent>
       {thread.isActive &&
       <HeaderSubheader>
            Choose an SME to review your publication. You may choose more than one.
        </HeaderSubheader>
        }
       </Header>
       {thread.isActive &&
       <div className="ui clearing" style={{marginBottom: '10px'}}>
        <Button content='Add SME' icon='plus' labelPosition='left' color='brown' onClick={handleAddSMEButtonClick} />
       </div>
       }
       {thread.subjectMatterExperts &&
        thread.subjectMatterExperts.length > 0 &&
          <CardGroup itemsPerRow={3}>
          {
            thread.subjectMatterExperts.map((subjectMatterExpert) => (
            <SMECard
                key={subjectMatterExpert.id}
                userSubject={smeStore.getUserSubjectByPersonId(subjectMatterExpert.personId)!}
                addSME={addSME}
                removeSME={removeSME}
                threadId={thread.id}
                showRemoveButton={thread.isActive}
                showSelectButton={false}
            />
            ))}
      </CardGroup>
    }
    {smeError && 
     <Message negative>
        <MessageHeader className="industry">YOU MUST CHOOSE AT LEAST ONE SME</MessageHeader>
     </Message>
     }
      </div>

      <div className={`editor-container ${securityOfficerError ? 'error-border' : ''}`}>
          <Header as="h4" className="industry">
          <Icon name="shield" />
          <HeaderContent>Operational Security Officer II</HeaderContent>
          {thread.isActive &&
          <HeaderSubheader>
            Choose an OPSEC II Officer to review your publication. Try to choose from your organization if possible.
        </HeaderSubheader>
         }
          </Header>
          {thread.isActive &&
          <div className="ui clearing" style={{marginBottom: '10px'}}>
            {!thread.securityOfficerId &&
            <Button
             content='Add OPSEC II'
            icon='plus' labelPosition='left'
            color='brown'
            onClick={handleAddSecurityOfficerButtonClick} />
           } 
            {thread.securityOfficerId &&
            <Button
             content='Change OPSEC II'
            icon='edit' labelPosition='left'
            color='brown'
            onClick={handleAddSecurityOfficerButtonClick} />
           }   
          </div>
          }
          {thread.securityOfficerId && 
           <CardGroup itemsPerRow={3}>
          <SecurityOfficerCard
           securityOfficer = {securityOfficerStore.getById(thread.securityOfficerId)}
           threadId={thread.id}
           showSelectButton={false}
           showRemoveButton={thread.isActive}
           showDeleteButton={false}
           showEditButton={false}
           updateSecurityOfficerId={updateSecurityOfficerId}
           removeSecurityOfficer={removeSecurityOfficer}
          />
          </CardGroup>
          }
            {securityOfficerError && 
            <Message negative>
              <MessageHeader className="industry">YOU MUST CHOOSE A SECURITY OFFICER</MessageHeader>
            </Message>
           }
      </div>
      {thread.isActive && 
      <div className="ui clearing" style={{marginBottom: '50px'}}>
        <Button floated="right" size='large'  icon labelPosition="left" color='brown' onClick={handleSendToSMEClick} loading={saving}>
          <Icon name='graduation cap' />
          <span className="industry">
            SEND TO SME FOR REVIEW
          </span>
        </Button>
      </div>
      }
      </>
      }
    
    {ThreadType[thread.type] !== "Author" && 
     <Segment compact style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {/* Label */}
      <Label basic color='black' size='large'><span className="industry" >
      <Icon name='check' />
        PUBLICATION REVIEW: </span>
      </Label>

      {/* I Accept Radio Button */}
      <Radio
        label="I have reviewed and recommend release"
        name={`terms-${thread.id}`}
        value="accept"
        checked={thread.reviewStatus === "accept"}
        onChange={() => setReviewStatus("accept")}
      />

      {/* I Decline Radio Button */}
      <Radio
        label="I have reviewed and DO NOT recommend release (Please update comments if choosing this option)"
        name={`terms-${thread.id}`}
        value="decline"
        checked={thread.reviewStatus === "decline"}
        onChange={() => setReviewStatus("decline")}
      />
    </Segment>
    }
     
    </Segment>
    
  );
});