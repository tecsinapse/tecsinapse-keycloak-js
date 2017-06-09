# tecsinapse-keycloak-js

## How to use tecsinapse-keycloak-js
Use `npm install tecsinapse-keycloak-js --save` to add the lib in your project.

## Login with tecsinapse-keycloak-js
```
import TecSinapseKeycloak from 'tecsinapse-keycloak-js;

const options = {
  realm:'your_realm',
  urlServer:'http://yourkeycloakserver.com',
  adminUsername: 'youruseradmin@admin.com',
  adminPassword: 'youruseradminpassword'
};

TecSinapseKeycloak.login(email, password, options);
```

- **Email**: email of the user to do login

- **Password**: password of the user to do login

- **Options**: an object that contains data to configure your access to KeycloakServer. This object contains following attributes:
  - **urlServer**: The url of the KeycloakServer. Ex.: http://localhost:8081.
  - **realm**: The realm of your application in the KeycloakServer.
  - **clientId**: The clientId where you will login.
  - **adminUsername**: User which contains admin permission in your KeycloakServer to query data user.
  - **adminPassword**: Password which contains admin permission in your KeycloakServer to query data user.
  - **transient(optional)**: Set this attribute with **true**, if you don't want save token in the session.

This method return a promise which contains the accessToken created by KeycloakServer.

```let accessToken = TecSinapseKeycloak.login(email, password, options).then(accessToken => accessToken);```

  - **Email**: Email of user to do login.
  - **Password**: Password of user to do login.
  - **Options**: Same of login method.

###### Logout
This method logout user at KeycloakServer.

``` TecSinapseKeycloak.logout(options, callback);```

  - **Options**: Same of login method.
  - **callback**: Callback function. Ex.: redirect to login page.

###### isLogged

This method return a boolean to verify if your user still logged in

``` TecSinapseKeycloak.isLogged();```

###### getAccessToken

This method return the accessToken created by KeycloakServer

``` TecSinapseKeycloak.getAccessToken();```

###### getRefreshToken

This method return the refreshToken created by KeycloakServer

``` TecSinapseKeycloak.getRefreshToken();```

###### getUser

This method return a promise which contains a JSON object that represents the user at KeycloakServer

``` TecSinapseKeycloak.getUser(userEmail, options).then(user => user);```

  - **Options**: Same of login method.
  - **userEmail**: Email to search user at KeycloakServer.

###### getRoles

This method return a promise which contains an Array of roles user

``` TecSinapseKeycloak.getRoles(options, userId).then(roles => roles);```

  - **Options**: Same of login method.
  - **userId**: UserId of user at KeycloakServer.

###### hasRole

This method return a promise which contains a boolean value

``` TecSinapseKeycloak.hasRole(options, userId, role);```

  - **Options**: Same of login method.
  - **userId**: UserId of user at KeycloakServer.
  - **role**: Role defined at KeycloakServer.


## Meteor

Example of use with Meteor without Accounts
https://github.com/tecsinapse/tecsinapse-keycloak-meteor-example

Specifically in this file
https://github.com/tecsinapse/tecsinapse-keycloak-meteor-example/blob/master/imports/ui/components/info/info.js

## Developer

### New Release
- npm run compile
- npm publish

## Questions?
- filipe.nevola@tecsinapse.com.br
- jesse.alves@tecsinapse.com.br
