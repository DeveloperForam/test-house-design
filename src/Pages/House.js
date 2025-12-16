import { useEffect, useState } from "react";
import api from "../api"; 
import "./House.css";

const ITEMS_PER_PAGE = 20;

export default function Houses() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api.get("/")
      .then((res) => setProjects(res.data.data))
      .catch(() => alert("Backend error fetching projects"));
  }, []);

  const handleChange = async (id) => {
    setSelectedId(id);
    setCurrentPage(1);

    if (!id) {
      setHouses([]);
      return;
    }

    try {
      setLoading(true);
      // Fetches ALL houses for the selected project
      const res = await api.get(`/${id}/houses`);
      setHouses(res.data.data);
    } catch {
      alert("Failed to load houses");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentHouses = houses.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(houses.length / ITEMS_PER_PAGE);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);

        window.scrollTo(0, 0);
    }

  };
  
  const PaginationControls = () => {
    if (totalPages <= 1) return null; 

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="pagination-nav">
        <ul className="pagination-list">
          <li 
            className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          >
            <a className="page-link" href="#!">Previous</a>
          </li>

          {pageNumbers.map(number => (
            (number === 1 || number === totalPages || (number >= currentPage - 2 && number <= currentPage + 2)) && (
              <li 
                key={number} 
                className={`page-item ${currentPage === number ? 'active' : ''}`}
                onClick={() => paginate(number)}
              >
                <a className="page-link" href="#!">{number}</a>
              </li>
            )
          ))}

          <li 
            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
          >
            <a className="page-link" href="#!">Next</a>
          </li>
        </ul>
      </nav>
    );
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
              </tr>
            </thead>
            <tbody>
              {currentHouses.map((h, i) => {
                const sNo = indexOfFirstItem + i + 1;

                return (
                  <tr key={h.id || i}> 
                    <td>{sNo}</td> 
                    <td>{h.projectName}</td>
                    <td>{h.houseNumber}</td>
                    <td>{h.projectType}</td>
                    <td>{h.squareFeet}</td>
                    <td>₹{h.price.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <PaginationControls />
          
          <p className="pagination-status">
            Showing houses {indexOfFirstItem + 1} to {indexOfLastItem > houses.length ? houses.length : indexOfLastItem} of {houses.length} total.
          </p>
        </>
      )}

      {!loading && houses.length === 0 && selectedId && (
        <p className="no-data">No houses found for this project.</p>
      )}
      {!loading && houses.length === 0 && !selectedId && (
        <p className="no-data">Please select a project to view houses.</p>
      )}
    </div>
  );
}