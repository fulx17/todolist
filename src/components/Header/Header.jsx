import "./Header.css";
import Navigator from "../Navigator/Navigator.jsx"
import Logo from "../Logo/Logo.jsx"
import Button from "../Button/Button.jsx"

function Header() {
    return (
        <div className="header">
            <div className="header-left">
                <Logo />
            </div>
            <div className="header-right">
                <Navigator/>
                <div className="auth-buttons">
                    <Button text="Sign in"/>
                    <Button text="Sign up"/>
                </div>
            </div>
        </div>
    );
}

export default Header