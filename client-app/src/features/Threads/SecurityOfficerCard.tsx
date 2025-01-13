import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { SecurityOfficer } from "../../app/models/securityOfficer";
import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Icon, Popup } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { AppUser } from "../../app/models/appUser";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Props{
    securityOfficer: SecurityOfficer
    threadId: string
    showSelectButton: boolean,
    showRemoveButton: boolean,
    showDeleteButton: boolean,
    showEditButton: boolean
}



export default observer(function SecurityOfficerCard (
    {securityOfficer, threadId,  showSelectButton, showRemoveButton, showDeleteButton, showEditButton} : Props
){
    const { usawcUserStore, securityOfficerStore } = useStore();
    const { usawcUsers, usawcUserloading, loadUSAWCUsers, getUserByPersonId } = usawcUserStore;
    const {deleteSecurityOfficer} = securityOfficerStore
    const [user, setUser] = useState<AppUser | null>(null);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const handleCancel = () => {
      setOpen(false);
  };

      useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers();
        }
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

      useEffect(() => {
        if (usawcUsers.length > 0 && !usawcUserloading){
          setUser(getUserByPersonId(securityOfficer.personId))
        } 
      })

      const handleDelete = async () => {
        setDeleting(true);
        setOpen(false);
        try{
          await deleteSecurityOfficer(securityOfficer.id)
        }catch(error){
          console.error("Error deleting security officer:", error);
          toast.error('Error deleting security officer');
        }finally{
          setDeleting(false);
        }
      }

      const handleEditClick = () =>{
        navigate(`/editsecurityofficer/${securityOfficer.id}`)
      }



    const getName = () => 
        securityOfficer.middleName ?
         `${securityOfficer.firstName} ${securityOfficer.middleName}  ${securityOfficer.lastName} ` :
         `${securityOfficer.firstName} ${securityOfficer.lastName} `

    if(usawcUserloading || !user) return <LoadingComponent content='loading security officers'/>

    return(
        <Card color='brown'>
             <CardContent>
             <CardHeader className="industry">{getName()}</CardHeader>
             {securityOfficer.organizationDisplay && 
                <CardMeta>
                    {securityOfficer.organizationDisplay}
                </CardMeta>
            }
            {user && user.eduEmail && 
            <CardDescription>
            <Icon name='envelope' />
            <span className="industry"> EDU EMAIL: </span>
            <span className="giLite">
            <a href={`mailto:${user.eduEmail}`}>
                {user.eduEmail}
            </a>
            </span>
          </CardDescription>
          }
          {user && user.armyEmail && 
          <CardDescription>
            <Icon name='envelope' />
            <span className="industry"> ARMY EMAIL: </span>
            <span className="giLite">
            <a href={`mailto:${user.armyEmail}`}>
                {user.armyEmail}
            </a>
            </span>
          </CardDescription>
          }
          </CardContent>
          <CardContent extra>
            <Icon name='briefcase' />
            <span className="industry"> TITLE: </span>
            <span className="gilite">{securityOfficer.title}</span>
          </CardContent>
          <CardContent extra>
            <Icon name='pin' />
            <span className="industry"> SCIP: </span>
            <span className="gilite">{securityOfficer.scip}</span>
          </CardContent>
          <CardContent extra>
          
          {showEditButton &&
              <Button basic color='brown' floated="right" icon labelPosition='left' onClick={handleEditClick}>
              <Icon name='edit' />
             <span className="industry">EDIT</span> 
             </Button>
          }

          {showDeleteButton && 
                  <Popup
                        trigger={
                          <Button basic color='red' floated="right" icon labelPosition='left' onClick={() => setOpen(true)} loading={deleting}>
                          <Icon name='x' />
                          <span className="industry">DELETE</span> 
                        </Button>
                         }
                           on="click"
                          open={open}
                          onClose={() => setOpen(false)}
                          position="top center"
                        content={
                        <div>
                           <p>Are you sure you want to delete this Security Officer</p>
                              <Button color="red" onClick={handleDelete} >
                                Yes
                              </Button>
                            <Button color="grey" onClick={handleCancel}>
                               No
                             </Button>
                        </div>
                        }
                        />
                }
      


            </CardContent>
        </Card>
    )
})