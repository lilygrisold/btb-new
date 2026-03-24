// React essentials
import { useEffect, useContext, useState } from "react";
import styled from "styled-components";

// Icons
import { MdDirectionsBike } from "react-icons/md";
import { FaWalking } from "react-icons/fa";
import { FaBus } from "react-icons/fa";
import { RiPinDistanceFill } from "react-icons/ri";

// Context
import { UserContext } from "../UserContext";

const TripDetails = () => {
    // Required states from useContext
    const {
        bikeRoutesData, 
        tripDetails,
        setTripDetails,
        busDuration,
        setBusDuration,
        publicTransitResult,
    } = useContext(UserContext);

    
    const [displayTripDetails, setDisplayTripDetails] = useState(false); // To store the data from the trip
    const [busWalkTime, setBusWalkTime] = useState(0); // To store walking time to and from bus

    // Use effect to run the bikeTripDuration calculation once routesData is set
    useEffect(()=>{
        if (publicTransitResult !== null && bikeRoutesData.length > 0){
            bikeTripDuration();
            publicTransitDuration();
            setDisplayTripDetails(true);
        }
    },[publicTransitResult, bikeRoutesData])

    // Create a function that will calculate the total trip duration 
    // to display to the user in minutes and kilometers
    const bikeTripDuration = () => {
        let totalTripTime = 0;
        let totalTripDistance = 0;
        let bikeWalkTime = 0;
        let walkingDistance = 0;
        bikeRoutesData.map((i) => {
            // For each leg, sum duration and distance
            totalTripTime += i.duration;
            totalTripDistance += i.distance;
            // If the data is for pedestrian travel,
            // sum the walking distance and duration
            if(i.weight_name === "pedestrian"){
                    bikeWalkTime += i.duration;
                    walkingDistance += i.distance; 
            }
            return (bikeWalkTime, walkingDistance)
        })
        setTripDetails(
            {
            ...tripDetails,
            "totalTripTime": Math.round(totalTripTime/60), 
            "totalTripDistance": Math.round(100*totalTripDistance/1000)/100, 
            "bikeWalkTime": Math.round(bikeWalkTime/60),
            "walkingDistance": Math.round(100*walkingDistance/1000, 2)/100
            }
        )
    }

    const publicTransitDuration = () => {
        const sections = publicTransitResult.routes[0].sections;
        const departure = new Date(sections[0].departure.time);
        const arrival = new Date(sections[sections.length - 1].arrival.time);
        const travelTime = (arrival.getTime() - departure.getTime()) / (1000 * 60);
        const walkDeparture = new Date(sections[0].departure.time);
        const walkArrival = new Date(sections[0].arrival.time);
        const walkTimeMinutes = (walkArrival.getTime() - walkDeparture.getTime()) / (1000 * 60);
        setBusDuration(travelTime);
        setBusWalkTime(walkTimeMinutes);
    };
    

    return (<>
            {displayTripDetails
            ? 
            <>

            <TripDetailsInfo>
                <FlexCol>
                    <FlexRow>
                        <TripDistance> <DistanceIcon><RiPinDistanceFill/></DistanceIcon>{tripDetails.totalTripDistance} km</TripDistance>
                        <TripTime> <BikeIcon><MdDirectionsBike /></BikeIcon> {tripDetails.totalTripTime} mins</TripTime>
                        <WalkingTime> <WalkingIcon><FaWalking /></WalkingIcon> {tripDetails.bikeWalkTime} mins</WalkingTime>
                    </FlexRow>
                    <FlexRow>
                        <TripDistance> <DistanceIcon><RiPinDistanceFill/></DistanceIcon>{tripDetails.totalTripDistance} km</TripDistance>
                        <BusDuration><BusIcon><FaBus/></BusIcon> {busDuration} mins</BusDuration>
                        <WalkingTime> <WalkingIcon><FaWalking /></WalkingIcon> {busWalkTime} mins</WalkingTime>
                    </FlexRow>
                </FlexCol>
            </TripDetailsInfo>
            </>
            : <></>
            }
            </>
    ) 
}


export default TripDetails;

const TripDetailsInfo = styled.div`
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 12%;
    padding-top: 10px;
    background-color: var(--color-secondary);
    font-size: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    
`;


const TripDistance = styled.div`
    color: white;
    margin: 0px 10px 0px 10px;
`;
const TripTime = styled.div`
    color: white;
    margin:  0px 10px 0px 20px;
`;
const WalkingTime = styled.div`
    color: white;
    margin:  0px 10px 0px 10px;
`;
const BusDuration = styled.div`
    color: white;
    margin:  0px 10px 0px 20px;
`;
const Text = styled.span`
    color: var(--color-tertiary);
`;
const DistanceIcon = styled.span`
    color: var(--color-tertiary);
    margin-right: 10px;
    font-size: 18px;
`;
const BikeIcon = styled.span`
    color: var(--color-tertiary);
    margin-right: 10px;
    font-size: 18px;
`;
const BusIcon = styled.span`
    color: var(--color-tertiary);
    margin-right: 10px;
    font-size: 18px;
`;
const WalkingIcon = styled.span`
    color: var(--color-tertiary);
    margin-right: 10px;
    font-size: 18px;
`;
const FlexCol = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin:  10px 0px 10px 0px;
`;
const FlexRow = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    margin: 0px 20px 5px 0;
`;