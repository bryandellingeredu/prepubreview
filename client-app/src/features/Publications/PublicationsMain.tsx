import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { Button, Container, Divider, Header, Icon } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import PublicationTable from "./PublicationTable";
import { useNavigate } from "react-router-dom";

export default observer(function PublicationsMain() {
    const { publicationStore } = useStore();
    const { loadPublications,  publications, hasMore, publicationloading } = publicationStore;

    const navigate = useNavigate();

    useEffect(() => {
        if (publications.length === 0 && !publicationloading ) {
            loadPublications(); // Load initial publications if none are loaded
        }
    }, [loadPublications, publications.length, publicationloading ]);



    const handleNewButtonClick = () => {
        navigate('/newpublicationform'); // Navigate to the newpublicationform route
    };

    return (
        <Container fluid>
            <Navbar />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button color="brown" icon="plus" content="NEW PUBLICATION" onClick={handleNewButtonClick}/>
            </div>
            <Divider horizontal>
                <Header as="h1" className="industry">
                    <Icon name="book" />
                    PRE-PUBLICATION SECURITY & POLICY REVIEW THREADS
                </Header>
            </Divider>
            <InfiniteScroll
                pageStart={0}
                loadMore={loadPublications} // Directly pass the loadPublications function
                hasMore={hasMore}
            >
                <PublicationTable publications={publications} />
            </InfiniteScroll>
            {publicationloading  && 
            <Button type='button' disabled floated="right" color='grey'  loading={publicationloading} content='loading...'/>}
        </Container>
    );
});