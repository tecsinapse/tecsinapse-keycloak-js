declare module "tecsinapse-keycloak-js" {
    declare namespace TecSinapseKeycloak {
        interface KeycloakConfig {
            realm:string
            urlServer:string
            adminUsername:string
            adminPassword:string
            transient?:boolean
        }

        export function login(username:string, password:string, options:KeycloakConfig):Promise;
        export function isLogged():boolean;
        export function logout(callback?:Function):void;
        export function getAccessToken():string;
        export function getRefreshToken():string;
        export function getUser(userEmail:string, options:KeycloakConfig):Promise;
    }
    export default TecSinapseKeycloak;
}