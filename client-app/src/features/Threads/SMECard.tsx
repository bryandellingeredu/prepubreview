import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Icon, Label, Popup } from "semantic-ui-react";
import { UserSubject } from "../../app/models/userSubject";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { useState } from "react";

interface Props{
    userSubject : UserSubject,
    addSME: (threadId: string, personId: number) => void;
    removeSME: (threadId: string, personId: number) => void;
    threadId: string;
    showSelectButton: boolean,
    showRemoveButton: boolean
}


export default observer(function SMECard(
  {userSubject, addSME, removeSME, threadId, showSelectButton, showRemoveButton} : Props){
  const { modalStore } = useStore();
  const {closeModal} = modalStore;

  const handleSelectClick = () =>{
    addSME(threadId, userSubject.usawcUser.personId)
    closeModal();
  }

  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
};

  const handleRemove = () =>{
    removeSME(threadId, userSubject.usawcUser.personId)
    setOpen(false);
  } 
  

    const getSMEName = () => 
        userSubject.usawcUser.middleName ?
         `${userSubject.usawcUser.firstName} ${userSubject.usawcUser.middleName}  ${userSubject.usawcUser.lastName} ` :
         `${userSubject.usawcUser.firstName} ${userSubject.usawcUser.lastName} `

    return(
        <Card color='brown'>
        <CardContent>
          <CardHeader className="industry">{getSMEName()}</CardHeader>
          {userSubject.usawcUser.organizationDisplay && 
          <CardMeta>
            {userSubject.usawcUser.organizationDisplay}
          </CardMeta>
          }
          {userSubject.usawcUser.eduEmail && 
          <CardDescription>
            <Icon name='envelope' />
            <span className="industry"> EDU EMAIL: </span>
            <span className="giLite">
            <a href={`mailto:${userSubject.usawcUser.eduEmail}`}>
                {userSubject.usawcUser.eduEmail}
            </a>
            </span>
          </CardDescription>
          }
             {userSubject.usawcUser.armyEmail && 
          <CardDescription>
            <Icon name='envelope' />
            <span className="industry"> ARMY EMAIL: </span>
            <span className="giLite">
            <a href={`mailto:${userSubject.usawcUser.armyEmail}`}>
                {userSubject.usawcUser.armyEmail}
            </a>
            </span>
          </CardDescription>
          }
        </CardContent>
        <CardContent extra>
        {userSubject.subjects.map((subject) => (
                <Label className="industry" key={subject}  content={subject} style={{margin: '1px'}} />
            ))}
        </CardContent>
        
        { (showSelectButton || showRemoveButton) &&
        <CardContent extra>

        {showSelectButton &&
          <Button basic color='brown' floated="right" icon labelPosition='left' onClick={handleSelectClick}>
            <Icon name='check circle' />
           <span className="industry">SELECT THIS SME</span> 
          </Button>
        }

        {showRemoveButton && 
                  <Popup
                        trigger={
                          <Button basic color='red' floated="right" icon labelPosition='left' onClick={() => setOpen(true)}>
                          <Icon name='x' />
                          <span className="industry">REMOVE THIS SME</span> 
                        </Button>
                         }
                           on="click"
                          open={open}
                          onClose={() => setOpen(false)}
                          position="top center"
                        content={
                        <div>
                           <p>Are you sure you want to remove this SME</p>
                              <Button color="red" onClick={handleRemove}>
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
      }
      </Card> 
    )
})