// Require opencage - an open source api that allows for conversion of
// address to lng/lat position for use in mapbox
require('dotenv').config();
const opencage = require('opencage-api-client');
const { get } = require('request');

const fetch = require('node-fetch');

    
// Utility to reduce (200) status: 200 fatigue
const { sendResponse } = require("./utils");
const { getGBFS } = require('./gbfs-handlers');

// Define a function that will return the lat/lng based on client input
const getPositionFromAddress = async (address) => {
    const requestObj = {
        key: process.env.OPENCAGE_API_KEY,
        q: `${address}`,
    };
    
    return new Promise(async (resolve, reject) => {
        return opencage.geocode({ q: requestObj.q, key: requestObj.key })
            .then((data) => {
                const parsedResponse = JSON.parse(JSON.stringify(data));
                return parsedResponse;
            })
            .then((parsedResponse) => {
                const results = parsedResponse.results;
                if (!results || results.length === 0) {
                    return reject(new Error("No results found for the given address"));
                }
                const lng = results[0].geometry.lng;
                const lat = results[0].geometry.lat;

                resolve([lng, lat]);
            })
            .catch((error) => {
                reject(error);
            });
    });
};


const requestPositionFromAddress = async (req, res) => {
    try {
        const address = req.params.address;
        const result = await getPositionFromAddress(address);
        if (result === undefined) {
            sendResponse(res, 404, req.params, "Address not converted");
        } else {
            sendResponse(res, 200, result, "Address converted");
        }
    } catch (err) {
        console.log(err);
        sendResponse(res, 500, err, "This request resulted in an internal server error");
    }
};

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

const googleAutocomplete = async (req, res) => {
    try {
      const { input } = req.body;
  
      if (!input) {
        return res.status(400).json({ error: 'Input is required' });
      }
  
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
  
      const data = await response.json();
  
      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.error_message || data.status);
        return res.status(500).json({ error: data.error_message || 'Error with Google Places API' });
      }
  
      return res.status(200).json({ suggestions: data.predictions });
    } catch (error) {
      console.error('Unexpected server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
const getGeoJSON = async (req, res) => {
    const { origin, destination } = req.body;
  
    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination are required" });
    }
  
    try {
      const routeGeoJSON = await getRouteBetween(origin, destination);
      res.json(routeGeoJSON);
    } catch (error) {
      console.error("Error in get-geojson-route:", error);
      res.status(500).json({ error: "Failed to generate route" });
    }
  }  
//*************************************************************** */
// Export our handlers
//*************************************************************** */
module.exports = {
    requestPositionFromAddress,
    googleAutocomplete,
    getGeoJSON
};
//*************************************************************** */