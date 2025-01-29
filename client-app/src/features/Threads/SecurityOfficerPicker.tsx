import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { Button, CardGroup, Divider, Header, Icon, Input } from "semantic-ui-react";
import { SecurityOfficer } from "../../app/models/securityOfficer";
import SecurityOfficerCard from "./SecurityOfficerCard";

interface Props{
    threadId: string
    updateSecurityOfficerId: (threadId: string, newSecurityOfficerId: string) => void;
    removeSecurityOfficer: (threadId: string) => void;
}

export default observer(function SecurityOfficerPicker({threadId, updateSecurityOfficerId, removeSecurityOfficer} :Props){
    const { modalStore, securityOfficerStore, responsiveStore } = useStore();
    const {isMobile} = responsiveStore
    const {securityOfficerLoading, securityOfficers, loadSecurityOfficers} = securityOfficerStore
    const { closeModal } = modalStore;
    const [lastNameFilter, setLastNameFilter] = useState('');
    const [organizationFilter, setOrganizationFilter] = useState('')
    const [scipFilter, setScipFilter] = useState('');
    const [filteredSecurityOfficers, setFilteredSecurityOfficers] = useState<SecurityOfficer[]>([]);

    useEffect(() => {
        // Load security officers if not already loaded
        if (securityOfficers.length === 0 && !securityOfficerLoading) {
          loadSecurityOfficers();
        } else {
          setFilteredSecurityOfficers(securityOfficers);
        }
      }, [securityOfficers, loadSecurityOfficers]);

      const handleLastNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setLastNameFilter(value);
        setFilteredSecurityOfficers(securityOfficerStore.getFilteredSecurityOfficers(value, organizationFilter, scipFilter));
    };

    const handleOrganizationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setOrganizationFilter(value);
        setFilteredSecurityOfficers(securityOfficerStore.getFilteredSecurityOfficers(lastNameFilter, value, scipFilter));
    };

    const handleScipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setScipFilter(value);
        setFilteredSecurityOfficers(securityOfficerStore.getFilteredSecurityOfficers(lastNameFilter, organizationFilter, value));
    };

      if(securityOfficerLoading) return <LoadingComponent content='loading security officers' />

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
                    <Icon name="shield" />
                    {isMobile ? 'CHOOSE A SO' : 'CHOOSE A SECURITY OFFICER TO REVIEW YOUR PUBLICATION'}  
                   
                </Header>
            </Divider>

            <div style={ !isMobile ? { display: "flex",
                          justifyContent: "space-between",
                          alignItems:"center",
                          marginTop: "1rem",
                          paddingLeft: '10px',
                          paddingRight: '10px',
                          marginBottom: '10px'
                          } : {}}>

               <Input
                    icon='search'
                    iconPosition='left'
                    label={{ tag: true, content: 'filter by last name' }}
                    labelPosition='right'
                    placeholder='Filter by last name'
                    value={lastNameFilter}
                    onChange={handleLastNameInputChange}
                    list="lastname-list"
                   />   

                <datalist id="lastname-list">
                    {[...new Set(securityOfficers.map((securityOfficer) => securityOfficer.lastName))]
                    .map((lastName, index) => (
                    <option key={index} value={lastName} />
                    ))}
                </datalist>

                <Input
                    icon='search'
                    iconPosition='left'
                    label={{ tag: true, content: 'filter by organization' }}
                    labelPosition='right'
                    placeholder='Filter by organization'
                    value={organizationFilter}
                    onChange={handleOrganizationInputChange}
                    list="organization-list"
                   />   

                <datalist id="organization-list">
                    {[...new Set(securityOfficers.map((securityOfficer) => securityOfficer.organizationDisplay))]
                    .map((organizationDisplay, index) => (
                    <option key={index} value={organizationDisplay} />
                    ))}
                </datalist>


                <Input
                    icon='search'
                    iconPosition='left'
                    label={{ tag: true, content: 'filter by SCIP' }}
                    labelPosition='right'
                    placeholder='Filter by SCIP'
                    value={scipFilter}
                    onChange={handleScipInputChange}
                    list="scip-list"
                   />   

                <datalist id="scip-list">
                    {[...new Set(securityOfficers.map((securityOfficer) => securityOfficer.scip))]
                    .map((scip, index) => (
                    <option key={index} value={scip} />
                    ))}
                </datalist>



            </div>

            <CardGroup itemsPerRow={isMobile ? 1 : 3}>
                {filteredSecurityOfficers.filter(x => !x.logicalDeleteIndicator).map((securityOfficer) => (
                    <SecurityOfficerCard
                    key={securityOfficer.id}
                    securityOfficer={securityOfficer}
                    threadId={threadId}
                    updateSecurityOfficerId={updateSecurityOfficerId}
                    removeSecurityOfficer={removeSecurityOfficer}
                    showSelectButton={true}
                    showRemoveButton={false}
                    showDeleteButton={false}
                    showEditButton={false}
                    />
                ))}

            </CardGroup>
        </>
      )

})