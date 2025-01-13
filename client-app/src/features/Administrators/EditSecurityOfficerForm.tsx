import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useParams} from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, ButtonGroup, Container, Divider, Form, Header, Icon } from "semantic-ui-react";
import { SecurityOfficer } from "../../app/models/securityOfficer";

export default observer(function EditSecurityOfficerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {securityOfficerStore} = useStore();
    const {securityOfficers, securityOfficerLoading, loadSecurityOfficers, addUpdateSecurityOfficer} = securityOfficerStore;
    const [securityOfficer, setSecurityOfficer] = useState<SecurityOfficer | undefined>(undefined)
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load security officers if not already loaded
        if (securityOfficers.length === 0 && !securityOfficerLoading) {
          loadSecurityOfficers();
        } else {
          // Find the security officer based on the id from params
          const foundOfficer = securityOfficers.find(x => x.id === id);
          setSecurityOfficer(foundOfficer);
        }
      }, [securityOfficers, id, loadSecurityOfficers]);

      const getName = () => {
        if(securityOfficer){
         return securityOfficer.middleName ?
        `${securityOfficer.firstName} ${securityOfficer.middleName}  ${securityOfficer.lastName} ` :
        `${securityOfficer.firstName} ${securityOfficer.lastName} `;
        }
        return '';
      }

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSecurityOfficer((prev) => {
          if (!prev) return undefined;
          return { ...prev, [name]: value };
        });
      };

      const handleCancelButtonClick = () => {
        navigate('/managesecurityofficers');
      }

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(securityOfficer && securityOfficer.title && securityOfficer.scip){
            setSaving(true);
            try{
              await addUpdateSecurityOfficer(securityOfficer.id, securityOfficer.personId, securityOfficer.title, securityOfficer.scip);
              navigate('/managesecurityofficers');
            }catch(error){
              toast.error('an error occured during save')
            }finally{
                setSaving(false);
            }
        }
      }
       

      if(securityOfficerLoading || !securityOfficer) return <LoadingComponent content='loading security officer' />

  return(
    <Container fluid>
         <Navbar />
         <Divider horizontal>
        <Header as="h1" className="industry">
          <Icon name="plus" />
          EDIT SECURITY OFFICER {getName().toUpperCase()}
        </Header>
      </Divider>
      <Container>
     {securityOfficer && 
      <Form onSubmit={handleSubmit}>
         <Form.Input
            label={
                <label>
                  <span style={{ color: "red", fontSize: "2em" }}>*</span> TITLE
                </label>
              }
               name="title"
              value={securityOfficer.title}
              placeholder="Enter title for security officer"
              onChange={handleInputChange}
              error={!securityOfficer.title && {content: "Title is required"}}
         />
         <Form.Input
            label={
                <label>
                  <span style={{ color: "red", fontSize: "2em" }}>*</span> SCIP
                </label>
              }
               name="scip"
              value={securityOfficer.scip}
              placeholder="Enter SCIP for security officer"
              onChange={handleInputChange}
              error={!securityOfficer.scip && {content: "SCIP is required"}}
         />
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
              loading={saving}
            >
              <Icon name="save" size="large" />
              SAVE
            </Button>
          </ButtonGroup>
      </Form>
     }
      </Container>
    </Container>
  )

})
