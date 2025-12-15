import { useEffect, useState } from "react";
import api from "../api";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ projectType: "flat" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);   // <-- NEW
  const [showDetails, setShowDetails] = useState(null);

  const fetchProjects = async () => {
    const res = await api.get("/");
    setProjects(res.data.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await api.put(`/${editingId}`, form);
      setEditingId(null);
    } else {
      await api.post("/", form);
    }

    fetchProjects();
    alert("Success!");
    setForm({ projectType: "flat" });
    setShowForm(false);   // close form after submit
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await api.delete(`/${id}`);
      fetchProjects();
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm(project);
    setShowForm(true);  // open form
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      {/* --- ADD NEW PROJECT BUTTON --- */}
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

      {/* --- FORM MODAL START --- */}
      {showForm && (
        <div className="modal">
          <div className="modal-content" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>
            <hr />

            <form onSubmit={handleSubmit}>
              <input
                placeholder="Project Name"
                required
                value={form.projectName || ""}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              />

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

              <input
                placeholder="Location"
                required
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              <input
                type="number"
                placeholder="Square Feet"
                value={form.squareFeet || ""}
                onChange={(e) =>
                  setForm({ ...form, squareFeet: Number(e.target.value) })
                }
              />

              <input
                type="number"
                placeholder="Per House Cost"
                required
                value={form.perHouseCost || ""}
                onChange={(e) =>
                  setForm({ ...form, perHouseCost: Number(e.target.value) })
                }
              />

              {/* FLAT FIELDS */}
              {form.projectType === "flat" && (
                <>
                  <input
                    type="number"
                    placeholder="Total Wings"
                    value={form.totalWings || ""}
                    onChange={(e) =>
                      setForm({ ...form, totalWings: Number(e.target.value) })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Total Floors"
                    value={form.totalFloors || ""}
                    onChange={(e) =>
                      setForm({ ...form, totalFloors: Number(e.target.value) })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Per Floor House"
                    value={form.perFloorHouse || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        perFloorHouse: Number(e.target.value),
                      })
                    }
                  />
                </>
              )}

              {/* FOR BUNGALOW / ROW HOUSE */}
              {(form.projectType === "banglow" ||
                form.projectType === "row-house") && (
                <input
                  type="number"
                  placeholder="Total Plots"
                  value={form.totalPlots || ""}
                  onChange={(e) =>
                    setForm({ ...form, totalPlots: Number(e.target.value) })
                  }
                />
              )}

              <button className="btn-submit">
                {editingId ? "Update" : "Submit"}
              </button>
            </form>

            <button
              className="btn-close"
              style={{ marginTop: "10px" }}
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* --- FORM MODAL END --- */}

      {/* --- PROJECT TABLE --- */}
      <div className="table-container">
        {/* <h3>Project List</h3> */}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Type</th>
              <th>Location</th>
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
                <td>
                  <button onClick={() => setShowDetails(p)}>👁 View</button>
                  <button onClick={() => handleEdit(p)}>✏ Edit</button>
                  <button onClick={() => handleDelete(p.id)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VIEW MODAL --- */}
      {showDetails && (
        <div className="modal">
          <div className="modal-content">
            <h2>📌 {showDetails.projectName} - Details</h2>
            <hr />

            <p><b>Project Type:</b> {showDetails.projectType}</p>
            <p><b>Location:</b> {showDetails.location}</p>
            <p><b>Square Feet:</b> {showDetails.squareFeet || "N/A"} sq.ft</p>
            <p><b>Per House Cost:</b> ₹{showDetails.perHouseCost}</p>

            {showDetails.projectType === "flat" && (
              <>
                <p><b>Total Wings:</b> {showDetails.totalWings}</p>
                <p><b>Total Floors:</b> {showDetails.totalFloors}</p>
                <p><b>Per Floor Houses:</b> {showDetails.perFloorHouse}</p>
                <p><b>Total Houses:</b> {showDetails.totalHouse}</p>
              </>
            )}

            {(showDetails.projectType === "banglow" ||
              showDetails.projectType === "row-house") && (
              <p><b>Total Plots:</b> {showDetails.totalPlots}</p>
            )}

            <hr />
            <p style={{ fontSize: "18px" }}>
              {/* <b>Total Cost:</b> ₹{showDetails.totalHouseCost} */}
            </p>

            <button className="btn-close" onClick={() => setShowDetails(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
