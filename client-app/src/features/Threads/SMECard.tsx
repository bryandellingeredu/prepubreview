import { Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Icon, Label } from "semantic-ui-react";
import { UserSubject } from "../../app/models/userSubject";

interface Props{
    userSubject : UserSubject
}

export default function SMECard({userSubject} : Props){

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
        <CardContent extra>

          <Button basic color='brown' floated="right" icon labelPosition='left'>
            <Icon name='check circle' />
           <span className="industry">SELECT THIS SME</span> 
          </Button>


      </CardContent>
      </Card> 
    )
}