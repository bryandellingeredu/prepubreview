import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { Container, Divider, Header, Icon, Form, Button, ButtonGroup  } from "semantic-ui-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { PublicationDTO } from "../../app/models/publicationDTO";
import { useStore } from "../../app/stores/store";
import { toast } from "react-toastify";

export default observer(function NewPublicationForm() {
    const { publicationStore } = useStore();
    const {addPublication, publicationloading} = publicationStore 
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [id] = useState(uuidv4());
    
    const [formErrors, setFormErrors] = useState({
        title: false,
      });

      const handleCancelButtonClick = () => {
        navigate('/publicationsmain'); // Navigate to the newpublicationform route
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = {
            title: title.trim() === ""
          };

          setFormErrors(errors);

          const hasErrors = Object.values(errors).some((error) => error);

          if (!hasErrors) {
            const publicationDTO : PublicationDTO = {id, title}
            try{
              await addPublication(publicationDTO);
              
            }catch(error){
                console.log(error);
                toast.error('an error occured during submit');
            }
          
          }
      };

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
    label="TITLE"
    placeholder="Enter publication title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    error={
        formErrors.title && {
          content: "Title is required"
        }
      }
/>
<ButtonGroup floated="right">
    <Button type="button" color='black' icon labelPosition="left" onClick={handleCancelButtonClick}>
    <Icon name="cancel" size="large"/>
        CANCEL
    </Button>
    <Button type="submit" color="brown" icon labelPosition="left" loading={publicationloading}>
    <Icon name="save" size="large" />
          SUBMIT
    </Button>
</ButtonGroup>
</Form>
</Container>
</Container>
  )
})