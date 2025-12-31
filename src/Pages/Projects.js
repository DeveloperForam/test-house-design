import { useEffect, useState } from "react";
import api from "../api";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ projectType: "flat" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);

  /* ================= FETCH ================= */
  const fetchProjects = async () => {
    const res = await api.get("/lily/");

    const normalized = res.data.data.map((p) => ({
      ...p,
      projectName: p.projectName || p.project_name,
      projectType: (p.projectType || p.project_type || "").toLowerCase().trim(),
      totalWings: p.totalWings || p.total_wings,
      totalFloors: p.totalFloors || p.total_floors,
      perFloorHouse: p.perFloorHouse || p.per_floor_house,
      totalPlots: p.totalPlots || p.total_plots,
      location: p.location || "-"
    }));

    setProjects(normalized);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await api.put(`/lily/${editingId}`, form);
      setEditingId(null);
    } else {
      await api.post("/lily/", form);
    }

    fetchProjects();
    alert("Success!");
    setForm({ projectType: "flat" });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await api.delete(`/lily/${id}`);
      fetchProjects();
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm(project);
    setShowForm(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="projects-page">
      {/* ADD BUTTON */}
      <button
        className="btn-submit"
        style={{ width: "200px", margin: "20px" }}
        onClick={() => {
          setForm({ projectType: "flat" });
          setEditingId(null);
          setShowForm(true);
        }}
      >
        + Add New Project
      </button>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal">
          <div className="modal-content" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>
            <hr />

            <form onSubmit={handleSubmit}>
              <label>Project Name</label>
              <input
                required
                value={form.projectName || ""}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              />

              <label>Project Type</label>
              <select
                value={form.projectType}
                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
              >
                <option value="flat">Flat</option>
                <option value="banglow">Banglow</option>
                <option value="row-house">Row House</option>
              </select>

              <label>Location</label>
              <input
                required
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              {/* FLAT FIELDS */}
              {form.projectType === "flat" && (
                <>
                  <label>Total Wings</label>
                  <input
                    type="number"
                    value={form.totalWings || ""}
                    onChange={(e) =>
                      setForm({ ...form, totalWings: Number(e.target.value) })
                    }
                  />

                  <label>Total Floors</label>
                  <input
                    type="number"
                    value={form.totalFloors || ""}
                    onChange={(e) =>
                      setForm({ ...form, totalFloors: Number(e.target.value) })
                    }
                  />

                  <label>Per Floor Houses</label>
                  <input
                    type="number"
                    value={form.perFloorHouse || ""}
                    onChange={(e) =>
                      setForm({ ...form, perFloorHouse: Number(e.target.value) })
                    }
                  />
                </>
              )}

              {/* BUNGALOW / ROW HOUSE */}
              {(form.projectType === "banglow" ||
                form.projectType === "row-house") && (
                <>
                  <label>Total Plots</label>
                  <input
                    type="number"
                    value={form.totalPlots || ""}
                    onChange={(e) =>
                      setForm({ ...form, totalPlots: Number(e.target.value) })
                    }
                  />
                </>
              )}

              <div className="modal-actions">
                <button className="btn-submit" type="submit">
                  {editingId ? "Update" : "Submit"}
                </button>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Project</th>
              <th>Type</th>
              <th>Location</th>
              {/* <th>Plots</th> */}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.projectName}</td>
                <td>{p.projectType}</td>
                <td>{p.location}</td>

                {/* <td>
                  {p.projectType === "banglow" || p.projectType === "row-house"
                    ? p.totalPlots
                    : "-"}
                </td> */}

                <td className="action-cell">
                  {/* <button className="action-btn view" onClick={() => setShowDetails(p)}>
                    View
                  </button> */}
                  <button className="action-btn edit" onClick={() => handleEdit(p)}>
                    Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {showDetails && (
        <div className="modal">
          <div className="modal-content">
            <h2>{showDetails.projectName} - Details</h2>
            <hr />
            <p><b>Project Type:</b> {showDetails.projectType}</p>
            <p><b>Location:</b> {showDetails.location}</p>

            {(showDetails.projectType === "banglow" ||
              showDetails.projectType === "row-house") && (
              <p><b>Total Plots:</b> {showDetails.totalPlots}</p>
            )}

            <button className="btn-close" onClick={() => setShowDetails(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
