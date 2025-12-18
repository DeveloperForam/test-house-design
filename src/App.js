import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Navbar from "./components/navbar";
import Projects from "./Pages/Projects";
import Dashboard from "./Pages/Dashboard";
import Houses from "./Pages/House";
import Services from "./Pages/Services";
import "./styles.css";

export default function App() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/houses" element={<Houses />} />
            <Route path="/services" element={<Services />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
