//**************************************************************** */
// Imports
//**************************************************************** */

// React routing dependencies
import { Route, Routes, BrowserRouter } from "react-router-dom";
import styled from 'styled-components';

// Local components
import GlobalStyles from "../../src/GlobalStyles";
import Homepage from "../components/Homepage";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import Header from '../components/Header';
import Profile from "../components/authentication/Profile/Profile";
import Error from "../components/Error";
import ScrollToTop from "./ScrollToTop";

// required by mabox
import mapboxgl from 'mapbox-gl';
// import mapboxgl from 'mapbox-gl/dist/mapbox-gl.css';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const App = () => {
  return (
<>

  <Wrapper>
    <GlobalStyles />
    <BrowserRouter>
      <ScrollToTop />
      <Header/>
      <Routes>
        <Route exact path="/" element={<Homepage />} />
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