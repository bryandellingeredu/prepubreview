import { TableCell, TableRow } from "semantic-ui-react";
import { Publication } from "../../app/models/publication";

interface Props {
    publication: Publication;
}

export default function PublicationTableRow({ publication }: Props) {
    return (
        <TableRow key={publication.id}>
            <TableCell>{new Date(publication.dateCreated).toLocaleDateString()}</TableCell>
            <TableCell>{publication.title}</TableCell>
        </TableRow>
    )
}