
import { useStore } from '../app/stores/store';
import './HomePage.css';
import { observer } from 'mobx-react-lite';


export default observer(function HomePage(){
    const { userStore } = useStore();

    return(
        <div className="homepage">
          <img src="/prepubreview/logo.svg" alt="Logo" className="logo" />
        <h1>PRE PUBLICATION REVIEW</h1>
        <button onClick={userStore.login}>Log In</button>
    </div>
    )
})