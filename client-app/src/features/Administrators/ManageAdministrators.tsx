import { observer } from "mobx-react-lite";
import Navbar from "../../app/layout/Navbar";
import { useEffect, useState } from "react";
import { useStore } from "../../app/stores/store";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer(function ManageAdministrators() {
    const {administratorStore, usawcUserStore} = useStore();
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
    const { administrators, administratorLoading, loadAdministrators, addAdministrator, deleteAdministrator, addingAdministrator, deletingAdministrator} = administratorStore;

    useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers();
        }
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);


      useEffect(() => {
        if (!administratorLoading) {
            loadAdministrators();
        }
    }, [administratorLoading, loadAdministrators]);

    if(usawcUserloading || administratorLoading) return <LoadingComponent content="loading administrators" />
    
    return(
        <h1>Hello from Manage Administrators</h1>
    )
})