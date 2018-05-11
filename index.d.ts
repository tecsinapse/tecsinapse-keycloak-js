declare module "tecsinapse-keycloak-js" {
    declare namespace TecSinapseKeycloak {
        interface KeycloakConfig {
            urlServer:string
            realm:string
            clientId:string
            fetcher?:function
        }

        interface UserAdmin {
            adminUsername:string
            adminPassword:string
        }

        /**
         * 
         * @param options 
         */
        export function config(options: KeycloakConfig);

        /**
         * The login method return a promise which contains the accessToken created by KeycloakServer.
         * @method login
         * @param email of the user to do login
         * @param password of the user to do login
         * @param transient(optional) this param defines if the token will be saved on the client
         */
        export function login(email:string, password:string, transient?:boolean):Promise;

        /**
         * The isLogged method verify if your user still logged in
         */
        export function isLogged():boolean;

        /**
         * The logout method receives a callback function to execute after logout your user. Ex.: redirect to login page.
         * @param userAdmin
         * @param callback
         */
        export function logout(userAdmin: UserAdmin, callback?:Function):void;

        /**
         * Get the token object saved on the client
         */
        export function getToken():Promise<object>;
        /**
         * The getAccessToken method return a Promise with the accessToken created by KeycloakServer
         */
        export function getAccessToken():Promise<string>;
        export function getRefreshToken():Promise<string>;
        export function getUser(userEmail:string, userAdmin:UserAdmin):Promise;
        export function getRoles(userId:string, userAdmin: UserAdmin):Promise<Array<string>>;
        export function hasRole(userId:string, role:string, userAdmin: UserAdmin):Promise<boolean>;

        /**
         * This method doesn't save token on cookie, it just returns the json object of KeycloakServer
         * @param username 
         * @param password 
         */
        export function createToken(username, password);
    }
    export default TecSinapseKeycloak;
}