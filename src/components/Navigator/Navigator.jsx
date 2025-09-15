import { Link } from "react-router-dom";
import "./Navigator.css";

export default function Nav() {
  return (
    <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/About">About</Link>
        <Link to="/DailySchedule">Smart Plan</Link>
        <Link to="/Custom">Custom</Link>
        <Link to="/Dashboard">Dashboard</Link>
        <Link to="/TaskAllert">Task Allert</Link>
    </nav>
  );
}
