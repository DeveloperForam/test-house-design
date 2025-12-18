import { NavLink } from "react-router-dom";
import "./sidebar.css";
import logo from "../assets/logo.png"; // adjust path if needed

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="Project Management" />
        {/* <span>Project Management</span> */}
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/houses">Houses</NavLink>
        <NavLink to="/services">Services</NavLink>
      </nav>
    </div>
  );
}
