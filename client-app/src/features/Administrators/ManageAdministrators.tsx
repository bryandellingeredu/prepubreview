import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, Divider, Header, Icon, Segment, SegmentGroup, Form } from "semantic-ui-react";
import { Administrator } from "../../app/models/administrator";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";


export default observer(function ManageAdministrators() {
    const navigate = useNavigate();
    const [localDeletingId, setLocalDeletingId] = useState<string | null>(null);
    const {administratorStore, usawcUserStore} = useStore();
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
    const { administrators, administratorLoading, loadAdministrators, addAdministrator, deleteAdministrator, addingAdministrator, deletingAdministrator} = administratorStore;

    useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers();
        }
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);


      useEffect(() => {
        loadAdministrators();
      }, []);

      const handleDeleteButton = async (admin: Administrator) => {
        setLocalDeletingId(admin.id)
          try {
            await deleteAdministrator(admin.id)
          } catch (e: any) {
            console.log(e);
            if (e && e.message) {
              toast.error('An error occurred: ' + e.message);
            } else {
              toast.error('an error occured');
            }
          }finally {
            setLocalDeletingId(null); // Clear the deleting ID
          }
      };

      const getName = (admin: Administrator) : string =>
        admin.middleName?
      `${admin.firstName} ${admin.middleName}  ${admin.lastName} ` :
      `${admin.firstName} ${admin.lastName} `
      
      const options = useMemo(() => {
        return usawcUsers.map((user) => ({
          key: user.personId,
          text: user.middleName
            ? `${user.lastName}, ${user.firstName}, ${user.middleName}`
            : `${user.lastName}, ${user.firstName}`,
          value: user.personId,
        }));
      }, [usawcUsers]);




      const [dropdownKey, setDropdownKey] = useState(0);

      const handleSelectAdminChange = async (value: number | null) => {
        if (value) {
          try {
            await addAdministrator({ id: uuidv4(), personId: value });
          } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'An error occurred while adding the administrator');
          } finally {
            // Reset the dropdown by changing its key
            setDropdownKey((prevKey) => prevKey + 1);
          }
        }
      };

      const handleGoBackClick = () => {
        navigate(-1); // Go back to the previous page
    };


    if(usawcUserloading || administratorLoading) return <LoadingComponent content="loading administrators" />
    
    return(
      <>
      <Navbar />

      <div style={{ display: "flex",
                          justifyContent: "space-between",
                          alignItems:"center",
                          marginTop: "1rem",
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          }}>
                 <Button icon labelPosition='left' color='black' onClick={handleGoBackClick}>
                    <Icon name='arrow left' />
                        BACK
                    </Button>
                 
                    
        </div>
       
      <Divider horizontal>
            <Header as="h1" className="industry">
              <Icon name="settings" />
              MANAGE ADMINISTRATORS
            </Header>
        </Divider>

        <SegmentGroup style={{ marginTop: '40px', padding: '20px' }}>
        <Segment textAlign="center" style={{backgroundColor: '#F1E4C7'}}>
              <Header icon  as="h4" className="industry" >
                <Icon name="user" />
                CURRENT ADMINISTRATORS
              </Header>
     
              <p></p>
              {administrators.map((admin) => (
             <Button
             key={admin.id}
             icon
             labelPosition="left"
             basic
             color="grey"
             size="large"
             onClick={() => handleDeleteButton(admin)}
             loading={localDeletingId === admin.id} // Only show spinner on the deleting button
           >
             <Icon name="x" color="red" />
             {getName(admin)}
           </Button>
              ))}

            </Segment>

            <Segment style={{backgroundColor: '#F1E4C7'}}>
            <Header icon  textAlign="center" as="h4" className="industry">
                <Icon name="plus" />
                ADD A NEW ADMINISTRATOR
              </Header>
              <Form.Dropdown
      key={dropdownKey} // Reset the dropdown by changing the key
      label={
        <label>
          <span className="industry">SELECT AN ADMIN</span>
        </label>
      }
      placeholder="Select an administrator"
      fluid
      search
      selection
      clearable
      options={options}
      loading={addingAdministrator}
      onChange={(e, { value }) => handleSelectAdminChange(value as number | null)}
    />
            </Segment>
        </SegmentGroup>

        </>
    )
})