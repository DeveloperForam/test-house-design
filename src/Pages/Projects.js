import { useEffect, useState } from "react";
import api from "../api";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);

  const [images, setImages] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [amenitiesInput, setAmenitiesInput] = useState("");

  const [form, setForm] = useState({
    projectName: "",
    projectType: "flat",
    location: "",
    totalWings: "",
    totalFloors: "",
    perFloorHouse: "",
    totalPlots: "",
    geoLocation: { lat: "", lng: "" },
  });

  /* ================= FETCH PROJECTS ================= */
  const fetchProjects = async () => {
    try {
      const res = await api.get("/lily/");
      setProjects(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Basic fields
    formData.append("projectName", form.projectName);
    formData.append("projectType", form.projectType);
    formData.append("location", form.location);

    if (form.projectType === "flat") {
      formData.append("totalWings", form.totalWings);
      formData.append("totalFloors", form.totalFloors);
      formData.append("perFloorHouse", form.perFloorHouse);
    } else {
      formData.append("totalPlots", form.totalPlots);
    }

    // Geo-location
    if (form.geoLocation?.lat && form.geoLocation?.lng) {
      formData.append("geoLocation[type]", "Point");
      formData.append("geoLocation[coordinates][0]", form.geoLocation.lng);
      formData.append("geoLocation[coordinates][1]", form.geoLocation.lat);
    }

    // Amenities
    if (amenitiesInput) {
      amenitiesInput
        .split(",")
        .map((a) => a.trim())
        .forEach((a) => formData.append("amenities[]", a));
    }

    // Images
    images.forEach((img) => formData.append("images", img));
    floorPlans.forEach((fp) => formData.append("floorPlans", fp));

    try {
      if (editingId) {
        await api.put(`/lily/${editingId}`, formData);
      } else {
        await api.post("/lily/", formData);
      }
      resetForm();
      fetchProjects();
      alert("Success!");
    } catch (err) {
      console.error("Failed to save project", err);
      alert("Failed to save project");
    }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setForm({
      projectName: "",
      projectType: "flat",
      location: "",
      totalWings: "",
      totalFloors: "",
      perFloorHouse: "",
      totalPlots: "",
      geoLocation: { lat: "", lng: "" },
    });
    setAmenitiesInput("");
    setImages([]);
    setFloorPlans([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...p,
      geoLocation: p.geoLocation?.coordinates
        ? { lat: p.geoLocation.coordinates[1], lng: p.geoLocation.coordinates[0] }
        : { lat: "", lng: "" },
    });
    setAmenitiesInput((p.amenities || []).join(", "));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      await api.delete(`/lily/${id}`);
      fetchProjects();
    }
  };

  /* ================= UI ================= */
  return (
    <div className="projects-page">
      <button className="btn-submit" onClick={() => setShowForm(true)}>
        + Add New Project
      </button>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingId ? "Edit Project" : "Add Project"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Project Name</label>
              <input
                required
                value={form.projectName}
                onChange={(e) =>
                  setForm({ ...form, projectName: e.target.value })
                }
              />

              <label>Project Type</label>
              <select
                value={form.projectType}
                onChange={(e) =>
                  setForm({ ...form, projectType: e.target.value })
                }
              >
                <option value="flat">Flat</option>
                <option value="banglow">Banglow</option>
                <option value="row-house">Row House</option>
              </select>

              <label>Location</label>
              <input
                required
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />

              <label>Latitude</label>
              <input
                type="number"
                step="any"
                value={form.geoLocation.lat}
                onChange={(e) =>
                  setForm({
                    ...form,
                    geoLocation: { ...form.geoLocation, lat: e.target.value },
                  })
                }
              />
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                value={form.geoLocation.lng}
                onChange={(e) =>
                  setForm({
                    ...form,
                    geoLocation: { ...form.geoLocation, lng: e.target.value },
                  })
                }
              />

              {form.projectType === "flat" ? (
                <>
                  <label>Total Wings</label>
                  <input
                    type="number"
                    value={form.totalWings}
                    onChange={(e) =>
                      setForm({ ...form, totalWings: e.target.value })
                    }
                  />
                  <label>Total Floors</label>
                  <input
                    type="number"
                    value={form.totalFloors}
                    onChange={(e) =>
                      setForm({ ...form, totalFloors: e.target.value })
                    }
                  />
                  <label>Per Floor Houses</label>
                  <input
                    type="number"
                    value={form.perFloorHouse}
                    onChange={(e) =>
                      setForm({ ...form, perFloorHouse: e.target.value })
                    }
                  />
                </>
              ) : (
                <>
                  <label>Total Plots</label>
                  <input
                    type="number"
                    value={form.totalPlots}
                    onChange={(e) =>
                      setForm({ ...form, totalPlots: e.target.value })
                    }
                  />
                </>
              )}

              <label>Amenities</label>
              <input
                placeholder="Parking, Gym, Garden"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
              />

              <label>Project Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages([...e.target.files])}
              />

              <label>Floor Plans (max 3)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setFloorPlans([...e.target.files].slice(0, 3))
                }
              />

              <div className="modal-actions">
                <button className="btn-submit" type="submit">
                  {editingId ? "Update" : "Create"}
                </button>
                <button type="button" className="btn-close" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Geo (lat,lng)</th>
            <th>Wings/Floors/Plots</th>
            <th>Amenities</th>
            <th>Images / Floor Plans</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr key={p.id}>
              <td>{i + 1}</td>
              <td>{p.projectName || "-"}</td>
              <td>{p.projectType || "-"}</td>
              <td>{p.location || "-"}</td>
              <td>
                {p.geoLocation?.coordinates
                  ? `${p.geoLocation.coordinates[1]}, ${p.geoLocation.coordinates[0]}`
                  : "-"}
              </td>
              <td>
                {p.projectType === "flat"
                  ? `${p.totalWings || 0} Wings / ${p.totalFloors || 0} Floors / ${
                      p.perFloorHouse || 0
                    } per Floor`
                  : p.totalPlots || 0}
              </td>
              <td>{(p.amenities || []).join(", ") || "-"}</td>
<td>
  {(p.images || []).map((img, idx) => {
    const baseUrl = "http://localhost:5000";
    
    // Get the URL from the image object
    let imageUrl = "";
    
    if (img && typeof img === "object" && img.url) {
      // The backend returns { url: "/uploads/filename.jpg" }
      // But the file is actually at /uploads/projects/filename.jpg
      // So we need to check and fix the URL
      
      const filename = img.url.split("/").pop();
      imageUrl = `${baseUrl}/uploads/projects/${filename}`;
    } else if (typeof img === "string") {
      const filename = img.split("/").pop();
      imageUrl = `${baseUrl}/uploads/projects/${filename}`;
    }

    console.log("IMAGE URL:", imageUrl);

    return (
      <img
        key={idx}
        src={imageUrl}
        alt="project"
        style={{
          width: "60px",
          height: "60px",
          objectFit: "cover",
          marginRight: "6px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
        onError={(e) => {
          console.error("Failed to load image:", imageUrl);
          e.target.style.display = 'none';
          // Try alternative URL
          if (img && img.url) {
            e.target.src = `${baseUrl}${img.url}`;
            e.target.style.display = 'block';
          }
        }}
      />
    );
  })}
</td>


              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
