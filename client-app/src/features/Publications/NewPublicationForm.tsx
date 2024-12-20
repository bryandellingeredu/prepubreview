import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { Container, Divider, Header, Icon, Form, Button, ButtonGroup, FormField, Segment, Grid, GridColumn, FormInput  } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { PublicationDTO } from "../../app/models/publicationDTO";
import { useStore } from "../../app/stores/store";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";

interface authorOption {
    key: number;
    text: string;
    value: number;
}

export default observer(function NewPublicationForm() {
    const { publicationStore, userStore, usawcUserStore} = useStore();
    const {addPublication, publicationloading} = publicationStore;
    const {appUser} = userStore;
    const {usawcUsers, usawcUserloading, loadUSAWCUsers} = usawcUserStore

    const navigate = useNavigate();
    const [id] = useState(uuidv4());
    const [authorOptions, setAuthorOptions] = useState<authorOption[]>([]);
    const [author, setAuthor] = useState<number | null>(appUser!.personId); // Selected author

    useEffect(() => {
      if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers(); // Load users if none are loaded
      } else {
          setAuthorOptions(
              usawcUsers.map(user => ({
                  key: user.personId,
                  text: user.middleName ? `${user.lastName}, ${user.firstName}, ${user.middleName}` : `${user.lastName}, ${user.firstName}`, 
                  value: user.personId,
              }))
          );
      }
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);


    const [formErrors, setFormErrors] = useState({
        title: false,
        author: false
      });

      const handleCancelButtonClick = () => {
        navigate('/publicationsmain'); // Navigate to the newpublicationform route
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
            const publicationDTO : PublicationDTO = {
              id,
              title,
              createdByPersonId: appUser!.personId,
              updatedByPersonId: null,
              authorPersonId : author!}
            try{
              debugger;
              await addPublication(publicationDTO);
              
            }catch(error){
                console.log(error);
                toast.error('an error occured during submit');
            }
          
          }
      };

  if(usawcUserloading) return <LoadingComponent content='loading...' />;

  return(
    <Container fluid>
    <Navbar />
    <Divider horizontal>
    <Header as="h1" className="industry">
        <Icon name="plus" />
        ADD A PUBLICATION FOR REVIEW
    </Header>
</Divider>
<Container>
<Form onSubmit={handleSubmit}  >
<Form.Input
     label={<label><span style={{ color: 'red', fontSize: '2em' }}>*</span> TITLE</label>}
    name="title"
    placeholder="Enter publication title"
    error={
        formErrors.title && {
          content: "Title is required"
        }
      }
/>
<Form.Dropdown
      label={<label><span style={{ color: 'red', fontSize: '2em' }}>* </span> AUTHOR</label>}
    placeholder="Select an author"
    fluid
    search
    selection
    clearable
    options={authorOptions}
    value={author ?? undefined}
    onChange={(e, { value }) => setAuthor(value as number || null)} 
       error={
       formErrors.author && {
                                content: "Author is required",
                            }
                        }
    />
    <FormField>
      <label>PUBLICATION</label>
    <Segment  style={{backgroundColor: '#F1E4C7'}} >
    <Grid columns={2} relaxed='very' stackable>
      <GridColumn>
     
          <FormInput
           fluid
            icon='paperclip'
            iconPosition='left'
            label='ENTER A LINK TO YOUR PUBLICATION'
            placeholder='paste link here'
            name='publicationlink'
          />

      
      </GridColumn>

      <GridColumn verticalAlign='middle' textAlign="center">
        <Button content='UPLOAD YOUR PUBLICATION' icon='upload' size='big' color='grey' />
      </GridColumn>
    </Grid>

    <Divider vertical>Or</Divider>
  </Segment>
    </FormField>
<ButtonGroup floated="right" size="big">
    <Button type="button" color='black' icon labelPosition="left" onClick={handleCancelButtonClick}>
    <Icon name="cancel" size="large"/>
        CANCEL
    </Button>
    <Button type="submit" color="brown" icon labelPosition="right" loading={publicationloading}>
    <Icon name="arrow right" size="large" />
          SAVE AND CONTINUE
    </Button>
</ButtonGroup>
</Form>
</Container>
</Container>
  )
})