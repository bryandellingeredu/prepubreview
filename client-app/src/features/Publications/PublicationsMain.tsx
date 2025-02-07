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
    const {   publications,  publicationloading, loadMyPublications, myPublications, mypublicationloading } = publicationStore;

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

    const handleSearchChange = (_event: React.MouseEvent<HTMLElement>, data: SearchProps) => {
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

    const [selectedFromDate, setSelectedFromDate] = useState<Date | null>(null);
    const [selectedToDate, setSelectedToDate] = useState<Date | null>(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [debouncedTitle, setDebouncedTitle] = useState(title);
    const [debouncedAuthor, setDebouncedAuthor] = useState(author);

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedTitle(title), 600);
      return () => clearTimeout(handler);
  }, [title]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedAuthor(author), 600);
    return () => clearTimeout(handler);
}, [author]);


    const statusOptions = [
      { key: 1, text: 'Pending', value: 0 },
      { key: 2, text: 'Waiting for SME Review', value: 1},
      { key: 3, text: "Rejected by SME, Awaiting Author's Revision", value: 2},
      { key: 4, text: "Waiting for Operational Security Officer Review", value: 3},
      { key: 5, text: "Rejected by Security Officer, Awaiting Author's Revision", value: 4},
      { key: 6, text: "Completed", value: 5},
    ];

    const [status, setStatus] = useState<number | null>(null); 

    const  handleStatusChange = (newStatus: number | null) => {
      setStatus(newStatus)
    }

    const handleAuthorChange = (newAuthor: string) => {
      setAuthor(newAuthor)
    }

    const handleTitleChange = (newTitle: string) => {
      setTitle(newTitle)
    }

    const handleFromDateChange = (newDate: Date | null) =>{
      setSelectedFromDate(newDate);
    }

    const handleToDateChange = (newDate: Date | null) => {
      setSelectedToDate(newDate);
    }

    const getMyPublicationsFiltered = () => {
      let filteredPublications = myPublications;
    
      if (selectedFromDate) {
        filteredPublications = filteredPublications.filter((x) => {
          // Convert both dates to "date only" by zeroing out the time
          const createdDate = new Date(x.dateCreated);
          const fromDate = new Date(selectedFromDate);
          
          // Reset hours, minutes, seconds, and milliseconds to zero
          createdDate.setHours(0, 0, 0, 0);
          fromDate.setHours(0, 0, 0, 0);
          
          return createdDate >= fromDate;
        });
      }

      if (selectedToDate) {
        filteredPublications = filteredPublications.filter((x) => {
          // Convert both dates to "date only" by zeroing out the time
          const createdDate = new Date(x.dateCreated);
          const toDate = new Date(selectedToDate);
          
          // Reset hours, minutes, seconds, and milliseconds to zero
          createdDate.setHours(0, 0, 0, 0);
          toDate.setHours(0, 0, 0, 0);
          
          return createdDate <= toDate;
        });
      }

      if(title){
        filteredPublications = filteredPublications.filter(x => x.title.toLowerCase().includes(title.toLowerCase()))
      }

      if(author){
        filteredPublications = filteredPublications.filter(x => x.authorLastName.toLowerCase().includes(author.toLowerCase())  || x.authorFirstName.toLowerCase().includes(author.toLowerCase()))
      }

      if(status !== null && status !== undefined){
        filteredPublications = filteredPublications.filter(x => x.status === status)
      }
    
      return filteredPublications;
    };

    const [infiniteKey, setInfiniteKey] = useState(0);
    const [firstLoadDone, setFirstLoadDone] = useState(false);


    useEffect(() => {
      publicationStore.resetPublications();
      setInfiniteKey(prev => prev + 1);
      setFirstLoadDone(false);

      if (showAllData) {
          publicationStore.loadPublications(
              selectedFromDate,
              selectedToDate,
              debouncedTitle,
              debouncedAuthor,
              status,
              0
          ).then(() => setFirstLoadDone(true));
      }
  }, [showAllData, selectedFromDate, selectedToDate, debouncedTitle, debouncedAuthor, status]);


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
                    onResultSelect={(_e, data) => {
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
                onResultSelect={(_e, data) => {
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
                      key={infiniteKey} // 🔥 Forces re-render when filters change
                      pageStart={0} // ✅ Ensures first call starts at 0
                      loadMore={(page) => {
                        const actualPage = firstLoadDone ? page : 0; // ✅ Ensure first offset is 0
                        const offset = actualPage * publicationStore.limit; // ✅ Correctly calculates offset
                        console.log("Loading page:", actualPage, "Offset:", offset); // Debugging log
                    
                        publicationStore.loadPublications(
                          selectedFromDate,
                          selectedToDate,
                          debouncedTitle,
                          debouncedAuthor,
                          status,
                          offset
                        );
                      }}
                      hasMore={publicationStore.hasMore}
                >       
                <PublicationTable publications={publications} selectedFromDate={selectedFromDate} selectedToDate={selectedToDate} handleFromDateChange={handleFromDateChange} handleToDateChange={handleToDateChange}
                title={title} handleTitleChange={handleTitleChange} author={author} handleAuthorChange={handleAuthorChange} statusOptions={statusOptions} status={status} handleStatusChange={handleStatusChange} />
            </InfiniteScroll>
            {publicationloading  &&
            <Loader active inline='centered' />}
            </>
            }
            {!showAllData &&
                <PublicationTable publications={getMyPublicationsFiltered()}  selectedFromDate={selectedFromDate} selectedToDate={selectedToDate} handleFromDateChange={handleFromDateChange} handleToDateChange={handleToDateChange}
                title={title} handleTitleChange={handleTitleChange} author={author} handleAuthorChange={handleAuthorChange} statusOptions={statusOptions} status={status} handleStatusChange={handleStatusChange} 
                />
            } 
        </Container>
    );
});