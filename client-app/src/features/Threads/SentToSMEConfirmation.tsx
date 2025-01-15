import { Button, Icon, Message } from "semantic-ui-react";
import { useNavigate, useParams } from "react-router-dom";

export default function SentToSMEConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Message positive icon size="large" className='industry'>
        <Icon name="check circle" />
        <Message.Content>
          <Message.Header className='industry'>Your Publication Has Been Sent!</Message.Header>
          Your publication has been sent to your Subject Matter Expert(s) for review.
          <p>They will review your submission and get back to you shortly.</p>
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
          onClick={() => navigate('/')}
          style={{ marginLeft: '10px' }}
        >
          <Icon name="home" />
          HOME
        </Button>
      </div>
    </div>
  );
}