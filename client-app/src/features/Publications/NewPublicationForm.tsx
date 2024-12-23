import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import {
  Container,
  Divider,
  Header,
  Icon,
  Form,
  Button,
  ButtonGroup,
  FormField,
  Segment,
  Grid,
  GridColumn,
  FormInput,
  TextArea,
  Label,
} from "semantic-ui-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { PublicationDTO } from "../../app/models/publicationDTO";
import { useStore } from "../../app/stores/store";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import DocumentUploadWidget from "../../app/common/documentUpload/documentUploadWidget";

export default observer(function NewPublicationForm() {
  const { publicationStore, userStore, usawcUserStore } = useStore();
  const { addPublication, publicationloading, uploading, uploadPublication } = publicationStore;
  const { appUser } = userStore;
  const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;

  const navigate = useNavigate();
  const [id] = useState(uuidv4());
  const [author, setAuthor] = useState<number | null>(appUser!.personId); // Selected author
  const [publicationLink, setPublicationLink] = useState("");
  const [publicationLinkName, setPublicationLinkName] = useState("");
  const [formErrors, setFormErrors] = useState({
    title: false,
    author: false,
  });
  const [showDocumentUploadWidget, setShowDocumentUploadWidget] = useState(false);
  const [publicationName, setPublicationName] = useState("");
  const [fileHasBeenUploaded, setFileHasBeenUploaded] = useState(false);

  // Memoize dropdown options
  const memoizedAuthorOptions = useMemo(() => {
    return usawcUsers.map((user) => ({
      key: user.personId,
      text: user.middleName
        ? `${user.lastName}, ${user.firstName}, ${user.middleName}`
        : `${user.lastName}, ${user.firstName}`,
      value: user.personId,
    }));
  }, [usawcUsers]);

  useEffect(() => {
    if (usawcUsers.length === 0 && !usawcUserloading) {
      loadUSAWCUsers();
    }
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

  const handleCancelButtonClick = () => {
    navigate("/publicationsmain");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title")?.toString().trim() || "";
    const errors = {
      title: title.trim() === "",
      author: author === null,
    };

    setFormErrors(errors);

    const hasErrors = Object.values(errors).some((error) => error);

    if (!hasErrors) {
      const publicationDTO: PublicationDTO = {
        id,
        title,
        createdByPersonId: appUser!.personId,
        updatedByPersonId: null,
        authorPersonId: author!,
        publicationLink,
        publicationLinkName,
      };
      try {
        await addPublication(publicationDTO);
      } catch (error) {
        console.log(error);
        toast.error("An error occurred during submit");
      }
    }
  };



  const handlePublicationUpload = async (file: Blob) => {
    try {
      await uploadPublication(file, id);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred during upload");
    } finally {
      setShowDocumentUploadWidget(false);
      setFileHasBeenUploaded(true);
    }
  };

  if (usawcUserloading) return <LoadingComponent content="loading..." />;

  return (
    <Container fluid>
      <Navbar />
      <Divider horizontal>
        <Header as="h1" className="industry">
          <Icon name="plus" />
          ADD A PUBLICATION FOR REVIEW
        </Header>
      </Divider>
      <Container>
        <Form onSubmit={handleSubmit}>
          <Form.Input
            label={
              <label>
                <span style={{ color: "red", fontSize: "2em" }}>*</span> TITLE
              </label>
            }
            name="title"
            placeholder="Enter publication title"
            error={formErrors.title && { content: "Title is required" }}
          />
          <Form.Dropdown
            label={
              <label>
                <span style={{ color: "red", fontSize: "2em" }}>*</span> AUTHOR
              </label>
            }
            placeholder="Select an author"
            fluid
            search
            selection
            clearable
            options={memoizedAuthorOptions}
            value={author ?? undefined}
            onChange={(e, { value }) => setAuthor(value as number || null)}
            error={formErrors.author && { content: "Author is required" }}
          />
          <FormField>
            <Divider horizontal>
              <Header as="h5" className="industry">
                <Icon name="paperclip" />
                PUBLICATION
                <Header.Subheader>
                  COPY AND PASTE A LINK TO YOUR PUBLICATION, OR UPLOAD IT
                </Header.Subheader>
              </Header>
            </Divider>
            {!showDocumentUploadWidget && (
              <Segment style={{ backgroundColor: "#F1E4C7" }}>
                <Grid columns={2} relaxed="very" stackable>
                  <GridColumn>
                    <Form.Field>
                      <label>PASTE A LINK TO YOUR PUBLICATION</label>
                      <TextArea
                        placeholder="Paste link here"
                        name="publicationlink"
                        value={publicationLink}
                        onChange={(e) => setPublicationLink(e.target.value)}
                        disabled={fileHasBeenUploaded}
                        readonly={fileHasBeenUploaded}
                      />
                    </Form.Field>
                    <FormInput
                      fluid
                      label="ENTER A TITLE FOR YOUR LINK"
                      placeholder="Enter link title"
                      name="publicationlinkname"
                      value={publicationLinkName}
                      onChange={(e) => setPublicationLinkName(e.target.value)}
                      disabled={fileHasBeenUploaded}
                      readonly={fileHasBeenUploaded}
                    />
                  </GridColumn>
                  <GridColumn verticalAlign="middle" textAlign="center">
                    {!fileHasBeenUploaded && 
                    <Button
                      content="UPLOAD YOUR PUBLICATION"
                      icon="upload"
                      size="big"
                      color="grey"
                      onClick={() => setShowDocumentUploadWidget(true)}
                      disabled={!!publicationLink || !!publicationLinkName}
                    />
                    }
                    {fileHasBeenUploaded && 
                    <ButtonGroup size='big'>
                     <Button basic color='blue' icon labelPosition="left"
               
                      >
                            <Icon name='download' />
                            {publicationName.length > 20 ? `${publicationName.substring(0, 20)}...` : publicationName} 
                      </Button>
                     <Button icon color='red' basic>
                        <Icon name='x' />
                      </Button>
                     </ButtonGroup>
                    }
                  </GridColumn>
                </Grid>
                <Divider vertical>Or</Divider>
              </Segment>
            )}
            {showDocumentUploadWidget && (
              <Segment style={{ backgroundColor: "#F1E4C7", position: "relative" }}>
                <Button
                  icon
                  onClick={() => setShowDocumentUploadWidget(false)}
                  color="black"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                  }}
                >
                  <Icon name="x" />
                </Button>
                <DocumentUploadWidget
                  uploadPublication={handlePublicationUpload}
                  loading={uploading}
                  setFileName={setPublicationName}
                />
                <span>{publicationName}</span>
              </Segment>
            )}
          </FormField>
          <ButtonGroup floated="right" size="big">
            <Button
              type="button"
              color="black"
              icon
              labelPosition="left"
              onClick={handleCancelButtonClick}
            >
              <Icon name="cancel" size="large" />
              CANCEL
            </Button>
            <Button
              type="submit"
              color="brown"
              icon
              labelPosition="right"
              loading={publicationloading}
            >
              <Icon name="arrow right" size="large" />
              SAVE AND CONTINUE
            </Button>
          </ButtonGroup>
        </Form>
      </Container>
    </Container>
  );
});
