import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import ejs from 'ejs';

// Load environment variables
dotenv.config();

const PORT: number = parseInt(process.env.PORT || '5001', 10);

// Initialize Express app
const app: Application = express();

// Global error handlers
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Starting server setup...');
console.log(`Environment variables loaded. PORT=${PORT}`);
console.log(`REACT_APP_API_URL=${process.env.REACT_APP_API_URL || 'not set'}`);
console.log('Importing handler modules...');

// Import handlers (now TypeScript modules)
import { getGBFS, getStationStatus } from './db/gbfs-handlers';
import { requestPositionFromAddress, googleAutocomplete, getGeoJSON } from './db/location-handlers';
import {
  handleLogIn,
  handleSignUp,
  updateUserProfile,
  getUserProfile,
  updateUserRoutes,
  updateUserSettings,
} from './db/user-handlers';

console.log('Handler modules imported successfully.');

// Verify React build exists
const buildPath: string = path.join(__dirname, 'client', 'build');
const clientPath: string = path.join(__dirname, 'client');

console.log(`Checking for React build at: ${buildPath}`);
console.log('Contents of /client:', fs.readdirSync(clientPath));

if (!fs.existsSync(buildPath)) {
  console.error('React app is not built. Run `npm run build` first.');
  process.exit(1);
}

// Manual CORS headers (backup)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, DELETE, GET');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Trust proxy in production
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
}

// CORS package (primary)
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://btbapp.ca'],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  })
);

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(process.cwd(), 'client/build')));
console.log('CORS, body-parser, and static middleware configured.');

// View engine (configured but unused)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
console.log('View engine configured with EJS.');

////////////////
// Routes
////////////////

// Serve React app
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// API Endpoints
app.get('/stations', getGBFS);
app.get('/station-status', getStationStatus);
app.get('/get-position/:address', requestPositionFromAddress);
app.post('/api/place-autocomplete', googleAutocomplete);
app.post('/get-geojson-route', getGeoJSON);
app.post('/api/signup', handleSignUp);
app.post('/api/login', handleLogIn);
app.get('/api/users/:_id', getUserProfile);
app.patch('/api/update-profile', updateUserProfile);
app.patch('/api/update-settings', updateUserSettings);
app.patch('/api/add-route-to-profile', updateUserRoutes);

console.log('All API endpoints set up.');

// Catch-all route
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
console.log('Catch-all route configured.');

// Start server
console.log('Starting Express server...');
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

export default app;