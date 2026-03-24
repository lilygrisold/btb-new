//**************************************************************** */
// Imports
//**************************************************************** */

// Import react dependencies
import styled from "styled-components";
import { NavLink, useNavigate } from "react-router-dom";

// Local dependencies
import logo from "../assets/logo.png";

// Icons
import { FaRegUser } from "react-icons/fa";
import { useContext, useEffect, useState} from "react";
import { UserContext } from "./UserContext";


// The Header is an element that will sit at the top of 
// all pages, it is defined as a constant here and passed
// to App.
const Header = () => {

    //**************************************************************** */
    // Constants
    //**************************************************************** */

    // Use context to access states initialized in UserContext
    const {
        isLoggedIn, 
        setIsLoggedIn,
        setCurrentUser
    } = useContext(UserContext);
   
    
    // Define a navigator to allow us to use Navigate to move
    // the user to the desired page without them clicking on 
    // any links
    const navigate = useNavigate();
    
    // Function that navigates to the specified route (/profile) on click
    const [route, setRoute] = useState("");
    useEffect(() => {
      if (route) {
        navigate(`/${route}`);
      }
    }, [route, navigate]);
  
    const handleClick = (routeName) => {
      setRoute(routeName);
    };

    // Create a function to handle click of logot button
    const handleClickLogOut = () => {
        setCurrentUser(false); // ?? backend ??
        setIsLoggedIn(false);
    }

    //**************************************************************** */
    // Render
    //**************************************************************** */

    return(
        <>
        <Wrapper>

            <LogoAndSearch>
                <NavLink to={"/"}>
                    <Logo src = {logo} onClick={()=> {handleClick("")}}/>
                </NavLink>
            </LogoAndSearch>
            <FlexRow>
                
                {isLoggedIn &&
                <NavLink to={"/profile"}>
                    <ProfileBtn><FaRegUser size = {40}/></ProfileBtn>
                </NavLink>
                }
    
                {isLoggedIn
                    ? 
                    <LogOut
                        onClick={handleClickLogOut}
                        >
                        Logout
                        </LogOut> 
                    : 
                    <NavLink to={"/login"}>
                        
                        <LogIn>
                        Login
                        </LogIn>
                        </NavLink>
                }
            </FlexRow>

        </Wrapper>

        </>
    )
};

// Export the component to be used in App
export default Header;

//**************************************************************** */
// Styled-Components
//**************************************************************** */

const Wrapper = styled.div`

    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: var(--color-secondary);
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
`;
const LogoAndSearch = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;
const FlexRow = styled.div`
    width: 100%;
    height: inherit;
    display: flex;
    justify-content: right;
    align-items: center;
    margin: 0 20px 0 0;
`;
const Logo = styled.img`
    width: 6rem;
    margin: 0.5rem 0 0.5rem 1rem;
`;
const ProfileBtn = styled.button`
    color: white;
    background-color: var(--color-secondary);
    border: none;
    margin: 0 3.5rem;
    height: 100%;
    cursor: pointer;
    transition: ease-in-out 200ms;
    &:hover {
        transform: scale(1.2);
        color: var(--color-quarternary);
    }
    &:active{
        transform: scale(.8);
        color: var(--color-primary);
    }
`;
const LogIn = styled.button`
    font-family: var(--font-heading);
    color: white;
    font-size: 100%;
    border: 0.1rem solid white;
    border-radius: 4.6rem;
    width: 4.6rem;
    height: 4.6rem;
    background-color: var(--color-secondary);
    cursor: pointer;
    transition: ease-in 300ms;
    &:hover {
        border-color: var(--color-secondary);
        color:var(--color-secondary);
        background-color: white;
        transform: scale(1.1);
    }
    &:active{
        border-color: var(--color-quarternary);
        color: var(--color-quarternary);
        transition: ease-in 100ms;
        transform: scale(.8);
    }
`;
const LogOut = styled.button`
    font-family: var(--font-heading);
    font-size: 100%;
    border: 0.1rem solid white;
    border-radius: 4.6rem;
    width: 4.6rem;
    height: 4.6rem;
    color: white;
    align-items: center;
    text-align: center;
    background-color: var(--color-secondary);
    cursor: pointer;
    transition: ease-in 300ms;
    &:hover {
        border-color: var(--color-secondary);
        color:var(--color-secondary);
        background-color: white;
        transform: scale(1.1);
    }
    &:active{
        border-color: var(--color-quarternary);
        color: var(--color-quarternary);
        transition: ease-in 100ms;
        transform: scale(.98);
    }
`;