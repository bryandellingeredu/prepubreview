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
  Message,
  Popup,
} from "semantic-ui-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { PublicationDTO } from "../../app/models/publicationDTO";
import { useStore } from "../../app/stores/store";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import DocumentUploadWidget from "../../app/common/documentUpload/documentUploadWidget";
import agent from "../../app/api/agent";
import DocumentDownloadWidget from "../../app/common/documentDownload/documentDownloadWidget";

export default observer(function NewPublicationForm() {
  const { pubid } = useParams();
  const { publicationStore, userStore, usawcUserStore } = useStore();
  const { addPublication, publicationloading, uploading, uploadPublication, getPublicationById } = publicationStore;
  const { appUser} = userStore;
  const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;

  const navigate = useNavigate();
  const [id] = useState(pubid || uuidv4());
  const [author, setAuthor] = useState<number | null>(appUser!.personId); // Selected author
  const [publicationLink, setPublicationLink] = useState("");
  const [formErrors, setFormErrors] = useState({
    title: false,
    author: false,
    publication: false,
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


  const [existingTitle, setExistingTitle] = useState('');
  const [existingPublicationLinkName, setExistingPublicationLinkName] = useState('');

  const [loadingMeta, setLoadingMeta] = useState(false);

  useEffect(() => {
    if (pubid) {
      setLoadingMeta(true);
        agent.AttachmentMetaDatas.details(pubid)
            .then((metaData) => {
                if (metaData && metaData.fileName) {
                    setPublicationName(metaData.fileName);
                    setFileHasBeenUploaded(true);
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
}, [pubid]);

  const[loadingPub, setLoadingPub] = useState(false);

  useEffect(() => {
    if (pubid) {
      setLoadingPub(true);
        getPublicationById(pubid).then((publication) => {
            // Handle the publication object here
            console.log(publication);
            if (publication) {
              setExistingTitle(publication.title);
              setAuthor(publication.authorPersonId);
              setPublicationLink(publication.publicationLink);
              setExistingPublicationLinkName(publication.publicationLinkName);
              setLoadingPub(false);
          }
        }).catch((error) => {
            // Optionally handle any errors here
            console.error("Error fetching publication:", error);
            toast.error('error loading publication');
            setLoadingPub(false);
        });
    }
}, [pubid]);

  useEffect(() => {
    if (usawcUsers.length === 0 && !usawcUserloading) {
      loadUSAWCUsers();
    }
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

  const handleCancelButtonClick = () => {
    navigate('/publicationsmain')
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title")?.toString().trim() || "";
    const publicationLinkName = formData.get("publicationlinkname")?.toString().trim() || "";
    const errors = {
      title: title.trim() === "",
      author: author === null,
      publication: !fileHasBeenUploaded && !publicationLink
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
        navigate(`/threads/${id}`);
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

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async() => {
    setDeleting(true)
    try{
      await agent.AttachmentMetaDatas.delete(id);
      setPublicationName('');
      setFileHasBeenUploaded(false);

    }catch(error){
      console.log(error);
      toast.error("An error occurred deleting the attachment");
    }
    finally{
      setOpen(false);
    }


};

const handleCancel = () => {
    console.log("Cancelled!");
    setOpen(false);
};

  if (usawcUserloading || loadingMeta || loadingPub) return <LoadingComponent content="loading..." />;

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
            defaultValue={existingTitle || ""}
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
                 PUBLICATION 
                <Header.Subheader>
                  COPY AND PASTE A LINK TO YOUR PUBLICATION, OR UPLOAD IT
                </Header.Subheader>
              </Header>
            </Divider>
            {formErrors.publication && 
            <Message color="red" negative  style={{ textAlign: "center" }}>
            <h5>ERROR: COPY AND PASTE A LINK OR UPLOAD YOUR PUBLICATION</h5>
            </Message>
            }
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
                        readOnly={fileHasBeenUploaded}
                      />
                    </Form.Field>
                    <FormInput
                      fluid
                      label="ENTER A TITLE FOR YOUR LINK"
                      placeholder="Enter link title"
                      name="publicationlinkname"
                      disabled={fileHasBeenUploaded}
                      readOnly={fileHasBeenUploaded}
                      defaultValue={existingPublicationLinkName || ""}
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
                      disabled= {publicationLink?true:false }
                    />
                    }
                    {fileHasBeenUploaded && 
                    <ButtonGroup size='big'>
                     <DocumentDownloadWidget id={id} publicationName={publicationName} />
                     <Button icon color='brown' type='button' basic   onClick={() => setShowDocumentUploadWidget(true)}
                      disabled= {publicationLink?true:false }>
                        <Icon name='upload' />
                      </Button>


                      <Popup
                        trigger={
                          <Button icon color='red' basic type='button' onClick={() => setOpen(true)} loading={deleting}>
                            <Icon name='x' />
                          </Button>
                         }
                           on="click"
                          open={open}
                          onClose={() => setOpen(false)}
                          position="top center"
                        content={
                        <div>
                           <p>Are you sure you want to delete this publication</p>
                              <Button color="red" onClick={handleDelete}>
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
