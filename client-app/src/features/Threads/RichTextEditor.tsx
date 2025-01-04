import { Editor } from "react-draft-wysiwyg";
import { convertToRaw, EditorState, convertFromRaw, Modifier } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useEffect, useState } from "react";

interface Props{
    content: string
    updateThreadComments: (threadId: string, newComments: string) => void 
    threadId: string
}
export default function RichTextEditor({content, updateThreadComments, threadId } : Props){

     const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
      );

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
        }, [content]);

        const handleEditorChange = (newEditorState: EditorState) => {
            setEditorState(newEditorState);
            const contentAsString: string = JSON.stringify(
              convertToRaw(newEditorState.getCurrentContent())
            );
            updateThreadComments(threadId, contentAsString); // Corrected function name
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



    return(
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
    )
}