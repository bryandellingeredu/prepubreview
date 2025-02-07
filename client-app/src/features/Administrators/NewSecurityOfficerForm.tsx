import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useEffect, useState, useMemo } from "react";
import { useNavigate} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "../../app/stores/store";
import { toast } from "react-toastify";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, ButtonGroup, Container, Divider, Form, Header, Icon } from "semantic-ui-react";

export default observer(function NewSecurityOfficerForm() {
    const navigate = useNavigate();
    const { usawcUserStore, securityOfficerStore } = useStore();
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
    const {addUpdateSecurityOfficer} = securityOfficerStore

    const [usawcUser, setUsawcUser] = useState<number | null>(null);

    const [saving, setSaving] = useState(false);

    const [formErrors, setFormErrors] = useState({
        usawcUser: false,
        title: false,
        scip: false,
      });

    useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers();
        }
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

      const memoizedSecurityOfficerOptions = useMemo(() => {
        return usawcUsers.map((user) => ({
          key: user.personId,
          text: user.middleName
            ? `${user.lastName}, ${user.firstName}, ${user.middleName}`
            : `${user.lastName}, ${user.firstName}`,
          value: user.personId,
        }));
      }, [usawcUsers]);

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title")?.toString().trim() || "";
        const scip = formData.get("scip")?.toString().trim() || "";

        const errors = {
            title: title.trim() === "",
            scip: scip.trim()  === "",
            usawcUser: usawcUser === null,
          };

          setFormErrors(errors);

          const hasErrors = Object.values(errors).some((error) => error);

          if(!hasErrors){
            setSaving(true);
            try{
              await addUpdateSecurityOfficer(uuidv4(), usawcUser!, title, scip);
              navigate('/managesecurityofficers');
            } catch (error) {
                console.log(error);
                toast.error("An error occurred during save");
            } finally {
                setSaving(false);
            }
          }
      }

      const handleCancelButtonClick = () => {
        navigate('/managesecurityofficers');
      }

    if (usawcUserloading ) return <LoadingComponent content="loading form..." />;

    return(
        <Container fluid>
           <Navbar />
           <Divider horizontal>
                <Header as="h1" className="industry">
                    <Icon name="plus" />
                        ADD A SECURITY OFFICER
                </Header>
            </Divider>
            <Container>
            <Form onSubmit={handleSubmit}>

                 <Form.Dropdown
                            label={
                              <label>
                                <span style={{ color: "red", fontSize: "2em" }}>*</span> SELECT A SECURITY OFFICER
                              </label>
                            }
                            placeholder="Select a Security Officer"
                            fluid
                            search
                            selection
                            clearable
                            options={memoizedSecurityOfficerOptions}
                            value={usawcUser ?? undefined}
                            onChange={(_e, { value }) => setUsawcUser(value as number || null)}
                            error={formErrors.usawcUser && { content: "required" }}
                          />
                   <Form.Input
                    label={
                    <label>
                        <span style={{ color: "red", fontSize: "2em" }}>*</span> TITLE
                    </label>
                    }
                    name="title"
                     placeholder="Enter the security officer's title"
                     error={formErrors.title && { content: "Title is required" }}
                  />

                   <Form.Input
                    label={
                    <label>
                        <span style={{ color: "red", fontSize: "2em" }}>*</span> SCIP
                    </label>
                    }
                    name="scip"
                     placeholder="Enter the security officer's SCIP"
                     error={formErrors.title && { content: "SCIP is required" }}
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
            </Container>
        </Container>
    )
})

