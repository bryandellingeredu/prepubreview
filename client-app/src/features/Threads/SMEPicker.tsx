import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import { Button, CardGroup, Divider, Header, Icon, Input } from "semantic-ui-react";
import SMECard from "./SMECard";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { UserSubject } from "../../app/models/userSubject";

export default observer(function SMEPicker() {
    const { modalStore, smeStore } = useStore();
    const { userSubjectLoading, loadMoreSubjects, userSubjects } = smeStore;
    const { closeModal } = modalStore;

    const [displayedSubjects, setDisplayedSubjects] = useState<UserSubject[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<UserSubject[]>([]);
    const [isFiltered, setIsFiltered] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastNameFilter, setLastNameFilter] = useState('');
    const [subjects, setSubjects] = useState<string[]>([]);
    const [subjectFilter, setSubjectFilter] = useState('');

    // Initial data load
    useEffect(() => {
        if (userSubjects.length === 0 && !userSubjectLoading) {
            smeStore.loadUserSubjects().then(() => {
                const initialSubjects = smeStore.getPaginatedUserSubjects(24);
                setDisplayedSubjects(initialSubjects);
            });
        }
        if (userSubjects.length > 0 && !userSubjectLoading) {
            const subjectsFromUsers = [
                ...new Set(userSubjects.flatMap(userSubject => userSubject.subjects))
            ].sort((a, b) => a.localeCompare(b)); // Sort alphabetically
    
            console.log('Distinct alphabetical subjects:', subjectsFromUsers);
    
            // Use the sorted subjects as needed
            setSubjects(subjectsFromUsers);
        }
    }, [smeStore, userSubjects.length, userSubjectLoading]);

    // Fetch more data
    const fetchMoreData = async () => {
        setLoadingMore(true); // Prevent duplicate calls
        const nextBatch = await loadMoreSubjects(24);
        if (nextBatch.length === 0) {
            setHasMore(false); // No more data to load
        } else {
            setDisplayedSubjects((prev) => [...prev, ...nextBatch]); // Append new items
        }
        setLoadingMore(false);
    };

    // Scroll listener for the container
    useEffect(() => {
        const scrollableContainer = document.getElementById("scrollableContainer");

        if (!scrollableContainer) {
            console.error("No scrollable container found");
            return;
        }

        console.log("Attaching scroll listener to container");
        const handleScroll = () => {
            console.log("Scroll event detected");

            // Detect if the user has scrolled to the bottom
            if (
                scrollableContainer.scrollTop + scrollableContainer.clientHeight >=
                scrollableContainer.scrollHeight - 100
            ) {
                if (hasMore && !loadingMore) {
                    fetchMoreData();
                }
            }
        };

        scrollableContainer.addEventListener("scroll", handleScroll);

        return () => {
            console.log("Removing scroll listener from container");
            scrollableContainer.removeEventListener("scroll", handleScroll);
        };
    }, [hasMore, loadingMore, fetchMoreData]);

    if (userSubjectLoading && displayedSubjects.length === 0) {
        return <LoadingComponent content="Loading subject matter experts..." />;
    }

    const handleLastNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setLastNameFilter(value);
    
        // Determine if filtering should be active
        if (value.length >= 1 || subjectFilter.trim().length >= 1) {
            setIsFiltered(true);
            setFilteredSubjects(smeStore.getFilteredUserSubjects(value, subjectFilter));
        } else {
            setIsFiltered(false);
            setFilteredSubjects([]);
        }
    };
    
    const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setSubjectFilter(value);
    
        // Determine if filtering should be active
        if (value.length >= 1 || lastNameFilter.trim().length >= 1) {
            setIsFiltered(true);
            setFilteredSubjects(smeStore.getFilteredUserSubjects(lastNameFilter, value));
        } else {
            setIsFiltered(false);
            setFilteredSubjects([]);
        }
    };

    return (
        <>
            <Button
                floated="right"
                icon
                size="mini"
                color="black"
                compact
                onClick={() => closeModal()}
            >
                <Icon name="close" />
            </Button>
            <Divider horizontal>
                <Header as="h2" className="industry">
                    <Icon name="graduation cap" />
                    CHOOSE AN SME TO REVIEW YOUR PUBLICATION
                </Header>
            </Divider>

            <div style={{ display: "flex",
                          justifyContent: "space-between",
                          alignItems:"center",
                          marginTop: "1rem",
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          }}>
                 <Input
                    icon='search'
                    iconPosition='left'
                    label={{ tag: true, content: 'filter by last name' }}
                    labelPosition='right'
                    placeholder='Filter by last name'
                    value={lastNameFilter}
                    onChange={handleLastNameInputChange}
                   />

                  <Input
                    icon='search'
                    iconPosition='left'
                    label={{ tag: true, content: 'filter by subject' }}
                    labelPosition='right'
                    placeholder='Filter by subject'
                    value={subjectFilter}
                    onChange={handleSubjectInputChange}
                    list="subject-list"
                   />
                       <datalist id="subject-list">
                        {subjects.map((subject, index) => (
                        <option key={index} value={subject} />
                         ))}
                      </datalist>

            </div>
            
         
            <div
                id="scrollableContainer"
                style={{ height: "80vh", overflowY: "auto", padding: "1rem" }}
            >
            {!isFiltered &&
             <>
                <CardGroup itemsPerRow={3}>
                    {displayedSubjects.map((userSubject) => (
                        <SMECard key={userSubject.usawcUser.personId} userSubject={userSubject} />
                    ))}
                </CardGroup>
                {loadingMore && <LoadingComponent content="Loading more SMEs..." />}
                {!hasMore && <div>No more items to load</div>}
              </>
            }
            {isFiltered &&
                    <CardGroup itemsPerRow={3}>
                    {filteredSubjects.map((userSubject) => (
                        <SMECard key={userSubject.usawcUser.personId} userSubject={userSubject} />
                    ))}
                </CardGroup>
            }
            </div>
        </>
    );
});
