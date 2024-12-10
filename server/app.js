// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();
const router = express.Router()
module.exports = router



// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');


app.use(express.json());

app.use('/spots', require('./routes/spots.js'))
app.use('/reviews', require('./routes/reviews.js'))
app.use('/users', require('./routes/users.js'))
app.use('/bookings', require('./routes/bookings.js'))




const port = 8000
app.listen(port, ()=> console.log(`Server Listening on Port ${port}..`))


