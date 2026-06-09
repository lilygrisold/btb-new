//**************************************************************** */
// Imports
//**************************************************************** */

// React routing dependencies
import { Route, Routes, BrowserRouter } from "react-router-dom";
import styled from 'styled-components';

// Local components
import GlobalStyles from "../GlobalStyles";
import Homepage from "../components/Homepage";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import Header from '../components/Header';
import Profile from "../components/authentication/Profile/Profile";
import Error from "../components/Error";
import ScrollToTop from "./ScrollToTop";
import ScrollManager from "./ScrollManager";

// Mapbox dependencies
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN as string;

const App = () => {
  
  return (
          <>
            <Wrapper>

              <GlobalStyles />

              <BrowserRouter>
                <ScrollManager />
                <ScrollToTop />
                <Header/>

                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Error />} />
                </Routes>
                
              </BrowserRouter>

            </Wrapper>
          </>
  );
}

export default App;

const Wrapper = styled.div`
    
`;