
import { observer } from "mobx-react-lite";
import Navbar from '../../app/layout/Navbar';
import { Container, Divider, Header, Icon } from 'semantic-ui-react';
import { useStore } from "../../app/stores/store";
import { useEffect } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import PublicationTable from "./PublicationTable";

export default observer(function PublicationsMain() {

const { publicationStore} = useStore();
const {loadPublications, publicationLoading, publications} = publicationStore

useEffect(() => {
    loadPublications();
},[publicationStore]);

if(publicationLoading) return(<LoadingComponent content='loading publication data'/>);

 return (
<Container fluid>
<Navbar />
<Divider horizontal>
      <Header as='h1'className='industry' >
        <Icon name='book' />
      PRE-PUBLICATION SECURITY & POLICY REVIEW     
      </Header>
    </Divider>
      <PublicationTable publications={publications} />
</Container>
 )
})