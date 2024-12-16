import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { Container, Divider, Header, Icon } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import PublicationTable from "./PublicationTable";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer(function PublicationsMain() {
    const { publicationStore } = useStore();
    const { loadPublications,  publications, hasMore, publicationloading } = publicationStore;

    useEffect(() => {
        if (publications.length === 0 && !publicationloading ) {
            loadPublications(); // Load initial publications if none are loaded
        }
    }, [loadPublications, publications.length, publicationloading ]);

    return (
        <Container fluid>
            <Navbar />
            <Divider horizontal>
                <Header as="h1" className="industry">
                    <Icon name="book" />
                    PRE-PUBLICATION SECURITY & POLICY REVIEW
                </Header>
            </Divider>
            <InfiniteScroll
                pageStart={0}
                loadMore={loadPublications} // Directly pass the loadPublications function
                hasMore={hasMore}
            >
                <PublicationTable publications={publications} />
            </InfiniteScroll>
            {publicationloading  && <LoadingComponent content='loading data...' />}
        </Container>
    );
});