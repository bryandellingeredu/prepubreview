import { observer } from 'mobx-react-lite';
import { Dropdown, Icon, Menu, MenuItem } from 'semantic-ui-react';
import { useStore } from '../stores/store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingComponent from './LoadingComponent';
export default observer(function Navbar(){

      const { userStore, responsiveStore } = useStore();
      const {isMobile} = responsiveStore
      const navigate = useNavigate();

    

      useEffect(() => {
        if (!userStore.loadingUser && userStore.appLoaded) {
            if (!userStore.appUser) {
              userStore.logout(); 
                navigate("/"); // Redirect only when user loading is complete and no user is found
            }
        }
    }, [userStore.loadingUser, userStore.appLoaded, userStore.appUser, navigate]);

    const handleLogout = () => {
        userStore.logout(); // Clear user, token, and redirect path
        navigate('/'); // Redirect to login page
    };

    if(userStore.loadingUser) return(<LoadingComponent content='loading data...'/>)
    return(
      <Menu inverted className='navbar'>
        <MenuItem>
        <img src="/prepubreview/star.svg" alt="Logo"  />
        </MenuItem>
        <MenuItem>
          {!isMobile && 
          <h2 className='industry'>PRE PUBLICATION REVIEW</h2>
          }
        </MenuItem>
        <MenuItem position="right">
        <Menu.Menu >
        <Dropdown
  trigger={
    <span style={{ color: 'white' }}>
      <Icon name="user" />
      <span className="gilite">{userStore.appUser?.firstName} {userStore.appUser?.lastName}</span>
    </span>
  }
  pointing="top right"
  className="user-dropdown"
>
  <Dropdown.Menu>
    {userStore.appUser && (
      <>
        {userStore.appUser.eduEmail && (
          <Dropdown.Item text={`Edu Email: ${userStore.appUser.eduEmail}`} disabled />
        )}
        {userStore.appUser.armyEmail && (
          <Dropdown.Item text={`Army Email: ${userStore.appUser.armyEmail}`} disabled />
        )}
        {userStore.appUser.organizationDisplay && (
          <Dropdown.Item text={`Organization: ${userStore.appUser.organizationDisplay}`} disabled />
        )}
      </>
    )}
    <Dropdown.Divider />
    {userStore.appUser?.isAdmin &&
    <>
    <Dropdown.Item
      text="Manage Admins"
      icon="settings"
      onClick={() => navigate('/manageadministrators')}
    />
    <Dropdown.Item
    text="Manage Security Officers"
    icon="settings"
    onClick={() => navigate('/managesecurityofficers')}
  />
  </> 
   }
    <Dropdown.Item
      text="Logout"
      icon="sign-out"
      onClick={handleLogout}
    />
  </Dropdown.Menu>
</Dropdown>
      </Menu.Menu>
      </MenuItem>
      </Menu>
    );
});