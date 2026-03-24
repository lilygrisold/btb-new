////////
// PORT
////////
const PORT = process.env.PORT || 5001;

////////////////////
// Base dependencies
////////////////////

const express = require("express");
const bp = require( 'body-parser');
const path = require("node:path");
const fs = require('fs');
const ejs = require('ejs');
const cors = require('cors');
console.log("Starting server setup...");
process.on('uncaughtException', (err) => {
  console.error("Uncaught Exception:", err);
});

/////////////////
// Server Logging
/////////////////
process.on('unhandledRejection', (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
console.log(`Environment variables loaded. PORT=${PORT}`);
console.log(`REACT_APP_API_URL=${process.env.REACT_APP_API_URL || 'not set'}`);
console.log("Importing handler modules...");

///////////
// Handlers
///////////
const { getGBFS, getStationStatus } =require(  "./db/gbfs-handlers.js");
const { requestPositionFromAddress, googleAutocomplete, getGeoJSON} =require(  "./db/location-handlers.js");
const { handleLogIn, 
        handleSignUp, 
        updateUserProfile, 
        getUserProfile, 
        updateUserRoutes, 
        updateUserSettings
    } =require( "./db/user-handlers");

console.log("Handler modules imported successfully.");
///////////////
// SERVER SETUP
///////////////
// Use express
const app = express();
// Check if build was successful
const buildPath = path.join(__dirname, 'client', 'build');
console.log(`Checking for React build at: ${buildPath}`);

// ??
// Client folder logging for crashed server in heroku 05/05/25
const clientPath = path.join(__dirname, 'client');
// ??

console.log("Contents of /client:", fs.readdirSync(clientPath));
// Check if the buildpath exists synchronously on the filesystem to ensure React app was built
if (!fs.existsSync(buildPath)) {
  console.error("React app is not built. Run `npm run build` first.");
  process.exit(1);
}
/** Setting up server to accept cross-origin browser requests */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Trust  X-Forwarded-For, X-Forwarded-Proto etc from Heroku if in production
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
}
// Enable cors
app.use(cors({
  // Use either localhost for development or correct heroku url for production
  origin: [
    "http://localhost:3000",
    "https://btbapp.ca"
  ],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept"
}));
// Enable body parser
app.use(bp.json());
app.use(bp.urlencoded({extended:true}));
// Point express to our build
app.use(express.static(path.join(process.cwd(), 'client/build')));
// Log result
console.log("CORS, body-parser, and static middleware configured.");
// Configure view engine
app.set('view engine', ejs);
app.set('views', path.join(__dirname, 'views'));
// Log result
console.log("View engine configured with EJS.");

//////////////////////////////////////
// Use webpack to serve the react app
//////////////////////////////////////

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

////////////////
// API Endpoints
////////////////

// Create an endpoint to request bike station data
app.get("/stations", getGBFS)
// Get individual station data
app.get("/station-status", getStationStatus)
// Create an endpoint that will return the lon/lat based on a user address input in the form
app.get("/get-position/:address", requestPositionFromAddress)
// Google Maps autocomplet API
app.post('/api/place-autocomplete', googleAutocomplete);
// Geojson converter
app.post("/get-geojson-route", getGeoJSON);
// Create an endpoint to add a user in the database on sign up
app.post("/api/signup", handleSignUp)
// Create an endpoint to retrieve user data based on user ID
// when they sign in
app.post("/api/login", handleLogIn)
// Create an endpoint to retrieve user data to store in state based on user id
app.get("/api/users/:_id", getUserProfile)
// Create an endpoint to modify user information when user 
app.patch("/api/update-profile", updateUserProfile)
// Create an endpoint to modify user information when user submits the settings form in /profile
app.patch("/api/update-settings", updateUserSettings)
// Create an endpoint to add previous routes to user profile
app.patch("/api/add-route-to-profile", updateUserRoutes)

console.log("All API endpoints set up.");

// Catch all endpoint
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
console.log("Catch-all route configured.");

console.log("Starting Express server...");
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

module.exports = app;