import { TableCell, TableRow } from "semantic-ui-react";
import { Publication } from "../../app/models/publication";


interface Props {
    publication: Publication;
}

export default function PublicationTableRow({ publication }: Props) {

    const getAuthorName = () => 
        publication.authorMiddleName ?
         `${publication.authorFirstName} ${publication.authorMiddleName}  ${publication.authorLastName} ` :
         `${publication.authorFirstName} ${publication.authorLastName} `
    


    return (
        <TableRow key={publication.id}>
            <TableCell>{new Date(publication.dateCreated).toLocaleDateString()}</TableCell>
            <TableCell>{publication.title}</TableCell>
            <TableCell>{getAuthorName()}</TableCell>
        </TableRow>
    )
}