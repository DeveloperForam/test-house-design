import { useEffect, useState } from "react";
import api from "../api";
import "./House.css";

export default function Houses() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch projects
  useEffect(() => {
    api.get("/")
      .then((res) => setProjects(res.data.data))
      .catch(() => alert("Backend error"));
  }, []);

  const handleChange = async (id) => {
    setSelectedId(id);
    if (!id) {
      setHouses([]);
      return;
    }

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

      <select
        className="project-select"
        value={selectedId}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">Select Project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.projectName}
          </option>
        ))}
      </select>

      {loading && <p className="loading">Loading...</p>}

      {houses.length > 0 && (
        <table className="house-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>House No</th>
              {/* <th>Project ID</th> */}
              <th>Project Type</th>
              <th>Square Feet</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((h, index) => (
              <tr key={index}>
                <td>{h.projectName}</td>
                <td>{h.houseNumber}</td>
                {/* <td>{h.projectId}</td> */}
                <td>{h.projectType}</td>
                <td>{h.squareFeet}</td>
                <td>₹{h.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && houses.length === 0 && selectedId && (
        <p className="no-data">No houses found</p>
      )}
    </div>
  );
}
