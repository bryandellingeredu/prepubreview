import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { Button, Container, Divider, Header, Icon, Loader, Menu, Radio, Search, SearchProps, Sidebar } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import PublicationTable from "./PublicationTable";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { Publication } from "../../app/models/publication";
import agent from "../../app/api/agent";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer(function PublicationsMain() {
    const { publicationStore, responsiveStore } = useStore();
    const {isMobile} = responsiveStore
    const { loadPublications,  publications, hasMore, publicationloading, loadMyPublications, myPublications, mypublicationloading } = publicationStore;

    useEffect(() => {
       loadMyPublications();
      }, []);
    

    const navigate = useNavigate();

    const handleNewButtonClick = () => {
        navigate('/newpublicationform'); // Navigate to the newpublicationform route
    };

    const [showAllData, setShowAllData] = useState<boolean>(false);
    
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

    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

   if (mypublicationloading) return <LoadingComponent content='loading data' />

    return (
        <Container fluid>
            <Navbar />



            {!isMobile && 
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <strong className="industry"  onClick={() => setShowAllData(false)}>SHOW MY PUBLICATIONS</strong>
                    <Radio toggle   checked={showAllData}  onChange={() => setShowAllData(!showAllData)}/>
                    <strong className="industry" onClick={() => setShowAllData(true)}>SHOW ALL PUBLICATIONS</strong>
                </div>

                <Button color="brown" icon="plus" content="NEW PUBLICATION" onClick={handleNewButtonClick}/>
            </div>
           }


{isMobile && (
        <>
          <Button
            icon
            color="grey"
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            style={{ margin: "1rem" }}
          >
            <Icon name="settings" />
          </Button>

          {/* Slide-Out Sidebar */}
          <Sidebar
            as={Menu}
            animation="overlay"
            icon="labeled"
            inverted
            onHide={() => setIsSidebarVisible(false)}
            vertical
            visible={isSidebarVisible}
            width="wide"
          >
            <Menu.Item>
              <Search
                loading={loading}
                results={
                  results.length > 0
                    ? results.map((result) => ({
                        title: result.title,
                        description: `Author: ${result.authorFirstName} ${result.authorLastName}`,
                        key: result.id,
                      }))
                    : [{ title: "No Results Found", description: "", key: "no-results" }]
                }
                value={searchQuery}
                placeholder="Search publications..."
                onSearchChange={handleSearchChange}
                onResultSelect={(e, data) => {
                  const selectedResult = results.find((result) => result.id === data.result.key);
                  if (selectedResult) {
                    navigate(`/threads/${selectedResult.id}`);
                  }
                }}
              />
            </Menu.Item>
            <Menu.Item>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <strong onClick={() => setShowAllData(false)}>SHOW MY PUBLICATIONS</strong>
                <Radio toggle checked={showAllData} onChange={() => setShowAllData(!showAllData)} />
                <strong onClick={() => setShowAllData(true)}>SHOW ALL PUBLICATIONS</strong>
              </div>
            </Menu.Item>
            <Menu.Item>
              <Button color="brown" icon="plus" content="NEW PUBLICATION" onClick={handleNewButtonClick} />
            </Menu.Item>
          </Sidebar>
        </>
      )}
           

            <Divider horizontal>
                <Header as="h1" className="industry">
                    <Icon name="book" />
                    {isMobile ? 'PRE PUB REVIEW' : 'PRE-PUBLICATION SECURITY & POLICY REVIEW'}
                </Header>
            </Divider>
            {showAllData && 
            <>
            <InfiniteScroll
                pageStart={0}
                loadMore={loadPublications} // Directly pass the loadPublications function
                hasMore={hasMore}
            >
                <PublicationTable publications={publications} />
            </InfiniteScroll>
            {publicationloading  &&
            <Loader active inline='centered' />}
            </>
            }
            {!showAllData &&
                <PublicationTable publications={myPublications} />
            } 
        </Container>
    );
});