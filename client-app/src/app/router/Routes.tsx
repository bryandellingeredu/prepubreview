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


export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <HomePage /> }, // Set HomePage as the default route for '/'
            { path: 'callback', element: <CallbackPage /> },
            { path: 'manageadministrators', element: <ManageAdministrators /> },
            { path: 'managesecurityofficers', element: <ManageSecurityOfficers /> },
            { path: 'newsecurityofficerform', element: <NewSecurityOfficerForm />},
            { path: 'publicationsmain', element: <PublicationsMain />},
            { path: 'newpublicationform', element: <NewPublicationForm />},
            { path: 'newpublicationform/:pubid', element: <NewPublicationForm />},
            { path: 'threads/:id', element: <ThreadsMain />},
            { path: '*', element: <HomePage /> }, // Wildcard to redirect any undefined paths to HomePage
        ]
    }
];

export const router = createBrowserRouter(routes, {
    basename: '/prepubreview',
  });