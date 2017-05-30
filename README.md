# tecsinapse-keycloak-js

## How to use tecsinapse-keycloak-js
Use `npm install tecsinapse-keycloak-js --save` to add the lib in your project.

## Making Login with tecsinapse-keycloak-js
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

- **Email**: email of the user to make login

- **Password**: password of the user to make login

- **Options**: an object that contains data to configure your access to KeycloakServer. This object contains following attributes:
  - **realm**: The realm of your application in the KeycloakServer
  - **urlServer**: The url of the KeycloakServer. Ex.: http://localhost:8081.
  - **adminUsername**: User which contains admin permission in your KeycloakServer to query data user.
  - **adminPassword**: Password which contains admin permission in your KeycloakServer to query data user.
  - **transient(optional)**: Set this attribute with **true**, if you don't want save token in the session.

The login method return a promise which contains the accessToken created by KeycloakServer.

```let accessToken = TecSinapseKeycloak.login(email, password, options).then(accessToken => accessToken);```

## Meteor

Example of use with Meteor in
https://github.com/tecsinapse/tecsinapse-keycloak-meteor-example

Specifically in this file
https://github.com/tecsinapse/tecsinapse-keycloak-meteor-example/blob/master/imports/ui/components/info/info.js

Questions?
filipe.nevola@tecsinapse.com.br
jesse.alves@tecsinapse.com.br