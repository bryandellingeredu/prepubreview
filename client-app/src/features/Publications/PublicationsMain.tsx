import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { Button, Container, Divider, Header, Icon, Search, SearchProps } from "semantic-ui-react";
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

    useEffect(() => {
        if (publications.length === 0 && !publicationloading ) {
            loadPublications(); // Load initial publications if none are loaded
        }
    }, [loadPublications, publications.length, publicationloading ]);



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
            <Button type='button' disabled floated="right" color='grey'  loading={publicationloading} content='loading...'/>}
        </Container>
    );
});