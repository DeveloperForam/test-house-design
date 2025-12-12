import { useState } from "react";
import Sidebar from "./components/sidebar";
import Navbar from "./components/navbar";
import Projects from "./Pages/Projects";
import Dashboard from "./Pages/Dashboard";
import Houses from "./Pages/House";
import "./styles.css";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <Projects />;
      case "houses":
        return <Houses />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <Sidebar setPage={setPage} />
      <div className="main">
        <Navbar />
        {renderPage()}
      </div>
    </div>
  );
}
