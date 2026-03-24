// Import React and Mapbox
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import 'mapbox-gl';
import { decodeHerePolyline } from '../../utils/flexible-polyline';


// Import Icons and Components
import { BsSearch } from "react-icons/bs";
import { FaMapMarkerAlt, FaDotCircle } from "react-icons/fa";
import { UserContext } from "../UserContext";
import Typeahead from "../map/typeahead/Typeahead";


const NavSearch = ({ mapRef, mapboxgl,createOriginOrDestinationMarker, addTransitIcon, addRouteLayer, removeMarkers, centerMapOnOrigin}) => {

  // Variables
  const [geoJSONfetch, setGeoJSONfetch] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [popUp, setPopUp] = useState(false);
  const [suggestedOriginAddresses, setSuggestedOriginAddresses] = useState([]);
  const [suggestedDestinationAddresses, setSuggestedDestinationAddresses] = useState([]);
  // Constant to track suggestion selection using up and down keys in handleKeyDown
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  
  // User Context
  const {
    search,
    setSearch,
    origin,
    setOrigin,
    destination,
    setDestination,
    setBikeRoutesData,
    publicTransitResult,
    setPublicTransitResult,
    bikeStations,
    setAddStations,
    currentUser,
    originInput,
    setOriginInput,
    destinationInput,
    setDestinationInput,
    searchForRoute,
    setSearchForRoute,
    userData,
  } = useContext(UserContext);

  // API functionality to pull from localhost in development and heroku in production
  const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://btbapp.ca');

  // Funcion to toggle the search bar popping up in UI
  const toggleSearch = () => setSearch(!search);

  // Function to get the euclidean distance between two points
  const getDistance = (start, finish) => {

    const distEucl = Math.sqrt(Math.pow(start[1] - finish[1], 2) + Math.pow(start[0] - finish[0], 2));
    return distEucl * 11.1;
  };

  // Function to find the station closest to origin
  const nearestStationCalc = (location, type) => {

    const distanceArray = bikeStations
      .filter(station => {
        if (type === 'origin') return station.bikes > 0 || station.e_bikes > 0;
        if (type === 'destination') return station.docks > 0;
        return false;
      })
      .map(station => ({
        station_id: station.station_id,
        position: station.position,
        distance: getDistance(location, station.position),
      }))
      .sort((a, b) => a.distance - b.distance);

    return distanceArray[0]?.position || location;
  };
  // Search for Route UseEffect to be triggered on form submission
  useEffect(() => {
    if (!searchForRoute) return;
    
    // Send the addresses to our endpoint using a string that will be accepted by the server
    const fetchCoords = async () => {
      try {
        const encodedOrigin = encodeURIComponent(originInput);
        const encodedDestination = encodeURIComponent(destinationInput);
    
        const originRes = await fetch(`${API_URL}/get-position/${encodedOrigin}`);
        const originData = await originRes.json();
        setOrigin(originData.data);
    
        const destinationRes = await fetch(`${API_URL}/get-position/${encodedDestination}`);
        const destinationData = await destinationRes.json();
        setDestination(destinationData.data);
    
        setGeoJSONfetch(true);
        setAddStations(true);
        setSearch(false); // ✅ Only hide form if fetch succeeds
      } catch (error) {
          console.error("Error in fetchCoords:", error);
          setPopUp(false);
          setTimeout(() => {
            setErrorMsg("Looks like our server couldn't find that address, please try again");
            setPopUp(true);
          }, 50);
        }
        
    };
    
  
    fetchCoords();

    // If the user is logged in, add the search to their previous trips
    if (currentUser) {
      const addRoute = {
        _id: currentUser._id,
        route: { origin: originInput, destination: destinationInput },
      };
      fetch('/api/add-route-to-profile', {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addRoute),
      }).then(res => res.json()).then(console.log);
    }
  
  }, [searchForRoute]);
  
  // Function to get public transit route for use in Map
  const fetchPublictTransitDirections = () => {
    fetch(`https://transit.router.hereapi.com/v8/routes?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&apiKey=${process.env.HERE_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (!data.routes || data.routes.length === 0) {
          setPopUp(false);
          setTimeout(() => {
            setErrorMsg("No good public transit route found, you might have a long walk");
            setPopUp(true);
          }, 50);
          return;
        }   
        setPublicTransitResult(data); // Store results
      })
      .catch(err => {
        console.error("HERE Transit API error:", err);
        setPopUp(false);
        setTimeout(() => {
          setErrorMsg("Failed to fetch public transit directions");
          setPopUp(true);
        }, 50);
      });
      
  };
  
  // geoJSONfetch useEffect: if the geoJSON results are present, 
  // fetch public transit directions with results 
  useEffect(() => {
    if (geoJSONfetch) {
      fetchPublictTransitDirections();
      setGeoJSONfetch(false);
    }
  }, [geoJSONfetch]);

  // publicTransitResult useEffect: will add bike stations to map and suggest bike route
  useEffect(() => {
    // Wait until we have a public transit result from the server
    if (!publicTransitResult) return;

    // Calculate nearest bike stations
    const originBikeStation = nearestStationCalc(origin, 'origin');
    const destinationBikeStation = nearestStationCalc(destination, 'destination');
    setBikeRoutesData([]);

    const navigationMode = userData?.settings?.use_bike_paths === false ? 'driving' : 'cycling';

    // Add the routes to the map in three sections: walking, transport, walking
    // (layerOrigin, layerDestination, routeName, routeColor, profile, triptype, addStations, dashed)
    // (origin station, destination station, route name, route colour, profile, trip type, add marker to map or not)
    addRouteLayer(origin, originBikeStation, 'walk-to-station', '#F39C12', 'walking', 'biketrip',false, true);
    addRouteLayer(originBikeStation, destinationBikeStation, 'bike-between-stations', '#F39C12', navigationMode, 'biketrip', true, false);
    addRouteLayer(destinationBikeStation, destination, 'walk-from-station', '#F39C12', 'walking','biketrip', false, true);

    // Wait for public transit result then set the stations the user will use
    if (publicTransitResult.routes?.length > 0) {
      publicTransitResult.routes[0].sections.forEach(element => {
       if (element.type === 'transit') {
  const mode = element.transport.mode.toLowerCase();

  const originTS = [
    element.departure.place.location.lng,
    element.departure.place.location.lat
  ];
  const destinationTS = [
    element.arrival.place.location.lng,
    element.arrival.place.location.lat
  ];

  const originName = element.departure.place.name || 'Transit Stop';
  const destinationName = element.arrival.place.name || 'Transit Stop';

  const originTime = element.departure.time;
  const destinationTime = element.arrival.time;

  // 🔥 Pass name and time
  addTransitIcon(originTS, mode, originName, originTime);
  addTransitIcon(destinationTS, mode, destinationName, destinationTime);

  addRouteLayer(origin, originTS, 'walk-to-transit', '#5499C7', 'walking', 'transittrip', false, true);
  const encoded = element.polyline?.polyline || element.polyline;

  if (encoded) {
    console.log("Transit polyline (encoded):", encoded);
    const decodedPolyline = decodeHerePolyline(encoded);
    console.log("Transit polyline (decoded):", decodedPolyline);
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: decodedPolyline
      }
    };

    if (mapboxgl && mapboxgl.Map) {
      const sourceId = `transit-${Math.random()}`;
      mapRef.current.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      });
      mapRef.current.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#303A2B',
          'line-width': 5,
          'line-opacity': 0.85
        }
      });
    }
  } else {
    // fallback to driving line if no geometry provided
    addRouteLayer(originTS, destinationTS, 'transit-between-stations', '#303A2B', 'driving', 'transittrip', false, false);
  }

  addRouteLayer(destinationTS, destination, 'walk-from-transit', '#5499C7', 'walking', 'transittrip', false, true);
  createOriginOrDestinationMarker(origin, 'origin');
  createOriginOrDestinationMarker(destination, 'destination');  
}


      });

    } else {
      setErrorMsg("Sorry we had an issue retreiving the public transit route, please try again");
      setPopUp(true);
    }
    removeMarkers(originBikeStation,destinationBikeStation);
    centerMapOnOrigin();
    setSearchForRoute(false);
  }, [publicTransitResult]);

  // Handle selection of google autocomplete suggestions via keystroke
  const handleKeyDown = (e, suggestions, setInputValue) => {
    if (e.key === "ArrowDown") {
      setActiveSuggestionIndex((prevIndex) => {
        return prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex;
      });
    } else if (e.key === "ArrowUp") {
      setActiveSuggestionIndex((prevIndex) => {
        return prevIndex > 0 ? prevIndex - 1 : prevIndex;
      });
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      setInputValue(suggestions[activeSuggestionIndex]);
      setActiveSuggestionIndex(-1); // Reset the active index
    }
  };

  // Function to call autocomplete API for origin for our Typeahead
  const handleOriginChange = async (e) => {
    const inputValue = e.target.value;
    setOriginInput(inputValue);
    if (inputValue.trim()) {
      try {
        const response = await fetch(`${API_URL}/api/place-autocomplete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: inputValue }),
        });
        const data = await response.json();
        // const addressString = data.suggestions[0]?.description;
        // setOrigin(addressString);
        const addresses = data.suggestions
          ? data.suggestions.map(suggestion => suggestion.description)
          : [];
        setSuggestedOriginAddresses(addresses);
      } catch (error) {
        console.error("Error fetching origin suggestions:", error);
        setSuggestedOriginAddresses([]);
      }
    } else {
      setSuggestedOriginAddresses([]);
    }
  };
  // Function to call autocomplete API for destination for our Typeahead
  const handleDestinationChange = async (e) => {
    const inputValue = e.target.value;
    setDestinationInput(inputValue);
    if (inputValue.trim()) {
      try {
        const response = await fetch(`${API_URL}/api/place-autocomplete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: inputValue }),
        });
        const data = await response.json();
        //const addressString = data.suggestions[0]?.description;
        const addresses = data.suggestions
          ? data.suggestions.map(suggestion => suggestion.description)
          : [];
        setSuggestedDestinationAddresses(addresses);
      } catch (error) {
        console.error("Error fetching destination suggestions:", error);
        setSuggestedDestinationAddresses([]);
      }
    } else {
      setSuggestedDestinationAddresses([]);
    }
  };

  return (
    <>
      <ToggleSearch onClick={toggleSearch}>
        <FlexRow>
          <Icon><BsSearch size={26} /></Icon>
          <GetDirectionsText>Where to?</GetDirectionsText>
        </FlexRow>
      </ToggleSearch>

      {popUp && (
        <PopUp>
          <CloseButton onClick={() => setPopUp(false)}>×</CloseButton>
          {errorMsg}
        </PopUp>
      )}  

      {search && (
        <GetDirectionsForm onSubmit={(e) => {
          e.preventDefault();
          setGeoJSONfetch(true);  // 🔥 This triggers the useEffect to get geoJSON results
          setSearchForRoute(true); // This searches for the route which adds layers on the map
        }}>
           <InputWrapper>
              <FlexColLeft>
                  <CircleIcon />
                  <VerticalDots />
                  <PinIcon />
              </FlexColLeft>
              <FlexCol>
                <Typeahead
                  type="text"
                  placeholder="Origin"
                  value={originInput}
                  onChange={(e) => handleOriginChange(e)}
                  suggestedOriginAddresses={suggestedOriginAddresses}
                  onKeyDown={(e) => handleKeyDown(e, suggestedOriginAddresses, setOriginInput)}
                  activeSuggestionIndex={activeSuggestionIndex}
                  autofocus
                />
                <Typeahead
                  type="text"
                  placeholder="Destination"
                  value={destinationInput}
                  onChange={(e) => handleDestinationChange(e)}
                  suggestedDestinationAddresses={suggestedDestinationAddresses}
                />
              </FlexCol>
          </InputWrapper>
          
          <GetDirectionsSubmit type="submit">Let's Go!</GetDirectionsSubmit>
      </GetDirectionsForm>
      )}
    </>
  );
};

export default NavSearch

const ToggleSearch = styled.button`
  display: flex;
  justify-content: center;
  width: 100%;
  font-family: var(--font-heading);
  font-weight: bold;
  color: var(--color-quarternary);
  background-color: var(--color-quarternary);
  font-size: 24px;
  border: 1px solid var(--color-primary);
`;


const GetDirectionsText = styled.div`
  color: white;
  font-size: 32px;
  font-weight: 600;
  font-family: var(--font-heading);
  margin: 5px 0 5px 15px;
`;

const Icon = styled.div`
  color: white;
  font-family: var(--font-heading);
  margin-left: -5px;
  margin-top: 5px;
`;

const GetDirectionsForm = styled.form`
  position: absolute;
  z-index: 5;
  display: flex;
  flex-direction: column;
  width: 100%;
`;


const GetDirectionsSubmit = styled.button`
  font-family: var(--font-heading);
  font-weight: bold;
  color: white;
  background-color: var(--color-secondary);
  font-size: 24px;
  border: 1px solid var(--color-primary);
  padding: 7px;
  cursor: pointer;
  transition: ease-in-out 100ms;
  &:hover {
    transform: scale(1.02);
  }
  &:active {
    transform: scale(0.8);
    background-color: lightgray;
  }
`;

const PopUp = styled.div`
  position: relative;
  display: flex;
  width: 90%;
  justify-content: center;
  align-items: center;
  border: 1px solid #E5E7E9;
  border-radius: 15px;
  padding: 1em;
  background-color: rgb(242, 146, 146);
  color: white;
  margin: 1em auto;
  font-size: 1rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -10px;
  left: -10px;
  background-color: rgb(242, 146, 146);
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #f00;
    color: #fff;
  }
`;


const FlexRow = styled.div`
  display: flex;
  align-items: center;
`;

const CircleIcon = styled(FaDotCircle)`
    color: var(--color-primary);
`;

const PinIcon = styled(FaMapMarkerAlt)`
    color: var(--color-primary);
`;

const VerticalDots = styled.div`
    height: 1.5rem;
    border-left: 2px dotted black;
    margin: 0;
`;

const FlexColLeft = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0;
    width: 2rem;
`;

const InputWrapper = styled.div`
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 0;
    background-color: white;
`;

const FlexCol = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
`;