import { Outlet, ScrollRestoration } from "react-router-dom";
import { useStore } from "../stores/store";
import { useEffect } from "react";
import LoadingComponent from "./LoadingComponent";
import { observer } from "mobx-react-lite";
import { ToastContainer } from "react-toastify";
import ModalContainer from "../common/modals/ModalContainer";
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const { userStore } = useStore();

  useEffect(() => {
    // Always look for the 'redirecttopath' query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('redirecttopath');

    if (redirectPath) {
      // Save the redirect path to local storage
      localStorage.setItem('redirectToPath', redirectPath);

      // Optionally, clean up the query string
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    if (userStore.token) {
      // If the user is logged in, fetch their user details
      userStore
        .getUser()
        .catch((error) => {
          console.error("Error loading user:", error);
          userStore.logout(); // Clear token if fetching user fails
        })
        .finally(() => {
          userStore.setAppLoaded(true);
        });
    } else {
      // If the user is not logged in
      userStore.setAppLoaded(true); // Mark the app as loaded
    }
  }, [userStore]);

  if (!userStore.appLoaded) return <LoadingComponent content="Loading App..." />;

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
  );
}

export default observer(App);