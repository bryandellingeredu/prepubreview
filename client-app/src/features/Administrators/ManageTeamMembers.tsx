import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, Divider, Header, Icon, Segment, SegmentGroup, Form } from "semantic-ui-react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { TeamMember } from "../../app/models/teammember";


export default observer(function ManageTeamMembers() {
    const navigate = useNavigate();
    const [localDeletingId, setLocalDeletingId] = useState<string | null>(null);
    const {teamMemberStore, usawcUserStore} = useStore();
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
    const { teamMembers, teamMemberLoading, loadTeamMembers, addTeamMember, deleteTeamMember, addingTeamMember} = teamMemberStore;

    useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers();
        }
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);


      useEffect(() => {
        loadTeamMembers();
      }, []);

      const handleDeleteButton = async (teamMember: TeamMember) => {
        setLocalDeletingId(teamMember.id)
          try {
            await deleteTeamMember(teamMember.id)
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

      const getName = (teamMember: TeamMember) : string =>
        teamMember.middleName?
      `${teamMember.firstName} ${teamMember.middleName}  ${teamMember.lastName} ` :
      `${teamMember.firstName} ${teamMember.lastName} `
      
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

      const handleSelectTeamMemberChange = async (value: number | null) => {
        if (value) {
          try {
            await addTeamMember({ id: uuidv4(), personId: value });
          } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'An error occurred while adding the team member');
          } finally {
            // Reset the dropdown by changing its key
            setDropdownKey((prevKey) => prevKey + 1);
          }
        }
      };

      const handleGoBackClick = () => {
        navigate('/publicationsmain'); // Go back to the previous page
    };

    if(usawcUserloading || teamMemberLoading) return <LoadingComponent content="loading team members" />
    
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
              MANAGE PRE PUB TEAM MEMBERS
            </Header>
        </Divider>

        <SegmentGroup style={{ marginTop: '40px', padding: '20px' }}>
        <Segment textAlign="center" style={{backgroundColor: '#F1E4C7'}}>
              <Header icon  as="h4" className="industry" >
                <Icon name="user" />
                CURRENT TEAM MEMBERS
              </Header>
     
              <p></p>
              {teamMembers.map((teamMember) => (
             <Button
             key={teamMember.id}
             icon
             labelPosition="left"
             basic
             color="grey"
             size="large"
             onClick={() => handleDeleteButton(teamMember)}
             loading={localDeletingId === teamMember.id} // Only show spinner on the deleting button
           >
             <Icon name="x" color="red" />
             {getName(teamMember)}
           </Button>
              ))}

            </Segment>

            <Segment style={{backgroundColor: '#F1E4C7'}}>
            <Header icon  textAlign="center" as="h4" className="industry">
                <Icon name="plus" />
                ADD A NEW TEAM MEMBER
              </Header>
              <Form.Dropdown
      key={dropdownKey} // Reset the dropdown by changing the key
      label={
        <label>
          <span className="industry">SELECT A TEAM MEMBER</span>
        </label>
      }
      placeholder="Select a team member"
      fluid
      search
      selection
      clearable
      options={options}
      loading={addingTeamMember}
      onChange={(_e, { value }) => handleSelectTeamMemberChange(value as number | null)}
    />
            </Segment>
        </SegmentGroup>

        </>
    )
})