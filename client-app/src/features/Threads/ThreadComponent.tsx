import { observer } from "mobx-react-lite";
import {
  Button,
  CardGroup,
  Header,
  HeaderContent,
  HeaderSubheader,
  Icon,
  Segment,
} from "semantic-ui-react";
import { ThreadType } from "../../app/models/threadType";
import { Thread } from "../../app/models/thread";
import { useStore } from "../../app/stores/store";
import { useEffect } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import RichTextEditor from "./RichTextEditor";
import SMEPicker from "./SMEPicker";
import SMECard from "./SMECard";
import SecurityOfficerPicker from "./SecurityOfficerPicker";
import SecurityOfficerCard from "./SecurityOfficerCard";

interface Props {
  thread: Thread;
  authorName: string;
  updateThreadComments: (threadId: string, newComments: string) => void;
  addSME: (threadId: string, personId: number) => void;
  removeSME: (threadId: string, personId: number) => void;
  updateSecurityOfficerId: (threadId: string, newSecurityOfficerId: string) => void;
  removeSecurityOfficer: (threadId: string) => void;
  threadId: string;
}

export default observer(function ThreadComponent({
  thread,
  authorName,
  updateThreadComments,
  addSME,
  removeSME,
  updateSecurityOfficerId,
  removeSecurityOfficer,
  threadId
}: Props) {
  const { usawcUserStore, modalStore, smeStore, securityOfficerStore } = useStore();
  const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
  const {openModal} = modalStore;
  useEffect(() => {
    if (usawcUsers.length === 0 && !usawcUserloading) loadUSAWCUsers();
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

  const handleAddSMEButtonClick = () =>{
    openModal(
      <SMEPicker addSME={addSME} removeSME={removeSME}  threadId={threadId} />, 'fullscreen'
    )
  }

  const handleAddSecurityOfficerButtonClick = () => {
    openModal(
      <SecurityOfficerPicker threadId={threadId} updateSecurityOfficerId={updateSecurityOfficerId} removeSecurityOfficer={removeSecurityOfficer} />, 'fullscreen'
    )
  }

  if (usawcUserloading) return <LoadingComponent content="loading data..." />;

  return (
    <Segment key={thread.id} style={{ backgroundColor: "#F1E4C7" }}>
      <Header
        as="h2"
        style={{ margin: "1rem 0" }}
        textAlign="center"
        className="industry"
      >
        {ThreadType[thread.type]} Information
        <Header.Subheader>
          {new Date(thread.dateCreated).toLocaleString()}
        </Header.Subheader>
        <Header.Subheader>{authorName}</Header.Subheader>
      </Header>
      <div className="editor-container">
        <Header as="h4" className="industry">
          <Icon name="comments" />
          <HeaderContent> {ThreadType[thread.type]} Comments</HeaderContent>
          <HeaderSubheader>
            Use the rich text editor to enter comments
          </HeaderSubheader>
          <HeaderSubheader>
            Use Shift + Enter for a line break
          </HeaderSubheader>
        </Header>
        <RichTextEditor
          content={thread.comments}
          threadId={thread.id}
          updateThreadComments={updateThreadComments}
        />
      </div>
      <div className="editor-container">
       <Header as="h4" className="industry">
       <Icon name="graduation cap" />
       <HeaderContent>Subject Matter Expert/s</HeaderContent>
       <HeaderSubheader>
            Choose an SME to review your publication. You may choose more than one.
        </HeaderSubheader>
       </Header>
       <div className="ui clearing" style={{marginBottom: '10px'}}>
        <Button content='Add SME' icon='plus' labelPosition='left' color='brown' onClick={handleAddSMEButtonClick} />
       </div>
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
                showRemoveButton={true}
                showSelectButton={false}
            />
            ))}
      </CardGroup>
    }
      </div>

      <div className="editor-container">
          <Header as="h4" className="industry">
          <Icon name="shield" />
          <HeaderContent>Operational Security Officer II</HeaderContent>
          <HeaderSubheader>
            Choose an OPSEC II Officer to review your publication. Try to choose from your organization if possible.
        </HeaderSubheader>
          </Header>
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
          {thread.securityOfficerId && 
           <CardGroup itemsPerRow={3}>
          <SecurityOfficerCard
           securityOfficer = {securityOfficerStore.getById(thread.securityOfficerId)}
           threadId={thread.id}
           showSelectButton={false}
           showRemoveButton={true}
           showDeleteButton={false}
           showEditButton={false}
           updateSecurityOfficerId={updateSecurityOfficerId}
           removeSecurityOfficer={removeSecurityOfficer}
          />
          </CardGroup>
          }
      </div>
    </Segment>
  );
});