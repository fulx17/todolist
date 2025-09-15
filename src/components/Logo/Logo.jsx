import logo from "../../assets/logo.png";
import "./Logo.css"
import { Link } from "react-router-dom";

function Logo() {
    return (
        <Link to="/" className="logo-container">
            <img src={logo} alt="Logo" className="logo-img"></img>
            <p>TODOAPP</p>
        </Link>
    );
}

export default Logo