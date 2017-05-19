interface KeycloakConfig {
    urlServer:String
    realm:String
}

interface UserQueryParam {
    search?:String;
    firstName?:String;
    lastName?:String;
    email?:String
    username?:String
    first?:number
    max?:number
}

declare module TecSinapseKeycloak {
    export function login(username:String, password:String, options:KeycloakConfig):Boolean;
    export function isLogged():Boolean;
    export function logout():void;
    export function getUsers(keycloakConfig:KeycloakConfig, params:UserQueryParam):Promise<any>;
}
export default TecSinapseKeycloak;