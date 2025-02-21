import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw,  Modifier } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useEffect, useState } from "react";

interface Props {
  content: string;
  updateThreadComments: (threadId: string, newComments: string) => void;
  threadId: string;
  disabled: boolean
}

export default function RichTextEditor({
  content,
  updateThreadComments,
  threadId,
  disabled
}: Props) {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  // Load content when the component mounts
  useEffect(() => {
    if (content) {
      try {
        const parsedComments = JSON.parse(content);
        setEditorState(
          EditorState.createWithContent(convertFromRaw(parsedComments))
        );
      } catch (error) {
        console.error("Error parsing content:", error);
      }
    }
  }, []); // Empty dependency array to run only once on mount

  // Trigger updateThreadComments whenever the editor state changes
  useEffect(() => {
    const contentAsString = JSON.stringify(
      convertToRaw(editorState.getCurrentContent())
    );
    updateThreadComments(threadId, contentAsString);
  }, [editorState]);

  // Handle editor changes
  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  // Strip formatting from pasted text
  const handlePastedText = (text: string): boolean => {
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // Insert the pasted text as plain text at the current selection (caret) position
    const newContentState = Modifier.insertText(
      currentContent,
      selectionState,
      text
    );

    // Create a new editor state with the updated content
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );

    // Set the updated editor state
    setEditorState(newEditorState);
    return true; // Prevent the default paste behavior
  };

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={handleEditorChange}
      handlePastedText={handlePastedText}
      wrapperClassName={`editor-container ${disabled ? "disabled" : ""}`}
      editorClassName={`editor-content ${disabled ? "disabled" : ""}`}
      toolbarClassName={`editor-toolbar ${disabled ? "disabled" : ""}`}
      readOnly={disabled}
      toolbar={
        disabled
          ? { options: [] } // Disable the toolbar when disabled is true
          : {
              options: [
                "inline",
                "blockType",
                "fontSize",
                "list",
                "textAlign",
                "colorPicker",
                "link",
                "history",
                "emoji",
              ],
              
            }
      }
    />
  );
}
