import { TableCell, TableRow } from "semantic-ui-react";
import { Publication } from "../../app/models/publication";
import { useEffect } from "react";
import { useStore } from "../../app/stores/store";

interface Props {
    publication: Publication;
}

export default function PublicationTableRow({ publication }: Props) {
        const { appUserStore } = useStore();
         const { loadAppUsers, appUserloading, appUsers} = appUserStore;


    useEffect(() => {
        if(appUsers.length === 0 ) loadAppUsers();
    },[appUserStore]);

    const getAuthor = () => {
        const appUser = appUsers.find(x => x.personId === publication.authorPersonId);
        return appUser ? `${appUser?.lastName}, ${appUser?.firstName} ${appUser?.middleName}` : ''
    }

    return (
        <TableRow key={publication.id}>
            <TableCell>{new Date(publication.dateCreated).toLocaleDateString()}</TableCell>
            <TableCell>{publication.title}</TableCell>
            <TableCell>{appUserloading ? '' : getAuthor()}</TableCell>
        </TableRow>
    )
}