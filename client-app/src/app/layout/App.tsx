import { Outlet, ScrollRestoration } from "react-router-dom"
import { useStore } from "../stores/store"
import { useEffect } from "react";
import LoadingComponent from "./LoadingComponent";
import { observer } from "mobx-react-lite";
import { ToastContainer } from "react-toastify";
import ModalContainer from "../common/modals/ModalContainer";

function App() {
  const {userStore} = useStore();

  useEffect(() => {
    if (userStore.token) {
        userStore.getUser()
            .catch(error => {
                console.error("Error loading user:", error);
                // Optionally clear token if fetching user fails
                userStore.logout();
            })
            .finally(() => {
                userStore.setAppLoaded(true);
            });
    } else {
        userStore.setAppLoaded(true);
    }
}, [userStore]);

  if(!userStore.appLoaded) return <LoadingComponent content='Loading App...'/>

  return (
    <>
      <ScrollRestoration />
     <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
        <ModalContainer />
      <Outlet />
    </>
  )
}

export default observer(App)
