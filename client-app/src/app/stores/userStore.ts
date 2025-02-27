import { makeAutoObservable, reaction, runInAction } from "mobx";
import { UserManager, WebStorageStateStore,  } from 'oidc-client-ts';
import { AppUser } from "../models/appUser";
import agent from "../api/agent";
import { toast } from "react-toastify";

export default class UserStore {
    token: string | null = localStorage.getItem('jwtpub');
    userManager: UserManager;
    refreshTokenTimeout?: ReturnType<typeof setTimeout>;
    appUser: AppUser | null = null;
    appLoaded = false;
    loadingUser: boolean = false;

    constructor() {
        makeAutoObservable(this);

        // Configuration for the OpenIddict server
        const config = {
            authority: import.meta.env.VITE_AUTHORITY, // OpenIddict server URL
            client_id: import.meta.env.VITE_CLIENT_ID, // The client ID registered in OpenIddict
            redirect_uri: import.meta.env.VITE_REDIRECT_URI, // Redirect URI after successful login
            response_type: 'code', // Authorization Code Flow
            scope: 'openid profile email', // Include required scopes
            post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
            userStore: new WebStorageStateStore({ store: window.localStorage })
        };

        // Create a UserManager instance based on the config
        this.userManager = new UserManager(config);

        // Reaction to keep token in local storage
        reaction(
            () => this.token, // React to changes in the token
            token => {
                if (token) {
                    window.localStorage.setItem('jwtpub', token); // Store the token in localStorage
                    if (!this.appUser) {
                        // If appUser is not set, fetch the user
                        this.loginAppUser().catch(error => {
                            console.error("Error loading AppUser in reaction:", error);
                        });
                    }
                } else {
                    window.localStorage.removeItem('jwtpub'); // Clear the token if it is null
                    this.appUser = null; // Clear the user information as well
                }
            }
            
        );

    

        // Load token from local storage if available
        const savedToken = window.localStorage.getItem('jwtpub');
        if (savedToken) {
            this.token = savedToken;
            this.startRefreshTokenTimer();
            this.loginAppUser().catch(error => {
                console.error("Error loading AppUser on init:", error);
            });
        }
    }

    logout = () => {
        this.token = null; // Clear the token
        this.appUser = null; // Clear the user
        window.localStorage.removeItem('jwtpub'); // Remove token from local storage
        this.stopRefreshTokenTimer(); // Stop any ongoing refresh token timers
    };


    // Method to start the login process by redirecting to the /login endpoint on your server
    login = () => {
        try {
            // Ensure all parameters are strings, defaulting to an empty string if undefined
            const queryParams = new URLSearchParams({
                redirect_uri: import.meta.env.VITE_REDIRECT_URI,
            }).toString();
    
            // Redirect to the login endpoint with query parameters
            window.location.href = `${import.meta.env.VITE_AUTHORITY}/login?${queryParams}&buttons=army,edu`;
        } catch (error) {
            console.error("Login error:", error);
          //  toast.error('Login Error');
        }
    };
  
    // Method to handle the callback after login
    handleCallback = async () => {
        console.log('handle callback');
        try {
            // Manually parse the token from the query string
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token'); // Assumes token is passed as ?token=...
    
            if (token) {
                this.token = token;
                console.log("Token obtained from query string:", token);
                window.localStorage.setItem('jwtpub', this.token);
                this.startRefreshTokenTimer();
                await this.loginAppUser();
            } else {
                // Throw an error if the token is missing
                throw new Error("No token found in the callback URL.");
            }
        } catch (error) {
            toast.error('Error in handle callback');
            console.error("Callback error:", error);
            // Re-throw the error to allow it to propagate to the calling code
            throw error;
        }
    };

    loginAppUser = async () => {
        this.setLoadingUser(true); // Start loading state
        try {
            const appUser: AppUser = await agent.AppUsers.login(); // Fetch AppUser
            runInAction(() => {
                this.setAppUser(appUser); // Set the AppUser
            });
        } catch (error) {
          //  toast.error('Error in login app user');
            console.error("Error during loginAppUser:", error);
            throw error; // Re-throw error to propagate it to the caller
        } finally {
            runInAction(() => {
                this.setLoadingUser(false); // Ensure loading is stopped
            });
        }
    };

    setLoadingUser = (loadingUser: boolean) => this.loadingUser = loadingUser;

    setAppUser = (appUser: AppUser) => this.appUser = appUser;

    setAppLoaded = (appLoaded: boolean) => this.appLoaded = appLoaded;


    get isLoggedIn() {
        return !!this.token;
    }

    refreshToken = async () => {
        console.log('starting refresh token');
        this.stopRefreshTokenTimer(); // Stops any ongoing refresh timers
      
        try {
          const response = await fetch(`${import.meta.env.VITE_AUTHORITY}/setrefreshtoken`, {
            method: "GET", // HTTP GET method
            credentials: "include", // Include cookies in the request
            headers: {
              "Content-Type": "application/json", // Optional but a good practice
            },
          });
      
          if (!response.ok) {
            // Handle non-2xx HTTP responses
          //  toast.error('Error in refresh token');
            throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
          }
      
          const data = await response.json(); // Parse the JSON response
          const { token } = data; // Extract the new access token
      
          // Save the new token (e.g., in localStorage, context, or state)
          runInAction(() => this.token = token);
          console.log("Token obtained from refresh token:", token);
          window.localStorage.setItem('jwtpub', token);
      
          // Optionally, restart the refresh token timer based on token expiration
          this.startRefreshTokenTimer();
      
          console.log("Token refreshed successfully:", token);
        } catch (error) {
        //    toast.error('Error refreshing token');
          console.error("Error refreshing token:", error);
      
        }
      };

    private startRefreshTokenTimer(){
        console.log('start refresh token timer');
        if(this.token){
            const jwtToken = JSON.parse(atob(this.token.split('.')[1]));
            const expires = new Date(jwtToken.exp * 1000);
            const timeout = expires.getTime() - Date.now() - (30 * 1000);
            this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
            console.log({refreshTimeout: this.refreshTokenTimeout});

        }
    }

    private stopRefreshTokenTimer(){
        console.log('stop refresh token timer');
        clearTimeout(this.refreshTokenTimeout);
    }

    getUser = async () => {
        this.setLoadingUser(true);
        try {
            const user = await agent.AppUsers.login(); // Fetch user from API
            runInAction(() => this.setAppUser(user));
        } catch (error) {
          //  toast.error('Error fetching user');
            console.error("Error fetching user:", error);
            runInAction(() => {
                this.token = null; // Clear token if user fetch fails
                window.localStorage.removeItem('jwtpub'); // Ensure localStorage is cleared
            });
        } finally {
            runInAction(() => this.setLoadingUser(false));
        }
    };
}
