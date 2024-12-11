// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();
// const router = express.Router();
// module.exports = router;

// backend/app.js




// Import environment variables in order to connect to database - DO NOT MODIFY
// require('dotenv').config();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

// app.use('/spots', require('./routes/spots.js'));
// app.use('/reviews', require('./routes/reviews.js'));
// app.use('/users', require('./routes/users.js'));
// app.use('/bookings', require('./routes/bookings.js'));


// Security Middleware
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    })
);

// Set the _csrf token and create req.csrfToken method
app.use(
    csurf({
        cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
        }
    })
);

const routes = require('./routes');

// ...

app.use(routes); // Connect all the routes


// const port = 8000
// app.listen(port, ()=> console.log(`Server Listening on Port ${port}..`));


module.exports = app;

