declare module "tecsinapse-keycloak-js" {
    declare namespace TecSinapseKeycloak {
        interface KeycloakConfig {
            urlServer:string
            realm:string
            clientId:string
            adminUsername:string
            adminPassword:string
            transient?:boolean
            daysToExpireCookie?:number
            fetcher:function
        }

        /**
         * The login method return a promise which contains the accessToken created by KeycloakServer.
         * @method login
         * @param email of the user to do login
         * @param password of the user to do login
         * @param options an object that contains data to configure your access to KeycloakServer. This object contains following attributes:
         */
        export function login(email:string, password:string, options:KeycloakConfig):Promise;

        /**
         * The isLogged method verify if your user still logged in
         */
        export function isLogged():boolean;

        /**
         * The logout method receives a callback function to execute after logout your user. Ex.: redirect to login page.
         * @param callback
         */
        export function logout(options:KeycloakConfig, callback?:Function):void;

        /**
         * The getAccessToken method return the accessToken created by KeycloakServer
         */
        export function getAccessToken():string;
        export function getRefreshToken():string;
        export function getUser(userEmail:string, options:KeycloakConfig):Promise;
        export function getRoles(options:KeycloakConfig, userId:string):Promise<Array<string>>;
        export function hasRole(options:KeycloakConfig, userId:string, role:string):Promise<boolean>;

        /**
         * This method doesn't save token on cookie, it just returns the json object of KeycloakServer
         * @param username 
         * @param password 
         * @param options 
         */
        export function getToken(username, password, options);
    }
    export default TecSinapseKeycloak;
}