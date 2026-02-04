import { useEffect } from "react";
import Scene from "./components/Scene/Scene";
import Footer from "./components/Footer/Footer";

const JOIN_FORM_URL = "https://github.com/your-username/cs-webring/pulls";

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Scene />
      <Footer joinUrl={JOIN_FORM_URL} />
    </>
  );
}
