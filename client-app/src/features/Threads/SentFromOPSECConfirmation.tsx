import { Button, Icon, Message } from "semantic-ui-react";
import { useNavigate, useParams } from "react-router-dom";

export default function SentFromOPSECConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {status} = useParams();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Message positive icon size="large" className='industry'>
        <Icon name="check circle" />
        <Message.Content>
          <Message.Header className='industry'>Your Operational Security Officer Review Has Been Recorded!</Message.Header>
          {status === 'accept' &&
          <>
          Thank you for reviewing this publication
          <p>This publication has completed the review process and is ready for release.</p>
          <p>The author will be notified.</p>
          <p><i>You may safely close this window</i></p>
          </>
        }
         {status === 'decline' &&
          <>
          Thank you for reviewing this publication
          <p>You have rejected this publication and sent it back to the author for revision</p>
          <p>You will receive another review task when their revision is complete</p>
          <p><i>You may safely close this window</i></p>
          </>
        }
        </Message.Content>
      </Message>

      <div style={{ marginTop: '20px' }}>
        <Button
          color="black"
          onClick={() => navigate(`/threads/${id}`)}
        >
          <Icon name="arrow left" />
          BACK
        </Button>

        <Button
          color="brown"
          onClick={() => navigate('/publicationsmain')}
          style={{ marginLeft: '10px' }}
        >
          <Icon name="home" />
          HOME
        </Button>
      </div>
    </div>
  );
}