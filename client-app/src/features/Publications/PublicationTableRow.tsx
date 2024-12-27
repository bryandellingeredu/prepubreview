import { TableCell, TableRow } from "semantic-ui-react";
import { Publication } from "../../app/models/publication";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";


interface Props {
    publication: Publication;
}

export default function PublicationTableRow({ publication }: Props) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleRowClick = () => {
        setLoading(true);
        navigate(`/threads/${publication.id}`);
    };

    const getAuthorName = () => 
        publication.authorMiddleName ?
         `${publication.authorFirstName} ${publication.authorMiddleName}  ${publication.authorLastName} ` :
         `${publication.authorFirstName} ${publication.authorLastName} `
    
    if(loading) return <LoadingComponent content='loading form' />

    return (
        <TableRow key={publication.id} onClick={handleRowClick} style={{ cursor: 'pointer' }}>
            <TableCell>{new Date(publication.dateCreated).toLocaleDateString()}</TableCell>
            <TableCell>{publication.title}</TableCell>
            <TableCell>{getAuthorName()}</TableCell>
        </TableRow>
    )
}