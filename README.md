# Spot Homes

## Database Schema Design

![db-schema]

[db-schema]: ./images/database.png


## Routes
![hello/world]

[hello/world]: ./backend/routes/index.js
[checkRoutesStructure]: ./backend/routes/api/index.js

## API Documentation

.env: choose a custom schema name in snake case, and generate a strong JWT secret

`npm start` will run the `/bin/www` in `nodemon` when started in the development
environment with the environment variables in the `.



## Authentication Flow

The backend login flow in this project will be based on the following plan:

1. The API login route will be hit with a request body holding a valid
   credential (either username or email) and password combination.
2. The API login handler will look for a `User` with the input credential in
   either the `username` or `email` columns.
3. Then the `hashedPassword` for that found `User` will be compared with the
   input `password` for a match.
4. If there is a match, the API login route should send back a JWT in an
   HTTP-only cookie and a response body. The JWT and the body will hold the
   user's `id`, `username`, and `email`.

The backend sign-up flow in this project will be based on the following plan:

1. The API signup route will be hit with a request body holding a `username`,
   `email`, and `password`.
2. The API signup handler will create a `User` with the `username`, an `email`,
   and a `hashedPassword` created from the input `password`.
3. If the creation is successful, the API signup route should send back a JWT in
   an HTTP-only cookie and a response body. The JWT and the body will hold the
   user's `id`, `username`, and `email`.

The backend logout flow will be based on the following plan:

1. The API logout route will be hit with a request.
2. The API logout handler will remove the JWT cookie set by the login or signup
   API routes and return a JSON success message.
