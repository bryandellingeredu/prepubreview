import { observer } from "mobx-react-lite";
import {
  Button,
  ButtonContent,
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
import { useEffect, useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import RichTextEditor from "./RichTextEditor";
import SMEPicker from "./SMEPicker";
import SMECard from "./SMECard";

interface Props {
  thread: Thread;
  authorName: string;
  updateThreadComments: (threadId: string, newComments: string) => void;
  addSME: (threadId: string, personId: number) => void;
  threadId: string;
}

export default observer(function ThreadComponent({
  thread,
  authorName,
  updateThreadComments,
  addSME,
  threadId
}: Props) {
  const { usawcUserStore, modalStore, smeStore } = useStore();
  const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
  const {openModal} = modalStore;
  useEffect(() => {
    if (usawcUsers.length === 0 && !usawcUserloading) loadUSAWCUsers();
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

  const handleAddSMEButtonClick = () =>{
    openModal(
      <SMEPicker addSME={addSME} threadId={threadId} />, 'fullscreen'
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
                threadId={thread.id}
            />
            ))}
</CardGroup>
}
      </div>
    </Segment>
  );
});