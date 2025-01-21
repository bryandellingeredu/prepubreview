import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { Button, Container, Divider, Header, Icon, Loader, Search, SearchProps } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import PublicationTable from "./PublicationTable";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { Publication } from "../../app/models/publication";
import agent from "../../app/api/agent";

export default observer(function PublicationsMain() {
    const { publicationStore } = useStore();
    const { loadPublications,  publications, hasMore, publicationloading } = publicationStore;

    const navigate = useNavigate();

    const handleNewButtonClick = () => {
        navigate('/newpublicationform'); // Navigate to the newpublicationform route
    };

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Publication[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const debouncedSearch = debounce(async (value) => {
        if (value.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);

        try {
            const response = await agent.Publications.search(value);
            setResults(response);
        } catch (error) {
            console.error("Error fetching search results", error);
        } finally {
            setLoading(false);
        }
    }, 300);

    const handleSearchChange = (event: React.MouseEvent<HTMLElement>, data: SearchProps) => {
        setSearchQuery(data.value as string);
        debouncedSearch(data.value as string);
    };

    useEffect(() => {
        const redirectPath = localStorage.getItem("redirectToPath");
        if (redirectPath) {
          localStorage.removeItem("redirectToPath"); // Clear it from local storage
          navigate(`/${redirectPath}`); // Navigate to the stored path
        }
      }, [navigate]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, []);

    return (
        <Container fluid>
            <Navbar />
            <div style={{ display: "flex",
                          justifyContent: "space-between",
                          alignItems:"center",
                          marginTop: "1rem",
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          }}>
        <Search
                    loading={loading}
                    results={results.length > 0 ? results.map(result => ({
                        title: result.title,
                         description: `Author: ${result.authorFirstName} ${result.authorLastName}`,
                        key: result.id
                    })) : [{ title: 'No Results Found', description: '', key: 'no-results' }]}
                    value={searchQuery}
                    placeholder="Search publications..."
                    onSearchChange={handleSearchChange}
                    onResultSelect={(e, data) => {
                        const selectedResult = results.find(result => result.id === data.result.key);
                        if (selectedResult) {
                            navigate(`/threads/${selectedResult.id}`); // Navigate to the details page
                        }
                    }}
                />
                <Button color="brown" icon="plus" content="NEW PUBLICATION" onClick={handleNewButtonClick}/>
            </div>
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
            {publicationloading  &&
            <Loader active inline='centered' />}
        </Container>
    );
});