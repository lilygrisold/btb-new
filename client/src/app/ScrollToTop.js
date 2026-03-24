import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => { // Set timeout to allow map to load
      window.scrollTo({
        top: 0,
        left: 100,
        behavior: "smooth" // change to "smooth" if you want a transition
      });
  }, 1000); // Scroll after 1 seconds
  }, [pathname]);

  return null;
};

export default ScrollToTop;
