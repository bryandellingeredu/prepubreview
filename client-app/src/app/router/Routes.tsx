import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import HomePage from '../../features/HomePage';
import CallbackPage from '../../features/Callback';
import PublicationsMain from '../../features/Publications/PublicationsMain';
import NewPublicationForm from '../../features/Publications/NewPublicationForm';
import ThreadsMain from '../../features/Threads/ThreadsMain';
import ManageAdministrators from '../../features/Administrators/ManageAdministrators';
import ManageSecurityOfficers from '../../features/Administrators/ManageSecurityOfficers';
import NewSecurityOfficerForm from '../../features/Administrators/NewSecurityOfficerForm';
import EditSecurityOfficerForm from '../../features/Administrators/EditSecurityOfficerForm';
import SentToSMEConfirmation from '../../features/Threads/SentToSMEConfirmation';
import SentFromSMEConfirmation from '../../features/Threads/SentFromSMEConfirmation';
import SentFromOPSECConfirmation from '../../features/Threads/SentFromOPSECConfirmation';
import SentToOPSECConfirmation from '../../features/Threads/SentToOPSECConfirmation';
import ManageTeamMembers from '../../features/Administrators/ManageTeamMembers';
import SentToSupervisorConfirmation from '../../features/Threads/SentToSupervisorConfirmation';
import SentFromSupervisorConfirmation from '../../features/Threads/SentFromSupervisorConfirmation';


export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <HomePage /> }, // Set HomePage as the default route for '/'
            { path: 'callback', element: <CallbackPage /> },
            { path: 'manageadministrators', element: <ManageAdministrators /> },
            { path: 'manageteammembers', element: <ManageTeamMembers /> },
            { path: 'managesecurityofficers', element: <ManageSecurityOfficers /> },
            { path: 'newsecurityofficerform', element: <NewSecurityOfficerForm />},
            { path: 'publicationsmain', element: <PublicationsMain />},
            { path: 'newpublicationform', element: <NewPublicationForm />},
            { path: 'newpublicationform/:pubid', element: <NewPublicationForm />},
            { path: 'newpublicationform/:pubid/:isRevision', element: <NewPublicationForm />},
            { path: 'threads/:id', element: <ThreadsMain />},
            { path: 'senttosmeconfirmation/:id', element: <SentToSMEConfirmation />},
            { path: 'senttosupervisorconfirmation/:id', element: <SentToSupervisorConfirmation />},
            { path: 'editsecurityofficer/:id', element: <EditSecurityOfficerForm />},
            { path: 'sentfromsmeconfirmation/:id/:status', element: <SentFromSMEConfirmation />},
            { path: 'sentfromsupervisorconfirmation/:id/:status', element: <SentFromSupervisorConfirmation />},
            { path: 'sentfromopsecconfirmation/:id/:status', element: <SentFromOPSECConfirmation />},
            { path: 'senttoopsecconfirmation/:id', element: <SentToOPSECConfirmation />},
            { path: '*', element: <HomePage /> }, // Wildcard to redirect any undefined paths to HomePage
        ]
    }
];

export const router = createBrowserRouter(routes, {
    basename: '/prepubreview',
  });