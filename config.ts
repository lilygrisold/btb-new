interface Config {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  REACT_APP_API_URL: string;
  REACT_APP_MAPBOX_TOKEN: string;
}

const config: Config = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || process.env.REACT_APP_MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  REACT_APP_MAPBOX_TOKEN: process.env.REACT_APP_MAPBOX_TOKEN || '',
};

export default config;
