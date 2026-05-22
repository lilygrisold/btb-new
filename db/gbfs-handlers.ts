import { Request, Response } from 'express';
import { sendResponse } from './utils';

// GBFS API response types
interface GBFSStationStatus {
  station_id: string;
  num_bikes_available: number;
  num_ebikes_available: number;
  num_docks_available: number;
  is_renting: number;
  is_returning: number;
}

interface GBFSStationInfo {
  station_id: string;
  name: string;
  lon: number;
  lat: number;
  capacity: number;
}

interface StationStatus {
  station_id: string;
  bikes: number;
  e_bikes: number;
  docks: number;
  renting: number;
  returning: number;
}

interface StationLocation {
  station_id: string;
  name: string;
  position: [number, number];
  capacity: number;
}

// Fetch station status from Bixi GBFS API
const requestStationStatus = async (): Promise<StationStatus[]> => {
  try {
    const response = await fetch('https://gbfs.velobixi.com/gbfs/en/station_status.json');
    const data = await response.json() as {data: {stations: GBFSStationStatus[]}};
    
    return data.data.stations.map((station: GBFSStationStatus) => ({
      station_id: station.station_id,
      bikes: station.num_bikes_available,
      e_bikes: station.num_ebikes_available,
      docks: station.num_docks_available,
      renting: station.is_renting,
      returning: station.is_returning
    }));
  } catch (error) {
    console.error('Error in requestStationStatus:', error);
    return [];
  }
};

// Fetch station locations from Bixi GBFS API
const requestGBFS = async (): Promise<StationLocation[]> => {
  try {
    const response = await fetch('https://gbfs.velobixi.com/gbfs/en/station_information.json');
    const data = await response.json() as {data: {stations: GBFSStationInfo[]}};
    
    return data.data.stations.map((station: GBFSStationInfo) => ({
      station_id: station.station_id,
      name: station.name,
      position: [station.lon, station.lat],
      capacity: station.capacity
    }));
  } catch (error) {
    console.error('Error in requestGBFS:', error);
    return [];
  }
};

const getGBFS = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await requestGBFS();
    sendResponse(res, 200, response, 'Bike station data retrieved');
  } catch (err) {
    console.error('Error in getGBFS:', err);
    sendResponse(res, 500, err, '500 error from getGBFS');
  }
};

const getStationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await requestStationStatus();
    sendResponse(res, 200, response, 'Bike station status retrieved');
  } catch (err) {
    console.error('Error in getStationStatus:', err);
    sendResponse(res, 500, err, '500 error from getStationStatus');
  }
};

export { getGBFS, getStationStatus };
