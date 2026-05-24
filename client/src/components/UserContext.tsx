import { createContext, useState, ReactNode } from "react";

export interface PreviousSearch {
  destination: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  previous_searches: PreviousSearch[];
}

export interface TripDetailsData {
  totalTripTime?: number;
  totalTripDistance?: number;
  bikeWalkTime?: number;
  walkingDistance?: number;
}

export interface UserContextType {
  search: boolean;
  setSearch: (value: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  origin: string;
  setOrigin: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  convertedOriginInput: any;
  setConvertedOriginInput: (value: any) => void;
  convertedDestinationInput: any;
  setConvertedDestinationInput: (value: any) => void;
  bikeRoutesData: any[];
  setBikeRoutesData: (data: any[]) => void;
  tripDetails: TripDetailsData;
  setTripDetails: (details: TripDetailsData) => void;
  busDuration: number;
  setBusDuration: (value: number) => void;
  publicTransitResult: any;
  setPublicTransitResult: (value: any) => void;
  stationStatus: any;
  setStationStatus: (value: any) => void;
  addStations: any;
  setAddStations: (value: any) => void;
  bikeStations: any[];
  setBikeStations: (stations: any[]) => void;
  originInput: string;
  setOriginInput: (value: string) => void;
  destinationInput: string;
  setDestinationInput: (value: string) => void;
  searchForRoute: boolean;
  setSearchForRoute: (value: boolean) => void;
  userData: any;
  setUserData: (value: any) => void;
}

const defaultContext: UserContextType = {
  search: false,
  setSearch: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  origin: "124 Rue Saint- Viateur O, Montréal, QC H2T 2L1",
  setOrigin: () => {},
  destination: "275 Notre-Dame St. East, Montreal, Quebec H2Y 1C6",
  setDestination: () => {},
  convertedOriginInput: null,
  setConvertedOriginInput: () => {},
  convertedDestinationInput: null,
  setConvertedDestinationInput: () => {},
  bikeRoutesData: [],
  setBikeRoutesData: () => {},
  tripDetails: {},
  setTripDetails: () => {},
  busDuration: 0,
  setBusDuration: () => {},
  publicTransitResult: null,
  setPublicTransitResult: () => {},
  stationStatus: null,
  setStationStatus: () => {},
  bikeStations: [],
  setBikeStations: () => {},
  addStations: null,
  setAddStations: () => {},
  originInput: "124 Rue Saint- Viateur O, Montréal, QC H2T 2L1",
  setOriginInput: () => {},
  destinationInput: "275 Notre-Dame St. East, Montreal, Quebec H2Y 1C6",
  setDestinationInput: () => {},
  searchForRoute: false,
  setSearchForRoute: () => {},
  userData: null,
  setUserData: () => {},
};

export const UserContext = createContext<UserContextType>(defaultContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [search, setSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [origin, setOrigin] = useState("124 Rue Saint- Viateur O, Montréal, QC H2T 2L1");
  const [destination, setDestination] = useState("275 Notre-Dame St. East, Montreal, Quebec H2Y 1C6");
  const [convertedOriginInput, setConvertedOriginInput] = useState(null);
  const [convertedDestinationInput, setConvertedDestinationInput] = useState(null);
  const [bikeRoutesData, setBikeRoutesData] = useState<any[]>([]);
  const [tripDetails, setTripDetails] = useState<TripDetailsData>({});
  const [busDuration, setBusDuration] = useState(0);
  const [publicTransitResult, setPublicTransitResult] = useState(null);
  const [stationStatus, setStationStatus] = useState(null);
  const [addStations, setAddStations] = useState(null);
  const [bikeStations, setBikeStations] = useState<any[]>([]);
  const [originInput, setOriginInput] = useState("124 Rue Saint- Viateur O, Montréal, QC H2T 2L1");
  const [destinationInput, setDestinationInput] = useState("275 Notre-Dame St. East, Montreal, Quebec H2Y 1C6");
  const [searchForRoute, setSearchForRoute] = useState(false);
  const [userData, setUserData] = useState(null);

  return (
    <UserContext.Provider
      value={{
        search, setSearch,
        isLoggedIn, setIsLoggedIn,
        currentUser, setCurrentUser,
        origin, setOrigin,
        destination, setDestination,
        convertedOriginInput, setConvertedOriginInput,
        convertedDestinationInput, setConvertedDestinationInput,
        bikeRoutesData, setBikeRoutesData,
        tripDetails, setTripDetails,
        busDuration, setBusDuration,
        publicTransitResult, setPublicTransitResult,
        stationStatus, setStationStatus,
        bikeStations, setBikeStations,
        addStations, setAddStations,
        originInput, setOriginInput,
        destinationInput, setDestinationInput,
        searchForRoute, setSearchForRoute,
        userData, setUserData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};