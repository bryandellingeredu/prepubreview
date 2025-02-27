import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { UsawcUser } from "../../app/models/usawcUser";
import { AppUser } from "../../app/models/appUser";
import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Icon, Popup } from "semantic-ui-react";

interface Props {
  supervisorPersonId: number;
  showDeleteButton: boolean;
  updateSupervisorPersonId: (newSupervisorPersonId: number | null) => void;
}

export default observer(function SupervisorCard({ supervisorPersonId, showDeleteButton, updateSupervisorPersonId }: Props) {
  const { usawcUserStore } = useStore();
  const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;

  const [supervisor, setSupervisor] = useState<UsawcUser | null>(null);
  const [open, setOpen] = useState(false);

  // Load users if not already loaded
  useEffect(() => {
    if (usawcUsers.length === 0 && !usawcUserloading) {
      loadUSAWCUsers();
    }
  }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

  // Fetch Supervisor Data
  useEffect(() => {
    if (usawcUsers.length > 0 && !usawcUserloading && supervisorPersonId) {
      const appUser: AppUser | null | undefined =
        usawcUserStore.getUserByPersonId(supervisorPersonId);
      if (appUser) {
        setSupervisor({
          personId: appUser.personId,
          firstName: appUser.firstName,
          lastName: appUser.lastName,
          middleName: appUser.middleName,
          armyEmail: appUser.armyEmail,
          eduEmail: appUser.eduEmail,
          organizationId: appUser.organizationId || 0,
          organizationDisplay: appUser.organizationDisplay,
        });
      }
    }
  }, [usawcUsers, usawcUserloading, supervisorPersonId]);

  const handleDelete = () =>{
    updateSupervisorPersonId(null);
    setOpen(false);
  }

  const getName = () => 
    supervisor!.middleName ?
     `${supervisor!.firstName} ${supervisor!.middleName}  ${supervisor!.lastName} ` :
     `${supervisor!.firstName} ${supervisor!.lastName} `

  // Show loading if data is not available
  if (usawcUserloading || !supervisor) {
    return <LoadingComponent content="Loading supervisor data..." />;
  }

  return (
    <Card color='brown'>
           <CardContent>
           <CardHeader className="industry">{getName()}</CardHeader>
           {supervisor.organizationDisplay && 
                <CardMeta>
                    {supervisor.organizationDisplay}
                </CardMeta>
            }
              {supervisor && supervisor.eduEmail && 
            <CardDescription>
            <Icon name='envelope' />
            <span className="industry"> EDU EMAIL: </span>
            <span className="giLite">
            <a href={`mailto:${supervisor.eduEmail}`}>
                {supervisor.eduEmail}
            </a>
            </span>
          </CardDescription>
          }
            {supervisor && supervisor.armyEmail && 
          <CardDescription>
            <Icon name='envelope' />
            <span className="industry"> ARMY EMAIL: </span>
            <span className="giLite">
            <a href={`mailto:${supervisor.armyEmail}`}>
                {supervisor.armyEmail}
            </a>
            </span>
          </CardDescription>
          }
           </CardContent>
           <CardContent extra>
           
          {showDeleteButton && 
                  <Popup
                        trigger={
                          <Button basic color='red' floated="right" icon labelPosition='left' onClick={() => setOpen(true)} >
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
                           <p>Are you sure you want to delete this Supervisor</p>
                              <Button color="red" onClick={handleDelete} >
                                Yes
                              </Button>
                            <Button color="grey" onClick={() => setOpen(false)}>
                               No
                             </Button>
                        </div>
                        }
                        />
                }
           </CardContent>
    </Card>
  );
});