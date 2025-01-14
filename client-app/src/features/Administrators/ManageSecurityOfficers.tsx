import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/stores/store";
import { SecurityOfficer } from "../../app/models/securityOfficer";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, CardGroup, Divider, Header, Icon, Segment, SegmentGroup } from "semantic-ui-react";
import SecurityOfficerCard from "../Threads/SecurityOfficerCard";

export default observer(function ManageSecurityOfficers() {
    const navigate = useNavigate();
    const {securityOfficerStore, usawcUserStore} = useStore();

    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;

    const {securityOfficers, securityOfficerLoading, loadSecurityOfficers} = securityOfficerStore;

    useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers();
        }
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

      useEffect(() => {
        loadSecurityOfficers();
      }, []);

      const handleGoBackClick = () => {
        navigate('/publicationsmain'); // Go back to the previous page
    };

    const handleNewButtonClick = () => {
      navigate('/newsecurityofficerform'); // Navigate to the newpublicationform route
  };

  const updateSecurityOfficerId = (threadId: string, newSecurityOfficerId: string) => {
    // do nothing
   };

const removeSecurityOfficer = (threadId: string) => {
   // do nothing
};

     if(usawcUserloading || securityOfficerLoading) return <LoadingComponent content="loading security officers" />

    return (
        <>
         <Navbar />

         <div style={{ display: "flex",
                          justifyContent: "space-between",
                          alignItems:"center",
                          marginTop: "1rem",
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          }}>
                 <Button icon labelPosition='left' color='black' onClick={handleGoBackClick}>
                    <Icon name='arrow left' />
                        BACK
                    </Button>
                
                    <Button color="brown" icon="plus" content="ADD SECURITY OFFICER" onClick={handleNewButtonClick}/>
        </div>

        <Divider horizontal>
            <Header as="h1" className="industry">
              <Icon name="settings" />
              MANAGE SECURITY OFFICERS
            </Header>
        </Divider>

        <SegmentGroup style={{ marginTop: '40px', padding: '20px' }}>
          <Segment style={{backgroundColor: '#F1E4C7'}}>
          <Header textAlign="center"  icon  as="h4" className="industry" >
                <Icon name="shield" />
                CURRENT SECURITY OFFICERS
              </Header>
              <p></p>
              <CardGroup itemsPerRow={3}>
              {securityOfficers.filter(x => !x.logicalDeleteIndicator).map((securityOfficer) => (
                 <SecurityOfficerCard
                 key={securityOfficer.id}
                 securityOfficer={securityOfficer}
                 threadId={''}
                 showSelectButton={false}
                 showRemoveButton={false}
                 showDeleteButton={true}
                 showEditButton={true}
                 updateSecurityOfficerId={updateSecurityOfficerId}
                 removeSecurityOfficer={removeSecurityOfficer}
                  />
                 ))}
          </CardGroup>
          </Segment>
        </SegmentGroup>
        </>
    )

})

