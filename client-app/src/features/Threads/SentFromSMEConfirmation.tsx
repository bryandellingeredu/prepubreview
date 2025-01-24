import { Button, Icon, Message } from "semantic-ui-react";
import { useNavigate, useParams } from "react-router-dom";

export default function SentFromSMEConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {status} = useParams();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Message positive icon size="large" className='industry'>
        <Icon name="check circle" />
        <Message.Content>
          <Message.Header className='industry'>Your SME Review Has Been Recorded!</Message.Header>
          {status === 'accept' &&
          <>
          Thank you for reviewing this publication
          <p>After all SMEs have finished there review this publication will be sent to a Security Officer for review</p>
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