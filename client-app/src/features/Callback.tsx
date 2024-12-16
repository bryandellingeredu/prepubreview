import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../app/stores/store';
import { Button, Container, Icon, Message } from 'semantic-ui-react';
import LoadingComponent from '../app/layout/LoadingComponent';

export default function CallbackPage() {
    const { userStore } = useStore();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null); // Define error as string or null
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoginCallback = async () => {
            try {
                await userStore.handleCallback();

                // Check for redirectPath in userStore or localStorage
                const redirectPath = userStore.redirectPath || localStorage.getItem('redirectPath');
                if (redirectPath) {
                    userStore.clearRedirectPath(); // Clear the redirect path after use
                    navigate(redirectPath); // Redirect to the intended path
                } else {
                    navigate('/publicationsmain'); // Default redirect if no path is set
                }
            } catch (err: unknown) {
                setLoading(false);
                // Safely parse the error to extract the message
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
                console.error('Error during callback handling:', err);
            }
        };

        handleLoginCallback();
    }, []); // No unnecessary dependencies

    if (loading) return <LoadingComponent content="Logging In..." />;

    return (
        <Container style={{ textAlign: 'center', marginTop: '100px' }}>
            {error && (
                <Message negative size="large" icon>
                    <Icon name="exclamation triangle" />
                    <Message.Content>
                        <Message.Header>An error occurred logging in</Message.Header>
                        <div>{error || 'An unknown error occurred. Please try again.'}</div>
                        <Button
                            color="red"
                            type="button"
                            style={{ marginTop: '1em' }}
                            onClick={() => navigate('/')}
                        >
                            Try Again
                        </Button>
                    </Message.Content>
                </Message>
            )}
        </Container>
    );
}