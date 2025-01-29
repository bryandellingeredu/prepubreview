import {Form, Input, Table, TableBody,  TableHeader, TableHeaderCell, TableRow } from 'semantic-ui-react';
import { Publication } from '../../app/models/publication';
import PublicationTableRow from './PublicationTableRow';
import { useStore } from '../../app/stores/store';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


interface Options {
  key: number
  text: string
  value: number
}

interface Props {
    publications: Publication[]
    selectedFromDate: Date | null
    selectedToDate: Date | null
    title: string
    author: string
    statusOptions: Options[]
    status: number | null
    handleFromDateChange: (newDate: Date | null) => void
    handleToDateChange: (newDate: Date | null) => void
    handleTitleChange: (newTitle: string) => void
    handleAuthorChange: (newAuthor: string) => void
    handleStatusChange: (newStatus: number | null) => void

}
export default function PublicationTable(
  {publications, selectedFromDate, selectedToDate, handleFromDateChange, handleToDateChange, title, handleTitleChange, author, handleAuthorChange, statusOptions, status, handleStatusChange }
   : Props) {
  const {responsiveStore} = useStore();
  const {isMobile} = responsiveStore

    return(
    <Table celled selectable style={{backgroundColor: '#F1E4C7'}}>
    {!isMobile &&
    <TableHeader >
      <TableRow >
        <TableHeaderCell className='gibold' style={{backgroundColor: '#DBC9A9'}}>DATE CREATED</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>TITLE</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>AUTHOR</TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>STATUS</TableHeaderCell>
      </TableRow>
      <TableRow >
        <TableHeaderCell style={{backgroundColor: '#DBC9A9', display: 'flex', gap: '1rem', alignItems: 'center',   justifyContent: 'center',}} >
        <DatePicker
            selected={selectedFromDate}
            onChange={(date) => handleFromDateChange(date)}
          customInput={<Input label='from'  value={selectedFromDate ? selectedFromDate.toLocaleDateString() : ""} 
            action={{
            icon: 'close',
            onClick: () => handleFromDateChange(null), // Clear the date
          }}
           />}
        />
         <DatePicker
            selected={selectedToDate}
            onChange={(date) => handleToDateChange(date)}
          customInput={<Input  label='to'  value={selectedFromDate ? selectedFromDate.toLocaleDateString() : ""} 
          action={{
            icon: 'close',
            onClick: () => handleToDateChange(null), // Clear the date
          }}
          />}
        />
        </TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>
          <Input icon='search' iconPosition='left' value={title}  placeholder='title' fluid onChange={(e) => handleTitleChange(e.target.value)} 
           action={{
            icon: 'close',
            onClick: () => handleTitleChange(''),
          }}/>
        </TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>
        <Input icon='search' iconPosition='left' value={author}  placeholder='author' fluid onChange={(e) => handleAuthorChange(e.target.value)} 
           action={{
            icon: 'close',
            onClick: () => handleAuthorChange(''),
          }}/>
        </TableHeaderCell>
        <TableHeaderCell style={{backgroundColor: '#DBC9A9'}}>
        <Form.Dropdown
            placeholder="Search by Status"
            fluid
            search
            selection
            clearable
            options={statusOptions}
            value={status ?? undefined}
            onChange={(e, { value }) => handleStatusChange(value as number || null)}
          />
        </TableHeaderCell>
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