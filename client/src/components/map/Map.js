// React essentials
import { useRef, useEffect, useState, useContext } from "react";
import styled from "styled-components";
import 'mapbox-gl';

// Required by Mapbox
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import mapboxgl from 'mapbox-gl';
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.css';
// Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { IconBus, IconTrain, IconBike } from '@tabler/icons-react';
import { createRoot } from 'react-dom/client';

// Components
import NavSearch from "./NavSearch";
import TripDetails from "./TripDetails";
import { UserContext } from "../UserContext";


// Bring in mapbox token from .env files
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = () => {
    // *****************************************************
    // States and Constants
    // *****************************************************
    // Requred by mapbox
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const [lng, setLng] = useState(-73.5674); 
    const [lat, setLat] = useState(45.5019); 
    const [zoom, setZoom] = useState(9);
    const [loading, setLoading] = useState(true);
    // User states
    const [mapInit, setMapInit] = useState(false); // Let's us know if the map has been initialized
    const [bikeDataRetrieved, setBikeDataRetrieved] = useState(false); // Let's us know if /stations and /station-status have been fetched
    const [currentMarkers, setCurrentMarkers] = useState([]); // Stores bikestation markers
    const [bikeLocations, setBikeLocations] = useState([]); // Stores data from /stations
    // API functionality to pull from localhost in production and heroku in development
    const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://btbapp.ca');
    // Check that API pulls a valid result from process
    if (!API_URL) {
        console.error("API_URL is undefined. Check your .env setup.");
    }
    // User context
    const {
        origin,
        destination,
        setBikeRoutesData,
        stationStatus,
        setStationStatus,
        bikeStations, 
        setBikeStations,
        addStations
    } = useContext(UserContext);

    // *****************************************************
    // useEffects required by mapbox base - DO NOT EDIT
    // *****************************************************
    useEffect(() => {
        // Check map has been initialized
        if (mapRef.current) return;
        mapRef.current = new mapboxgl.Map({ // Create new map
            container: mapContainer.current, // Place in map container
            style: 'mapbox://styles/mapbox/streets-v11', // Use latest version
            center: [lng, lat], // Centre the map on lng lat as defined above
            zoom: zoom // Passes zoom state to map
        });
        mapRef.current.on("load", () => {
            setTimeout(() => {
              window.scrollTo(0, 0);
            }, 500); // 0.5s timeout to allow map to load
          });
        setMapInit(true); // Don't initialize map again
    },[]);

    // UseEffect for user moving the map
    useEffect(() => {
        if (!mapRef.current) return;
        mapRef.current.on('move', () => { // When map is moved
            setLng(mapRef.current.getCenter().lng.toFixed(4)); // Update centre lng to user centre
            setLat(mapRef.current.getCenter().lat.toFixed(4)); // Update centre lat to user centre
            setZoom(mapRef.current.getZoom().toFixed(2)); // Update zoom level
        });
    },[]);

    // *****************************************************
    // Retrieve stations and related data
    // *****************************************************
    useEffect(() => {
        // Only fetch the data if it hasn't been fetched already
        if (bikeDataRetrieved === false){
            fetch(`${API_URL}/stations`) // Retreives bikeshare station information
            .then(res => {
                if (!res.ok) {
                    throw new Error(`API request failed: ${res.status}`);
                }
                return res.json();
            })
            .then(json => {
                setBikeLocations(json.data); // Store /stations data
                return fetch(`${API_URL}/station-status`);
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`API request failed: ${res.status}`);
                }
                return res.json();
            })
            .then(json => {
                setStationStatus(json.data); // Store the /station-status data in context for use in TripDetails.js
                setBikeDataRetrieved(true); // Don't retreive data twice
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        }
    },[]);

    useEffect(()=>{
        // Check that /stations and /station-status have been fetched and stored locally in state
        if (bikeDataRetrieved && bikeLocations.length > 0 && stationStatus !== null){
            let stations = []; // Empty array to rearrange data for our use
            bikeLocations.map((station) => { // For every station
                stationStatus.map((data) => { // Map through additional data
                    if(station.station_id === data.station_id){ // If it's the same station via id match
                        const stationResponse = { // Set an object for that station with our selected data
                            station_id: station.station_id,
                            name: station.name,
                            position: station.position,
                            capacity: station.capacity,
                            bikes: data.bikes,
                            e_bikes: data.e_bikes,
                            docks: data.docks,
                            renting: data.renting,
                            returning: data.returning
                        };
                        stations = [...stations, stationResponse]; // Add to array
                    }
                });
            });
            setBikeStations(stations); // Store the array in state
        }
    },[bikeDataRetrieved]);

    // *****************************************************
    // Customization useEffect
    // *****************************************************
    useEffect(() => {
        if (mapInit === true) { // Wait until map is initialized
            mapRef.current.addControl(new mapboxgl.GeolocateControl({ // Adds button to centre map on user
                positionOptions: { enableHighAccuracy: true }, // High accuracy GPS data
                trackUserLocation: true, // Track user as they move
                showUserHeading: true // Show device orientation
            }));
            // Add a button for fullscreen
            mapRef.current.addControl(new mapboxgl.FullscreenControl({container: mapContainer.current}));
            // Add zoom and roatation buttons
            mapRef.current.addControl(new mapboxgl.NavigationControl());
        }
    },[mapInit]);

    // *****************************************************
    // Add bike station markers
    // *****************************************************
    useEffect(() => {
        // Backup timeout to prevent endless loading
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000); // 3 seconds max wait
        // Check map is initialized and staion data has been stored in state
        if (bikeStations.length > 0 && mapInit === true) {
            // ✅ Remove old markers
            currentMarkers.forEach(marker => marker.remove());
            setCurrentMarkers([]); // Clear state
    
            // ✅ Add new markers
            bikeStations.forEach((station) => {
                // Create icon container
                const iconElement = document.createElement('div');
                iconElement.style.width = '30px';
                iconElement.style.height = '30px';
                iconElement.style.borderRadius = '50%';
                iconElement.style.backgroundColor = '#FEC789';
                iconElement.style.display = 'flex';
                iconElement.style.justifyContent = 'center';
                iconElement.style.alignItems = 'center';
                iconElement.style.boxShadow = '0 0 4px rgba(0, 0, 0, 0.2)';
                iconElement.style.cursor = 'pointer';

                // Render bike icon
                const root = createRoot(iconElement);
                root.render(<IconBike size={18} color="white" />);

                // Add popup with station info
                const popupElement = document.createElement('div');
                popupElement.className = 'custom-popup';
                popupElement.innerHTML = `
                    <h3 style="margin: 0 0 4px 0;">Bikes: ${station.bikes}</h3>
                    <h4 style="margin: 0 0 4px 0;">E-bikes: ${station.e_bikes}</h4>
                    <h3 style="margin: 0;">Docks: ${station.docks}</h3>
                `;
                const popup = new mapboxgl.Popup().setDOMContent(popupElement);

                const marker = new mapboxgl.Marker(iconElement)
                    .setLngLat(station.position)
                    .setPopup(popup)
                    .addTo(mapRef.current);

                setCurrentMarkers(current => [...current, marker]);
            });

    
            setBikeDataRetrieved(false);
            setLoading(false);
        }
    
        return () => clearTimeout(timeout); // 🔥 Always clear the timeout
    }, [stationStatus, addStations]);
    
    

    // *****************************************************
    // Origin and destination markers
    // *****************************************************
    const createOriginOrDestinationMarker = (coords, type) => {
        const outer = document.createElement('div');
        outer.style.width = '30px';
        outer.style.height = '30px';
        outer.style.borderRadius = '50%';
        outer.style.display = 'flex';
        outer.style.justifyContent = 'center';
        outer.style.alignItems = 'center';
        outer.style.boxShadow = '0 0 4px rgba(0,0,0,0.2)';
        outer.style.cursor = 'default';

        const inner = document.createElement('div');
        inner.style.width = '22px';
        inner.style.height = '22px';
        inner.style.borderRadius = '50%';

        if (type === 'origin') {
            outer.style.backgroundColor = 'black';
            inner.style.backgroundColor = 'white';
        } else if (type === 'destination') {
            outer.style.backgroundColor = 'white';
            inner.style.backgroundColor = 'black';
        }

        outer.appendChild(inner);

        const marker = new mapboxgl.Marker(outer)
            .setLngLat(coords)
            .addTo(mapRef.current);

        setCurrentMarkers((current) => [...current, marker]);
    };

    // *****************************************************
    // Functions to remove markers
    // *****************************************************
    const removeMarkers = (originBikeStation, destinationBikeStation) => {
        // Check markers have been added before removing them
        if (currentMarkers!==null) {
            for (let i = currentMarkers.length - 1; i >= 0; i--) { // Step through currentmarkers array
                if (
                    // Only keep the origin bike station and destination bike station
                    (currentMarkers[i]._lngLat.lng !== originBikeStation[0] || currentMarkers[i]._lngLat.lat !== originBikeStation[1]) &&
                    (currentMarkers[i]._lngLat.lng !== destinationBikeStation[0] || currentMarkers[i]._lngLat.lat !== destinationBikeStation[1])
                ) {
                    // Otherwise clear the map for easier view of route
                    currentMarkers[i].remove();
                }
            }
        }
    };

    // *****************************************************
    // Get route function
    // *****************************************************
    const getRoute = async (start, finish, routeName, routeColor, profile, triptype, dashed) => {
        // If route is not a [lat],[lng] array, turn it into one
        if (!Array.isArray(start) || !Array.isArray(finish) || start.length < 2 || finish.length < 2) {
            console.error("Invalid start or finish coordinates:", { start, finish, routeName, routeColor, profile, triptype });
            return;
        }
        // Check map has been initialized
        if (!mapInit) return;
    
        try {
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${finish[0]},${finish[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
    
            if (!json.routes || json.routes.length === 0) {
                window.alert("Couldn't generate a bikeshare route. Try adjusting your start or end points!");
                return;
            }
    
            const data = json.routes[0];
            // If it's a biketrip, store it in Context
            if (triptype === "biketrip") {
                setBikeRoutesData(bikeRoutesData => [...bikeRoutesData, data]);
            }
    
            const route = data.geometry.coordinates;
            const geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            };
    
            if (mapRef.current.getSource(`${routeName}`)) {
                mapRef.current.getSource(`${routeName}`).setData(geojson);
            } else {
                if (mapRef.current.getLayer('point')) {
                    mapRef.current.removeLayer('point');
                    mapRef.current.removeSource('point');
                }
                if(dashed){
                    mapRef.current.addLayer({
                        id: `${routeName}`,
                        type: 'line',
                        source: { type: 'geojson', data: geojson },
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': `${routeColor}`,
                            'line-width': 5,
                            'line-opacity': 0.75,
                            'line-dasharray': [1, 2]
                        }
                    });
                } else {
                    mapRef.current.addLayer({
                        id: `${routeName}`,
                        type: 'line',
                        source: { type: 'geojson', data: geojson },
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': `${routeColor}`,
                            'line-width': 5,
                            'line-opacity': 0.75,

                        }
                    });
                }

            }
        } catch (err) {
            console.error("Mapbox routing error:", err);
            window.alert("There was a problem generating your route. Try again.");
        }
    };
    
    const isValidCoordinatePair = (coord) => {
        return Array.isArray(coord) &&
        coord.length === 2 &&
        Number.isFinite(coord[0]) &&
        Number.isFinite(coord[1]);
    };
    
    
    // *****************************************************
    // Add route layer function
    // *****************************************************
    const addRouteLayer = (layerOrigin, layerDestination, routeName, routeColor, profile, triptype, addStations, dashed) => {
        // Wait until the map is loaded to try adding routes
        if (!mapInit) return;
        // Check the co-ordinates are being passed as a valid [lat,lng] array
        if (isValidCoordinatePair(layerOrigin) && isValidCoordinatePair(layerDestination)) {

            if (addStations) {
    const addStationMarker = (coord) => {
        const station = bikeStations.find(
        (s) => s.position[0] === coord[0] && s.position[1] === coord[1]
        );

        // Create custom circular marker
        const iconElement = document.createElement('div');
        iconElement.style.width = '30px';
        iconElement.style.height = '30px';
        iconElement.style.borderRadius = '50%';
        iconElement.style.backgroundColor = '#FEC789';
        iconElement.style.display = 'flex';
        iconElement.style.justifyContent = 'center';
        iconElement.style.alignItems = 'center';
        iconElement.style.boxShadow = '0 0 4px rgba(0, 0, 0, 0.2)';
        iconElement.style.cursor = 'pointer';

        const root = createRoot(iconElement);
        root.render(<IconBike size={18} color="white" />);

        const marker = new mapboxgl.Marker(iconElement).setLngLat(coord).addTo(mapRef.current);

        if (station) {
        const popupElement = document.createElement('div');
        popupElement.className = 'custom-popup';
        popupElement.innerHTML = `
            <h3 style="margin: 0 0 4px 0;">Bikes: ${station.bikes}</h3>
            <h4 style="margin: 0 0 4px 0;">E-bikes: ${station.e_bikes}</h4>
            <h3 style="margin: 0;">Docks: ${station.docks}</h3>
        `;
        const popup = new mapboxgl.Popup().setDOMContent(popupElement);
        marker.setPopup(popup);
        }

        setCurrentMarkers(current => [...current, marker]);
    };

    // ✅ Call for both origin and destination stations
    addStationMarker(layerOrigin);
    addStationMarker(layerDestination);
    }


            getRoute(layerOrigin, layerDestination, routeName, routeColor, profile, triptype, dashed);

            if (mapRef.current.getLayer('point')) {
                mapRef.current.removeLayer('point');
                mapRef.current.removeSource('point');
            }

            mapRef.current.addLayer({
                id: 'point',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: { type: 'Point', coordinates: layerOrigin }
                        }]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#BFCCFF'
                }
            });
        } else {
            console.error("Invalid coordinates for layerOrigin or layerDestination:", {
                layerOrigin,
                layerDestination
            });
        }
        
        
    };

    // *****************************************************
    // Add Transit Icon function
    // *****************************************************
   const addTransitIcon = (coords, mode, stopName = '', stopTime = '') => {
        if (!mapRef.current || !coords || coords.length !== 2) return;

        const iconElement = document.createElement('div');
        iconElement.style.width = '30px';
        iconElement.style.height = '30px';
        iconElement.style.borderRadius = '50%';
        iconElement.style.backgroundColor = '#BFCCFF';
        iconElement.style.display = 'flex';
        iconElement.style.justifyContent = 'center';
        iconElement.style.alignItems = 'center';
        iconElement.style.boxShadow = '0 0 4px rgba(0, 0, 0, 0.2)';
        iconElement.style.cursor = 'pointer';

        const root = createRoot(iconElement);
        const iconColor = 'white';
        const iconSize = 18;

        console.log('Transit mode:', mode); // Check that mode is

        switch (mode) {
            case 'bus':
                root.render(<IconBus size={iconSize} color={iconColor} />);
                break;
            case 'train':
            case 'rail':
            case 'subway':
            case 'tram':
            case 'metro':
                root.render(<IconTrain size={iconSize} color={iconColor} />);
                break;
            default:
                console.warn('Unknown transit mode:', mode);
                return;
            }

  

  // Format time (e.g. "08:30 AM")
  const timeStr = stopTime
    ? new Date(stopTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const popupContent = document.createElement('div');
  popupContent.innerHTML = `
    <div style="
      font-family: sans-serif;
      font-size: 14px;
      font-weight: bold;
      color: #333;
      padding: 6px 10px;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
    ">
      <div>${stopName}</div>
      ${timeStr ? `<div style="font-weight: normal; font-size: 13px; margin-top: 4px;">${timeStr}</div>` : ''}
    </div>
  `;

  const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: true })
    .setDOMContent(popupContent);

  const marker = new mapboxgl.Marker(iconElement)
    .setLngLat(coords)
    .setPopup(popup)
    .addTo(mapRef.current);

  setCurrentMarkers((current) => [...current, marker]);
};




    // *****************************************************
    // Center map on origin function
    // *****************************************************
    const centerMapOnOrigin = () => {
        if (mapInit) {
            const start = { center: destination, zoom: 1, pitch: 0, bearing: 0 };
            const end = { center: origin, zoom: 16.5, bearing: 0, pitch: 0 };

            let isAtStart = true;
            const target = isAtStart ? end : start;
            isAtStart = !isAtStart;

            mapRef.current.flyTo({
                ...target,
                duration: 5001,
                essential: true
            });
        }
    };

    return (
        <>
            <Wrapper>
                {loading && (
                    <LoadingOverlay>
                        <FontAwesomeIcon icon={faCircleNotch} spin size="3x" />
                    </LoadingOverlay>
                )}

                <div className="sidebar">
                    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </div>
                <NavSearch 
                    addRouteLayer={addRouteLayer}
                    mapboxgl={mapboxgl}
                    mapRef={mapRef}
                    removeMarkers={removeMarkers}
                    centerMapOnOrigin={centerMapOnOrigin}
                    getRoute={getRoute}
                    addTransitIcon={addTransitIcon}
                    createOriginOrDestinationMarker={createOriginOrDestinationMarker}
                />
                <MapContainer ref={mapContainer} className="map-container" />
                <TripDetails />
            </Wrapper>
        </>
    );
};

export default Map;

const Wrapper = styled.div``;

const MapContainer = styled.div`
    height: 900px;
`;
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
