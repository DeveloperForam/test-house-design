import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Projects from "./Pages/Projects";
import "./styles.css";

export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar />
        <Projects />
      </div>
    </div>
  );
}
