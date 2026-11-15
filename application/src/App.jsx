import { useState } from "react";
import LandingPage from "./views/LandingPage/LandingPage.jsx";
import GlobalMap from "./views/GlobalMap.jsx";
import CaseStudy from "./views/CaseStudy.jsx";

/**
 * Main application component managing
 * the main views and navigation between them.
 *
 * @returns {JSX.Element} The main application component
 */
export default function App() {
  const [view, setView] = useState("landing");
  const [study, setStudy] = useState(null);

  // Prevent the default context menu from appearing on right-clicks
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  if (view === "landing") return <LandingPage onStart={() => setView("map")} />;

  if (view === "case" && study)
    return (
      <CaseStudy
        study={study}
        onBack={() => setView("map")}
        onHome={() => setView("landing")}
      />
    );

  return (
    <GlobalMap
      selected={study}
      onSelect={setStudy}
      onLaunch={() => setView("case")}
      onHome={() => setView("landing")}
    />
  );
}
