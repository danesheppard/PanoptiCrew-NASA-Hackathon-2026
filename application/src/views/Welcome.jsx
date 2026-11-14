export default function Welcome({ onStart }) {
  return (
    <main className="welcome">
      <h1>PanoptiCrew</h1>
      <p className="lede">
        Explore environmental events through satellite evidence: where they happened, how
        the landscape changed, and what the data can and cannot tell us.
      </p>
      <section>
        <h2>The Team</h2>
        <p className="sample">Placeholder: team members and roles.</p>
      </section>
      <section>
        <h2>About This Prototype</h2>
        <p>
          Built for the NASA Space Apps Challenge 2026. Case studies are for understanding
          events, not for response recommendations. All content shown is sample data.
        </p>
      </section>
      <button onClick={onStart}>Explore the Map</button>
    </main>
  );
}
