import { useEffect, useState } from "react";
import api from "../api";
import "./House.css";

export default function Houses() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch projects
  useEffect(() => {
    api.get("/")
      .then((res) => setProjects(res.data.data))
      .catch(() => alert("Backend error"));
  }, []);

  const handleChange = async (id) => {
    setSelectedId(id);
    if (!id) return;

    try {
      setLoading(true);
      const res = await api.get(`/${id}/houses`);
      setHouses(res.data.data);
    } catch {
      alert("Failed to load houses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="house-container">
      <h1>Houses</h1>

      <select value={selectedId} onChange={(e) => handleChange(e.target.value)}>
        <option value="">Select Project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.projectName}
          </option>
        ))}
      </select>

      {loading && <p>Loading...</p>}

      <ul>
        {houses.map((h) => (
          <li key={h.houseNumber}>
            {h.houseNumber} – ₹{h.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
