import { useEffect, useState } from "react";
import axios from "axios";
import "./House.css";

const BASE_URL = "http://localhost:5000/api/lily/houses/7";

export default function Houses() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all projects for dropdown
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/projects`);
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Fetch details when selecting a project
  const fetchProjectDetails = async (id) => {
    if (!id) {
      setProjectDetails(null);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/houses/${id}`);

      // backend returns: { projectDetails: {...} }
      setProjectDetails(res.data.projectDetails);
    } catch (error) {
      console.error("Error fetching details:", error);
      setProjectDetails(null);
    }

    setLoading(false);
  };

  // Load project list when page opens
  useEffect(() => {
    fetchProjects();
  }, []);

  // Load details when dropdown changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  return (
    <div className="house-container">
      <h1 className="title">Houses</h1>

      <div className="dropdown-container">
        <label>Select Project:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="">-- Select Project --</option>

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.projectName}
            </option>
          ))}
        </select>
      </div>

      <div className="details-box">
        {loading ? (
          <p className="loading">Loading details...</p>
        ) : projectDetails ? (
          <>
            <h2 className="project-title">{projectDetails.projectName}</h2>

            <p><strong>Type:</strong> {projectDetails.projectType}</p>
            <p><strong>Location:</strong> {projectDetails.location}</p>
            <p><strong>Wings / Plots:</strong> {projectDetails.wingsOrPlots}</p>
            <p><strong>Per House Cost:</strong> ₹{projectDetails.perHouseCost}</p>
            <p><strong>Total House Cost:</strong> ₹{projectDetails.totalHouseCost}</p>

            <p>
              <strong>House Numbers:</strong>{" "}
              {projectDetails.houseNumbers?.length > 0
                ? projectDetails.houseNumbers.join(", ")
                : "No houses"}
            </p>
          </>
        ) : (
          <p>No details found.</p>
        )}
      </div>
    </div>
  );
}
