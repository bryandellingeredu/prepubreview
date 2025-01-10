import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { SecurityOfficer } from "../../app/models/securityOfficer";
import { Card, CardContent, CardDescription, CardHeader, CardMeta, Icon } from "semantic-ui-react";
import { useEffect, useState } from "react";
import { AppUser } from "../../app/models/appUser";
import LoadingComponent from "../../app/layout/LoadingComponent";

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
    const { usawcUserStore } = useStore();
    const { usawcUsers, usawcUserloading, loadUSAWCUsers, getUserByPersonId } = usawcUserStore;
    const [user, setUser] = useState<AppUser | null>(null);

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
        </Card>
    )
})