import { observer } from "mobx-react-lite";
import { Header, HeaderContent, HeaderSubheader, Icon, Segment } from "semantic-ui-react";
import { ThreadType } from "../../app/models/threadType";
import { Thread } from "../../app/models/thread";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw, Modifier } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import HeaderSubHeader from "semantic-ui-react/dist/commonjs/elements/Header/HeaderSubheader";

interface Props {
  thread: Thread;
  authorName: string;
  updateThreadComments: (threadId: string, newComments: string) => void 
}

export default observer(function ThreadComponent({ thread, authorName, updateThreadComments }: Props) {
  const { usawcUserStore } = useStore();
  const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );



  useEffect(() => {
    if (usawcUsers.length === 0 && !usawcUserloading) loadUSAWCUsers();
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

  useEffect(() => {
    if (thread.comments) {
      try {
        const parsedComments = JSON.parse(thread.comments);
        setEditorState(
          EditorState.createWithContent(convertFromRaw(parsedComments))
        );
      } catch (error) {
        console.error("Error parsing thread comments:", error);
      }
    }
  }, [thread.comments]);

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const contentAsString: string = JSON.stringify(
      convertToRaw(newEditorState.getCurrentContent())
    );
    updateThreadComments(thread.id, contentAsString); // Corrected function name
  };

  const handlePastedText = (
    text: string,
    _html: string,
    editorState: EditorState
  ): boolean => {
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContentState = Modifier.replaceText(
      currentContent,
      selectionState,
      text // Replace with just the text, no formatting
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );

    setEditorState(newEditorState);
    return true;
  };

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
      <Header as='h5' className="industry">
    <Icon name='pencil' />
    <HeaderContent>  {ThreadType[thread.type]} Comments</HeaderContent>
    <HeaderSubHeader>Use the rich text editor to enter comments</HeaderSubHeader>
  </Header>
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        wrapperClassName="wrapper-class"
        editorClassName="unique-editor-class"
        toolbarClassName="toolbar-class"
        handlePastedText={handlePastedText}
        toolbar={{
          options: [
            "inline",
            "blockType",
            "fontSize",
            "list",
            "textAlign",
            "colorPicker",
            "link",
            "history",
          ], // Exclude 'image' here
        }}
      />
      </div>
    </Segment>
  );
});
