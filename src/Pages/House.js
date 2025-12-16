import { useEffect, useState } from "react";
import api from "../api";
import "./House.css";

const ITEMS_PER_PAGE = 20;
const STATUS_OPTIONS = ["available", "booked", "sold"];

export default function Houses() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // -----------------------------
  // Fetch projects
  // -----------------------------
 useEffect(() => {
  api.get("/")
    .then((res) => {
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setProjects(list);
    })
    .catch(() => {
      setProjects([]);
      alert("Backend error fetching projects");
    });
}, []);


  // -----------------------------
  // Fetch houses
  // -----------------------------
  const handleChange = async (id) => {
    setSelectedId(id);
    setCurrentPage(1);

    if (!id) {
      setHouses([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/houses/${id}`);
      setHouses(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      setHouses([]);
      alert("Failed to load houses");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Update house status
  // -----------------------------
  const updateStatus = async (houseNumber, status) => {
    try {
      await api.patch(`/houses/${selectedId}/${houseNumber}`, { status });

      // update UI without refetch
      setHouses((prev) =>
        prev.map((h) =>
          h.houseNumber === houseNumber ? { ...h, status } : h
        )
      );
    } catch {
      alert("Failed to update status");
    }
  };

  // -----------------------------
  // Pagination logic
  // -----------------------------
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentHouses = houses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(houses.length / ITEMS_PER_PAGE);

  const paginate = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div className="house-container">
      <h1>Houses</h1>

      {/* Project dropdown */}
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

      {currentHouses.length > 0 && (
        <>
          <table className="house-table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Project Name</th>
                <th>House No</th>
                <th>Project Type</th>
                <th>Square Feet</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentHouses.map((h, i) => (
                <tr key={`${h.houseNumber}-${i}`}>
                  <td data-label="S. No.">{indexOfFirstItem + i + 1}</td>
                  <td data-label="Project Name">{h.projectName}</td>
                  <td data-label="House No">{h.houseNumber}</td>
                  <td data-label="Project Type">{h.projectType}</td>
                  <td data-label="Square Feet">{h.squareFeet}</td>
                  <td data-label="Price">₹{Number(h.price || 0).toLocaleString()}</td>
                  <td data-label="Status" className={`status ${h.status}`}>
                    {h.status}
                  </td>
                  <td data-label="Action">
                    <select
                      value={h.status}
                      onChange={(e) =>
                        updateStatus(h.houseNumber, e.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                Prev
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!loading && houses.length === 0 && selectedId && (
        <p className="no-data">No houses found</p>
      )}

      {!loading && !selectedId && (
        <p className="no-data">Please select a project</p>
      )}
    </div>
  );
}
