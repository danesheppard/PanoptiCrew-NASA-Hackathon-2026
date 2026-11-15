import { team } from "../../data/team.js";
import Header from "../Header/Header.jsx";
import RadarScope from "./RadarScope.jsx";
import "./LandingPage.css";

/**
 * Steps for exploring a case study on the landing page.
 */
const steps = [
  {
    number: "01",
    title: "Pick an event",
    description: "Choose a place and environmental event to explore.",
  },
  {
    number: "02",
    title: "Step through time",
    description: "See the landscape before, during, and after.",
  },
  {
    number: "03",
    title: "Read the evidence",
    description: "Explore what the satellite record can tell us.",
  },
];

/**
 * Landing page component for the PanoptiCrew project.
 * Displays the hero section, steps for exploring case studies, and team information.
 *
 * @component
 * @param {Function} onStart - Callback function to start exploring the map.
 *
 * @returns {JSX.Element} The rendered landing page component.
 */
export default function LandingPage({ onStart }) {
  return (
    <main className="landing-page">
      <div className="landing-first-screen">
        <Header
          onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />

        {/* Hero section with radar scope and introductory copy */}
        <section
          className="landing-hero"
          id="home"
          aria-labelledby="landing-title"
        >
          <div className="landing-copy">
            <p className="landing-eyebrow">THE PANOPTIC EXPLORER</p>
            <h1 id="landing-title">
              See what changed.
              <br />
              <span>Even through the clouds.</span>
            </h1>
            <p className="landing-tagline">
              Explore examples of a changing planet through satellite evidence:
              where they happened, how the landscape changed, and what the data
              can and cannot tell us.
            </p>
            <button className="landing-cta" onClick={onStart}>
              Explore the map <span aria-hidden="true">→</span>
            </button>
          </div>
          <RadarScope />
        </section>

        {/* Steps section explaining how to explore a case study */}
        <section
          className="landing-steps"
          aria-label="How to explore a case study"
        >
          {steps.map((step) => (
            <article className="landing-step" key={step.number}>
              <span className="landing-step-number">{step.number}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Team section introducing the project team */}
      <section className="landing-team" aria-labelledby="team-title">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">THE TEAM</p>
          <h2 id="team-title">Meet PanoptiCrew</h2>
        </div>
        <div className="landing-team-grid">
          {team.map((member) => (
            <article className="landing-team-card" key={member.name}>
              <span className="landing-initials" aria-hidden="true">
                {member.initials}
              </span>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer with disclaimer and event info */}
      <footer className="landing-footer">
        Built for the NASA Space Apps Challenge 2026. Case studies are for
        understanding events, not for response recommendations. All content
        shown is sample data.
      </footer>
    </main>
  );
}
