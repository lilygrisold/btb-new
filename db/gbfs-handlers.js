//*************************************************************** */
"use strict";
//*************************************************************** */

// Require the request-promise package
require("dotenv").config();
const request = require('request-promise');
// const rp = require('request-promise')


// Utility to reduce (200) status: 200 fatigue
const { sendResponse } = require("./utils");

// Promise to return detailed station data (available bikes)
const requestStationStatus = () => {
  return new Promise(resolve => {
      request("https://gbfs.velobixi.com/gbfs/en/station_status.json")
          .then((response) => {
              const parsedResponse = JSON.parse(response);
              return parsedResponse;
          })
          .then((parsedResponse) => {
              let allStationData = [];
              parsedResponse.data.stations.forEach((station) => {
                  const singleStationData = {
                      station_id: station.station_id,
                      bikes: station.num_bikes_available,
                      e_bikes: station.num_ebikes_available,
                      docks: station.num_docks_available,
                      renting: station.is_renting,
                      returning: station.is_returning
                  };
                  allStationData.push(singleStationData); // Add to array
              });
              resolve(allStationData);
          })
          .catch((error) => {
              console.error("Error in requestStationStatus:", error);
              resolve([]); // Return empty array in case of error
          });
  });
};


const requestGBFS = () => {
  return new Promise(resolve => {
      request("https://gbfs.velobixi.com/gbfs/en/station_information.json")
          .then((response) => {
              const parsedResponse = JSON.parse(response);
              return parsedResponse;
          })
          .then((parsedResponse) => {
              let locations = [];
              parsedResponse.data.stations.forEach((station) => {
                  const stationLocation = {
                      station_id: station.station_id,
                      name: station.name,
                      position: [station.lon, station.lat],
                      capacity: station.capacity
                  };
                  locations.push(stationLocation);
              });
              resolve(locations);
          })
          .catch((error) => {
              console.error("Error in requestGBFS:", error);
              resolve([]); // Return empty array if there's an error
          });
  });
};

const getGBFS = async (req, res) => {
  // console.log("get GBFS")
  try {
    const response = await requestGBFS();

    sendResponse(res, 200, response, "Bike station data retreived");
    //response.json({status: 200, data: response, message: "Bike station data retreived"});
  } catch (err) {
    console.log('Error: ', err);
    sendResponse(res, 500, err, "500 error from getGBFS");
    //res.status(500).json({status: 500, data: "nope!", message: "It's a 500 error in getGBFS, oh no!"});
  }
};

const getStationStatus = async (req, res) => {
  try {
    const response = await requestStationStatus();
      sendResponse(res, 200, response, "Bike station data retreived");
  } catch (err) {
    console.log('Error: ', err);
    sendResponse(res, 500, err, "500 error from getStationStatus");
    //res.status(500).json({status: 500, data: "nope!", message: "It's a 500 error in getGBFS, oh no!"});
  }
};



//*************************************************************** */
// Export our handlers
//*************************************************************** */
module.exports = {
    getGBFS,
    getStationStatus,
};
//*************************************************************** */