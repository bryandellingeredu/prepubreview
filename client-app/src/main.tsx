import { createRoot } from 'react-dom/client'
import 'semantic-ui-css/semantic.min.css'
import './app/layout/styles.css';
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router/Routes.tsx'
import { store, StoreContext } from './app/stores/store.ts'


createRoot(document.getElementById('root')!).render(
 
      <StoreContext.Provider value={store}>
        <RouterProvider router={router}/>
    </StoreContext.Provider>

)
