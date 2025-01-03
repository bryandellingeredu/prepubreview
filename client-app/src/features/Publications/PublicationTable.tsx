import {Table, TableBody,  TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react';
import { Publication } from '../../app/models/publication';
import PublicationTableRow from './PublicationTableRow';

interface Props {
    publications: Publication[]
}
export default function PublicationTable({publications} : Props) {
  
    return(
    <Table celled selectable style={{backgroundColor: '#F1E4C7'}}>
    <TableHeader >
      <TableRow >
        <TableHeaderCell className='gibold' style={{backgroundColor: '#DBC9A9'}}>DATE</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>TITLE</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>AUTHOR</TableHeaderCell>
      </TableRow>
    </TableHeader>

    <TableBody>
                {publications.map((publication) => (
                    <PublicationTableRow key={publication.id} publication={publication} />
                ))}
        </TableBody>
  </Table>
    )
}