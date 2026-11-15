import "./Header.css";

export default function Header({ onHome }) {
  return (
    <header className="header">
      <button className="header-brand" type="button" onClick={onHome}>
        PanoptiCrew
      </button>
      <span className="header-title">NASA Space Apps Challenge 2026</span>
    </header>
  );
}
