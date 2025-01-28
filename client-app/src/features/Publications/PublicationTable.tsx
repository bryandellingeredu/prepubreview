import {Table, TableBody,  TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react';
import { Publication } from '../../app/models/publication';
import PublicationTableRow from './PublicationTableRow';
import { useStore } from '../../app/stores/store';

interface Props {
    publications: Publication[]
}
export default function PublicationTable({publications} : Props) {
  const {responsiveStore} = useStore();
  const {isMobile} = responsiveStore
    return(
    <Table celled selectable style={{backgroundColor: '#F1E4C7'}}>
    {!isMobile &&
    <TableHeader >
      <TableRow >
        <TableHeaderCell className='gibold' style={{backgroundColor: '#DBC9A9'}}>DATE</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>TITLE</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>AUTHOR</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>STATUS</TableHeaderCell>
      </TableRow>
    </TableHeader>
                         }
    <TableBody>
                {publications.map((publication) => (
                    <PublicationTableRow key={publication.id} publication={publication} />
                ))}
        </TableBody>
  </Table>
    )
}