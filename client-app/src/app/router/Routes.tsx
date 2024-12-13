import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import HomePage from '../../features/HomePage';
import CallbackPage from '../../features/Callback';
import PublicationsMain from '../../features/Publications/publicationsMain';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <HomePage /> }, // Set HomePage as the default route for '/'
            { path: 'callback', element: <CallbackPage /> },
            { path: 'publicationsmain', element: <PublicationsMain />},
            { path: '*', element: <HomePage /> }, // Wildcard to redirect any undefined paths to HomePage
        ]
    }
];

export const router = createBrowserRouter(routes, {
    basename: '/prepubreview',
  });