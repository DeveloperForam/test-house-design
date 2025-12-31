import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./House.css";

export default function Bookings() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  /* ================= STATES ================= */
  const [projects, setProjects] = useState([]);
  const [houses, setHouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    projectId: "",
    houseNumber: "",
    customerName: "",
    mobileNo: "",
    paymentType: "cash", // cash | bank
    totalSqFeet: "",
    pricePerSqFeet: "",
    totalAmount: "",
    advancePayment: "",
    pendingAmount: "",
    bookingDate: today,
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadProjects();
    loadBookings();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.get("/lily");
      setProjects(res.data.data);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data.data);
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  /* ================= PROJECT MAP ================= */
  const projectMap = {};
  projects.forEach((p) => (projectMap[p.id] = p.projectName));

  /* ================= PROJECT CHANGE ================= */
  const handleProjectChange = async (pid) => {
    setForm({
      ...form,
      projectId: pid,
      houseNumber: "",
      totalSqFeet: "",
      pricePerSqFeet: "",
      totalAmount: "",
      advancePayment: "",
      pendingAmount: "",
    });

    try {
      const res = await api.get(`/lily/houses/${pid}`);
      setHouses(res.data.data.filter((h) => h.status === "available"));
    } catch {
      setHouses([]);
    }
  };

  /* ================= HOUSE CHANGE ================= */
  const handleHouseChange = (houseNo) => {
    const house = houses.find((h) => h.houseNumber === houseNo);
    const totalSqFeet = house?.totalSqFeet ;
    const pricePerSqFeet = house?.pricePerSqFeet ;

    setForm((prev) => ({
      ...prev,
      houseNumber: houseNo,
      totalSqFeet,
      pricePerSqFeet,
      totalAmount: totalSqFeet * pricePerSqFeet,
      pendingAmount: totalSqFeet * pricePerSqFeet - Number(prev.advancePayment ),
    }));
  };

  /* ================= SUBMIT BOOKING ================= */
  const submitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/bookings/create", {
        projectId: Number(form.projectId),
        houseNumber: form.houseNumber,
        customerName: form.customerName,
        mobileNo: form.mobileNo,
        paymentType: form.paymentType,
        totalSqFeet: Number(form.totalSqFeet),
        pricePerSqFeet: Number(form.pricePerSqFeet),
        totalAmount: Number(form.totalAmount),
        advancePayment: Number(form.advancePayment),
        pendingAmount: Number(form.pendingAmount),
      });

      alert("✅ Booking Created");

      setForm({
        projectId: "",
        houseNumber: "",
        customerName: "",
        mobileNo: "",
        paymentType: "cash",
        totalSqFeet: "",
        pricePerSqFeet: "",
        totalAmount: "",
        advancePayment: "",
        pendingAmount: "",
        bookingDate: today,
      });

      setHouses([]);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Booking Failed");
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN").format(value);
  };

  /* ================= UI ================= */
  return (
    <div className="booking-container">
      <h2 className="page-title">Create Booking</h2>

      <form onSubmit={submitBooking} className="booking-form">
        <label>Select Project:</label>
        <select
          required
          value={form.projectId}
          onChange={(e) => handleProjectChange(e.target.value)}
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.projectName}
            </option>
          ))}
        </select>

        <label>Select House:</label>
        <select
          required
          value={form.houseNumber}
          onChange={(e) => handleHouseChange(e.target.value)}
        >
          <option value="">Select House</option>
          {houses.map((h) => (
            <option key={h.houseNumber} value={h.houseNumber}>
              {h.houseNumber}
            </option>
          ))}
        </select>

        <label>Customer Name:</label>
        <input
          required
          placeholder="Customer Name"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
        />

        <label>Mobile No.:</label>
        <input
          required
          type="tel"
          placeholder="Mobile Number"
          maxLength={10}
          value={form.mobileNo}
          onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
        />

        <label>Payment Type:</label>
        <select
          value={form.paymentType}
          onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
        >
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
        </select>

        <label>Total Sq.Ft:</label>
        <input readOnly value={form.totalSqFeet} />

        <label>Price per Sq.Ft:</label>
        <input readOnly value={form.pricePerSqFeet} />

        <label>Total Amount:</label>
        <input readOnly value={form.totalAmount} />

        <label>Booking Amount</label>
        <input
          required
          placeholder="Booking Amount"
          value={form.advancePayment}
          onChange={(e) => {
            const adv = Number(e.target.value);
            setForm((prev) => ({
              ...prev,
              advancePayment: adv,
              pendingAmount: Number(prev.totalAmount) - adv,
            }));
          }}
        />

        <label>Pending Amount:</label>
        <input readOnly value={form.pendingAmount} />

        <button disabled={loading}>
          {loading ? "Booking..." : "Book House"}
        </button>
      </form>

      <h2 className="page-title">Booking List</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>House</th>
            <th>Customer</th>
            <th>Payment</th>
            <th>Total Sq.Ft</th>
            <th>Price / Sq.Ft</th>
            <th>Total Amount</th>
            <th>Booking Amount</th>
            <th>Pending</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.bookingId}</td>
              <td>{projectMap[b.projectId]}</td>
              <td>{b.houseNumber}</td>
              <td>{b.customerName}</td>
              <td className={`badge ${b.paymentType}`}>
                {b.paymentType.toUpperCase()}
              </td>
              <td>{b.totalSqFeet}</td>
              <td>₹{b.pricePerSqFeet}</td>
              <td>₹{b.totalAmount}</td>
              <td>₹{b.advancePayment}</td>
              <td>
                {Number(b.pendingAmount) === 0 ? (
                  <span style={{ color: "green", fontWeight: "bold" }}>SOLD</span>
                ) : (
                  <>₹{b.pendingAmount}</>
                )}
              </td>
              <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
              <td>
                <button
                  className="history-btn"
                  onClick={() => navigate(`/booking-history/${b._id}`)}
                >
                  Payment History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
