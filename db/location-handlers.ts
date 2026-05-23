import { Request, Response } from 'express';
import opencage from 'opencage-api-client';
import { sendResponse } from './utils';

// Types for geocoding response
interface OpenCageResult {
  geometry: {
    lng: number;
    lat: number;
  };
}

interface OpenCageResponse {
  results: OpenCageResult[];
}

// Types for Google autocomplete
interface GooglePrediction {
  description: string;
  place_id: string;
}

interface GoogleAutocompleteResponse {
  status: string;
  error_message?: string;
  predictions: GooglePrediction[];
}

// Types for GeoJSON route
interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

interface GeoJSONRoute {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  properties: {
    distance: number;
    duration: number;
    error?: string;
  };
}

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY || '';
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';
const HERE_API_KEY = process.env.REACT_APP_HERE_API_KEY || '';


/**
 * Convert address to lat/lng using OpenCage API
 */
const getPositionFromAddress = async (address: string): Promise<[number, number]> => {
  const requestObj = {
    key: OPENCAGE_API_KEY,
    q: address,
  };

  try {
    const data = await opencage.geocode({ q: requestObj.q, key: requestObj.key }) as OpenCageResponse;
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for the given address');
    }

    const lng = data.results[0].geometry.lng;
    const lat = data.results[0].geometry.lat;

    return [lng, lat];
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Express handler: GET /get-position/:address
 */
const requestPositionFromAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const result = await getPositionFromAddress(address);

    if (!result) {
      sendResponse(res, 404, req.params, 'Address not converted');
      return;
    }

    sendResponse(res, 200, result, 'Address converted');
  } catch (err) {
    console.error('Position request error:', err);
    sendResponse(res, 500, null, err instanceof Error? err.message: 'Geocoding failed');
  }
};

/**
 * Express handler: POST /api/place-autocomplete
 * Uses Google Places API for address suggestions
 */
const googleAutocomplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: 'Input is required and must be a string' });
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url, {
      headers: {
        'Referer': req.headers.origin || 'https://btbapp.ca'
      }
    });

    const data = await response.json() as GoogleAutocompleteResponse;

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.error_message || data.status);
      res.status(500).json({ 
        error: data.error_message || 'Error with Google Places API',
        status: data.status 
      });
      return;
    }

    res.status(200).json({ suggestions: data.predictions });
  } catch (error) {
    console.error('Unexpected server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fetch bike route from HERE Routing API v8
 * Returns GeoJSON LineString with distance/duration
 */
const getRouteBetween = async (
        origin: [number, number], 
        destination: [number, number]
    ): Promise<GeoJSONRoute> => {
        if (!HERE_API_KEY) {
            throw new Error('HERE_API_KEY not configured in environment');
        }

    // origin/destination are [lng, lat] from our geocoding
    const [originLng, originLat] = origin;
    const [destLng, destLat] = destination;

    const url = new URL('https://router.hereapi.com/v8/routes');
    url.searchParams.append('transportMode', 'bicycle');
    url.searchParams.append('origin', `${originLat},${originLng}`);
    url.searchParams.append('destination', `${destLat},${destLng}`);
    url.searchParams.append('return', 'polyline,summary');
    url.searchParams.append('apiKey', HERE_API_KEY);

    try {
    const response = await fetch(url.toString());

    if (!response.ok) {
    throw new Error(`HERE API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
        routes: Array<{
            sections: Array<{
            polyline: string;
            summary: {
                length: number;
                duration: number;
            };
            }>;
        }>;
    };

    if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
    }

    const section = data.routes[0].sections[0];

    // Decode HERE flexible polyline to GeoJSON coordinates
    // For now, return straight line if polyline decode not available
    // TODO: Import decodeHerePolyline from client utils if needed
    const coordinates: [number, number][] = [origin, destination];

    return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates
        },
        properties: {
            distance: section.summary.length, // meters
            duration: section.summary.duration, // seconds
        }
        };

        } catch (error) {
        console.error('HERE Routing error:', error);
        // Fallback: return straight line between points
        return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [origin, destination]
        },
        properties: {
            distance: 0,
            duration: 0,
            error: error instanceof Error ? error.message : 'Routing failed'
        }
    };
    }
};

/**
 * Express handler: POST /get-geojson-route
 * Returns GeoJSON route between two points
 */
const getGeoJSON = async (req: Request, res: Response): Promise<void> => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    res.status(400).json({ error: 'Origin and destination are required' });
    return;
  }
}



export {
  requestPositionFromAddress,
  googleAutocomplete,
  getGeoJSON
};