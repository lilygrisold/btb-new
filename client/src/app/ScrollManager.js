import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollManager = () =>{
    const location = useLocation();
      useEffect(() => {
        if (location.pathname === '/') {
          document.body.style.overflow = 'hidden';
          document.body.style.height = '100vh';
        } else {
          document.body.style.overflow = 'auto';
          document.body.style.height = 'auto'
        }
        return()=>{
          document.body.style.overflow = 'auto';
          document.body.style.height = 'auto';
        }
      },[location.pathname]);

}

export default ScrollManager