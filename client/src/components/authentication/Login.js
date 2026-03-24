//**************************************************************** */
// Imports
//**************************************************************** */
// React essentials
import React from "react";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
// Local dependencies
import { UserContext } from "../UserContext";
// Images for user password visibility button
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";


// Component to be used in /login for existing users
const Login = () => {
  //**************************************************************** */
  // Constants
  //**************************************************************** */
  // Import required states from User Context
  const {  
    setCurrentUser, 
    isLoggedIn, 
    setIsLoggedIn } =
    useContext(UserContext);
  // Set some new states for 
  const [userEmail, setUserEmail] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [inputType, setInputType] = useState("password");

  // Some states to create a styled error message
  const [popUp, setPopUp] = useState(false);

  // For navigation
  let navigate = useNavigate();

  // API functionality to pull from localhost in production and heroku in development
  const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://btbapp.ca');

  //**************************************************************** */
  // Functions
  //**************************************************************** */
  // Create a function to toggle visibility of password and confirm 
  // password inputs by changing the type of input
  const togglePassword =()=>{
    if(inputType === "password")
    {
     setInputType("text")
     return;
    }
    setInputType("password")
  }

  // Create a function to handle submission of login form
  const handleSubmit = (e) => {
    // Stop the page from automatically reloading on submit
    e.preventDefault();
    // Create an object to post to the server
    const userLogin = { 
      email: userEmail, 
      password: passwordInput 
    };
    // Set up our options sprcifying the body to be posted and the 
    // header data type/ method
    const options = {
      method: "POST",
      body: JSON.stringify(userLogin),
      headers: { 
        Accept: "application/json",
        "Content-Type": "application/json" 
      },
    };
    // Post to the server
    fetch(`${API_URL}/api/login`, options)
      .then((res) => res.json())
      .then((json) => {
        const {status, error} = json;
        if (status >= 400) {
          // If there is an error, display an error message
          setPopUp(true);
        } else if(status === 200){
          // If the response is a success, set the user login state 
          // set the current user data for use in cart and profile
          // and navigate to the homepage so the user can begin shopping
          setIsLoggedIn(true);
          setCurrentUser(json.data);
          navigate("/");
          window.scrollTo({
            top: 0,
            left: 100
          })
        } else if (error){
          window.alert(error);
        }
      })
      // Uncaught fetch errors
      .catch((err) => console.log(err));
    };

  
    const [route, setRoute] = useState("");

    useEffect(() => {
      if (route) {
        navigate(`/${route}`);
      }
    }, [route]);
  
    const handleClick = (routeName) => {
      setRoute(routeName);
    };

  //**************************************************************** */
  // Page render
  //**************************************************************** */
  // Nothing new here: it's basically an edited Signup return
  return (
    <>
    <Center>
    <Wrapper>
    {popUp 
      ? <PopUp> 
          <FlexCol>
            <Center>
            <H2>Wawaweewa!</H2>
            </Center>
            <Text>
              Computer says the Username and Password
              you have entered do not match our records.
              Try again?
            </Text>
            <Center>
              <Button 
              onClick = {()=>setPopUp(false)}
              type="ok">Sounds good!</Button>
            </Center>
          </FlexCol>
        </PopUp>
      : <></> 
    }
      {isLoggedIn 
      ? <>
          <H1>Log in successful!</H1>
          <GoHome>
            <HomepageLink 
            href="/">Let's go!</HomepageLink>
          </GoHome>
        </>
      : <>
          <H1>Log In</H1>
          <LoginForm onSubmit={handleSubmit}>
            <LoginSection>

              <Label htmlFor="email">Email:</Label>
              <FlexRow1>

              <Input1
                autoFocus
                type="email"
                placeholder="info@btb.ltd"
                value={userEmail}
                required={true}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              </FlexRow1>
              
              <Label htmlFor="password">Password:</Label>
              <FlexRow1>
                <Input2
                  type={inputType} 
                  placeholder="##########"
                  value={passwordInput} 
                  aria-describedby="password-constraints"
                  required = {true}
                  onChange={(e) => setPasswordInput(e.target.value)} 
                />
                <TogglePassword 
                  type="button"
                  aria-label="Show password as plain text.
                    Warning: this will display your password on the screen."
                  onClick={togglePassword}>
                  { inputType ==="password"
                    ? <AiOutlineEyeInvisible size = {25} />
                    : <AiOutlineEye size = {25}/>
                  }
                </TogglePassword>
              </FlexRow1>

              <Button type="submit">Continue</Button>
              <FlexRow2>
                <NoAccount>Don't have an account? </NoAccount>
                <NoAccount><SignUpLink type = "button" onClick={() => handleClick("signup")}>Sign Up!</SignUpLink></NoAccount>
              </FlexRow2>
            </LoginSection>
          </LoginForm>
        </>
      }
      </Wrapper>
    </Center>
    </>
  );
};

// Export our component
export default Login;

// This CSS is a repetition of SignUp:
const PopUp= styled.div`
    display: flex;
    width: 90%;
    justify-content: center;
    border: 1px solid #E5E7E9;
    border-radius: 15px;
    position: absolute;
      z-index: 1;
      top: 240px;
    font-size: 26px;
    margin-left: -30px;
    font-family: var(--font-heading);
    background-color: white;

    padding: 10px 20px;
`;
const Center= styled.div`
    display: flex;
    width: inherit;
    justify-content: center;
`;
const Wrapper = styled.div`
  border: none;
  border-radius: 20px;
  background-color: var(--color-secondary);
  padding: 0px 50px 0px 50px;
  margin: 30px 0 100px 0;
  
  h1 {
    margin: 20px 0 20px;
  }
  @media (max-width: 700px) {
    width: inherit
  }
`;
const H1 = styled.h1`
    text-align: left;
    padding: 0 0 30px 0;
    font-size: 36px;
    color:white;
    
`;
const H2 = styled.h1`
    text-align: center;
    padding: 0 0 10px 0;
    font-size: 36px;
`;
const GoHome = styled.div`
    text-align: left;
    padding: 30px 0 0 0;
    font-size: 36px;
`;
const LoginSection = styled.div`
  display: flex;
  flex-direction: column;
  width: inherit;
`;

const LoginForm = styled.form`
  width: inherit;
`;

const Label = styled.label`
  font-size: 1rem;
  color: white;
  text-align: left;
  font-size: 24px;
  width: inherit;
  margin: 4% 0 2%;
`;
const Input1 = styled.input`
  font-size: 1.5em;
  width: inherit;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: none;
  ::placeholder {
    color: var(--color-secondary);
  }
`;
const Input2 = styled.input`
  font-size: 1.5em;
  width: inherit;
  height: 2.5rem;
  margin: 0 -14% 0 0 ;
  border-radius: 0.5rem;
  border: none;
  ::placeholder {
    color: var(--color-secondary);
  }
`;

const Button = styled.button`
  width: 100%;
  font-family: var(--font-heading);
  font-weight: bold;
  color: white;
  background-color: var(--color-quarternary);
  font-size: 1.5em;
  border-radius: 0.5rem;
  border: none;
  padding: 0.5rem 0 0.5rem 0;
  margin-top: 1.5rem;
  cursor: pointer;
    transition: ease-in-out 100ms;
    &:hover{
      transform: scale(1.02);
    }
    &:active{
        transform: scale(.8);
        background-color: lightgray;
    }
`;

const SignUpLink = styled.button`

  color: var(--color-quarternary);
  background-color: white;
  font-size: 14px;
  border-radius: 0.5rem;
  font-weight: 900;
  border: none;
  font-weight: bold;
  text-decoration: none;
  &:hover{
    color: white;
  }
`;
const HomepageLink = styled.a`
  color: white;
  font-size: 2.6%;
  border: 1px solid white;
  border-radius: 10px;
  padding: 100.5em;
  text-decoration: none;
`;
const NoAccount = styled.p`
  color: white;
  font-size: 1em;
  font-weight: 600;
`;
const FlexRow1 = styled.div`
  width: 100%;
  margin: 2% 0 2%;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;
const FlexRow2 = styled.div`
  width: 100%;
  margin: 10% 0 ;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 1em 0;
`;
const Text = styled.div`
  margin: 2em 0 2em 0 ;
`;
const TogglePassword = styled.button`
  width: 2rem;
  height: inherit;
  position: relative;
  right: 0;
  border-left: 0.1em solid var(--color-secondary) !important;
  background-color: transparent;
  margin-right: 1em;
  border-top: none;
  border-right: none;
  border-bottom: none;
`;