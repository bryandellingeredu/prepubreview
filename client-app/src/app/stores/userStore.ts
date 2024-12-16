import { makeAutoObservable, reaction, runInAction } from "mobx";
import { UserManager, WebStorageStateStore,  } from 'oidc-client-ts';
import { AppUser } from "../models/appUser";
import agent from "../api/agent";

export default class UserStore {
    token: string | null = localStorage.getItem('jwtpub');
    redirectPath: string | null = localStorage.getItem('redirectPath')
    userManager: UserManager;
    refreshTokenTimeout?: ReturnType<typeof setTimeout>;
    appUser: AppUser | null = null;
    appLoaded = false;
    loadingUser: boolean = false;

    constructor() {
        makeAutoObservable(this);

        // Configuration for the OpenIddict server
        const config = {
            authority: 'https://localhost:7274', // OpenIddict server URL
            client_id: 'new-client-id', // The client ID registered in OpenIddict
            redirect_uri: 'https://localhost:3000/prepubreview/callback', // Redirect URI after successful login
            response_type: 'code', // Authorization Code Flow
            scope: 'openid profile email', // Include required scopes
            post_logout_redirect_uri: 'https://localhost:3000/prepubreview/homepage',
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

        reaction(
            () => this.redirectPath, // React to changes in the redirectPath
            (path) => {
                if (path) {
                    window.localStorage.setItem('redirectPath', path); // Save the redirect path in localStorage
                } else {
                    window.localStorage.removeItem('redirectPath'); // Remove the redirect path if it is null
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

        // Automatically check for user on initialization
     //   this.userManager.getUser().then(user => {
          //  if (user && !user.expired) {
            //    this.token = user.access_token;
             //   this.startRefreshTokenTimer();
          //  } else {
              //  this.token = null;
          //  }
      //  }).catch(error => {
         //   console.error("User loading error:", error);
      //  });
    }

    logout = () => {
        this.token = null; // Clear the token
        this.appUser = null; // Clear the user
        this.clearRedirectPath(); // Clear the redirect path
        window.localStorage.removeItem('jwtpub'); // Remove token from local storage
        window.localStorage.removeItem('redirectPath'); // Remove redirect path from local storage
        this.stopRefreshTokenTimer(); // Stop any ongoing refresh token timers
    };


    // Method to start the login process by redirecting to the /login endpoint on your server
    login = () => {
        try {
            // Ensure all parameters are strings, defaulting to an empty string if undefined
            const queryParams = new URLSearchParams({
                redirect_uri: "https://localhost:3000/prepubreview/callback",
            }).toString();
    
            // Redirect to the login endpoint with query parameters
            window.location.href = `https://localhost:7274/login?${queryParams}&buttons=army,edu`;
        } catch (error) {
            console.error("Login error:", error);
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
            console.error("Callback error:", error);
            // Re-throw the error to allow it to propagate to the calling code
            throw error;
        }
    };

    loginAppUser = async () => {
        debugger;
        this.setLoadingUser(true); // Start loading state
        try {
            const appUser: AppUser = await agent.AppUsers.login(); // Fetch AppUser
            runInAction(() => {
                this.setAppUser(appUser); // Set the AppUser
            });
        } catch (error) {
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

    getTokenPayload = () => {
        if (!this.token) return null;

        try {
            const payload = this.token.split('.')[1]; // JWT structure is header.payload.signature
            const decodedPayload = JSON.parse(atob(payload));
            return JSON.stringify(decodedPayload, null, 2); // Format as a pretty JSON string
        } catch (error) {
            console.error("Error decoding token payload:", error);
            return null;
        }
    };

    refreshToken = async () => {
        console.log('starting refresh token');
        this.stopRefreshTokenTimer(); // Stops any ongoing refresh timers
      
        try {
          const response = await fetch("https://localhost:7274/setrefreshtoken", {
            method: "GET", // HTTP GET method
            credentials: "include", // Include cookies in the request
            headers: {
              "Content-Type": "application/json", // Optional but a good practice
            },
          });
      
          if (!response.ok) {
            // Handle non-2xx HTTP responses
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
          console.error("Error refreshing token:", error);
      
          // Handle the error, e.g., redirect to login or show a message
          //this.handleRefreshTokenError(error);
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
        debugger;
        this.setLoadingUser(true);
        try {
            const user = await agent.AppUsers.login(); // Fetch user from API
            runInAction(() => this.setAppUser(user));
        } catch (error) {
            console.error("Error fetching user:", error);
            runInAction(() => {
                this.token = null; // Clear token if user fetch fails
                window.localStorage.removeItem('jwtpub'); // Ensure localStorage is cleared
            });
        } finally {
            runInAction(() => this.setLoadingUser(false));
        }
    };

    setRedirectPath = (path: string) => {
        this.redirectPath = path;
    };

    clearRedirectPath = () => {
        this.redirectPath = null;
    };
}
