import { TableCell, TableRow } from "semantic-ui-react";
import { Publication } from "../../app/models/publication";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { StatusType } from "../../app/models/statusType";



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

    const getStatus = () => {
        if (StatusType[publication.status] === 'SentToSMEForReview') return 'Waiting for SME Review';
        if (StatusType[publication.status] === 'SentToSecurityForReview') return 'Waiting for Operational Security Officer Review'
        if (StatusType[publication.status] === 'RejectedBySME') return "Rejected by SME, Awaiting Author's Revision"
        if (StatusType[publication.status] === 'RejectedBySecurity') return "Rejected by Security Officer, Awaiting Author's Revision" 
        return StatusType[publication.status];
    }

    const getAuthorName = () => 
        publication.authorMiddleName ?
         `${publication.authorFirstName} ${publication.authorMiddleName}  ${publication.authorLastName} ` :
         `${publication.authorFirstName} ${publication.authorLastName} `
    
    if(loading) return <LoadingComponent content='loading form' />

    return (
        <TableRow
           key={publication.id} onClick={handleRowClick}
          style={{ cursor: 'pointer' }}
          positive={getStatus() === 'Complete'}
          negative={getStatus() === "Rejected by SME, Awaiting Author's Revision" || getStatus() === "Rejected by Security Officer, Awaiting Author's Revision" }>
            <TableCell>{new Date(publication.dateCreated).toLocaleDateString()}</TableCell>
            <TableCell>{publication.title}</TableCell>
            <TableCell>{getAuthorName()}</TableCell>
            <TableCell>{getStatus()}</TableCell>
        </TableRow>
    )
}