import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "./BookingHistory.css";

export default function BookingHistory() {
  const { bookingId } = useParams();

  const [history, setHistory] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    amountReceived: "",
    paymentMethod: "cash",
    paymentReceivedDate: "",
    paymentDetails: {},
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadBooking();
    loadHistory();
  }, []);

  /* ================= LOAD SINGLE BOOKING ================= */
  const loadBooking = async () => {
    try {
      const res = await api.get(`/payment-history/${bookingId}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error("Error loading booking:", err);
      alert("❌ Failed to load booking details.");
      setBooking(null);
    }
  };

  /* ================= LOAD PAYMENT HISTORY ================= */
  const loadHistory = async () => {
    try {
      const res = await api.get(`/payment-history?bookingId=${bookingId}`);
      setHistory(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error loading payment history:", err);
      setHistory([]);
    }
  };

  /* ================= CALCULATIONS ================= */
  const totalAmount = booking?.totalAmount || 0;
  const advancePayment = booking?.advancePayment || 0;
  const pendingAmount = booking?.pendingAmount || 0;

  /* ================= ADD PAYMENT ================= */
  const addPayment = async (e) => {
    e.preventDefault();
    if (!form.amountReceived || pendingAmount <= 0) return;

    setLoading(true);
    try {
      await api.post("/payment-history/add-payment", {
        bookingId,
        amountReceived: Number(form.amountReceived),
        paymentMethod: form.paymentMethod,
        paymentDetails: form.paymentDetails,
        paymentReceivedDate: form.paymentReceivedDate,
      });

      alert("✅ Payment Added");

      setForm({
        amountReceived: "",
        paymentMethod: "cash",
        paymentReceivedDate: "",
        paymentDetails: {},
      });

      loadHistory();
      loadBooking();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return new Intl.NumberFormat("en-IN").format(value);
  };

  /* ================= UI ================= */
  return (
    <div className="booking-container">
      <h2 className="page-title">Booking Payment History</h2>

      {booking && (
        <div className="summary-box">
          <div><b>Project:</b> {booking.projectName || "-"}</div>
          <div><b>House Number:</b> {booking.houseNumber}</div>
          <div><b>Total Amount:</b> ₹{formatINR(totalAmount)}</div>
          <div><b>Booking Amount:</b> ₹{formatINR(advancePayment)}</div>
          <div>
            <b>Status:</b>{" "}
            {pendingAmount === 0 ? (
              <span style={{ color: "green", fontWeight: "bold" }}>SOLD</span>
            ) : (
              <span style={{ color: "red", fontWeight: "bold" }}>
                ₹{formatINR(pendingAmount)} Pending
              </span>
            )}
          </div>
        </div>
      )}

      {/* ================= PAYMENT FORM ================= */}
      {pendingAmount > 0 && (
        <form onSubmit={addPayment} className="booking-form">
          <input
            required
            type="number"
            placeholder="Amount Received"
            value={form.amountReceived}
            onChange={(e) => setForm({ ...form, amountReceived: e.target.value })}
            max={pendingAmount}
          />

          <select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
            <option value="cheque">Cheque</option>
            <option value="card">Card</option>
          </select>

          {/* PAYMENT DETAILS */}
          {form.paymentMethod === "upi" && (
            <input
              placeholder="UPI Transaction ID"
              minLength={12}
              maxLength={18}
              onChange={(e) =>
                setForm({ ...form, paymentDetails: { upiTxnId: e.target.value } })
              }
            />
          )}

          {form.paymentMethod === "bank" && (
            <>
              <input
                placeholder="Bank Name"
                value={form.paymentDetails?.bankName || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentDetails: { ...form.paymentDetails, bankName: e.target.value },
                  })
                }
              />
              <input
                placeholder="Account Number"
                value={form.paymentDetails?.accountNo || ""}
                minLength={14}
                maxLength={18}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentDetails: { ...form.paymentDetails, accountNo: e.target.value },
                  })
                }
              />
            </>
          )}

          {form.paymentMethod === "cheque" && (
            <input
              placeholder="Cheque Number"
              onChange={(e) =>
                setForm({ ...form, paymentDetails: { chequeNo: e.target.value } })
              }
            />
          )}

          {form.paymentMethod === "card" && (
            <input
              placeholder="Last 4 digits"
              maxLength={4}
              onChange={(e) =>
                setForm({ ...form, paymentDetails: { last4Digits: e.target.value } })
              }
            />
          )}

          <input
            required
            type="date"
            value={form.paymentReceivedDate}
            onChange={(e) => setForm({ ...form, paymentReceivedDate: e.target.value })}
          />

          <button disabled={loading}>{loading ? "Saving..." : "Add Payment"}</button>
        </form>
      )}

      {/* ================= PAYMENT HISTORY TABLE ================= */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Pending Payment</th>
          </tr>
        </thead>

        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="4">No payments yet</td>
            </tr>
          ) : (
            history.map((h, index) => {
              const paidTillNow = history
                .slice(0, index + 1)
                .reduce((sum, p) => sum + Number(p.amountReceived || 0), 0);
              const pendingAfter = totalAmount - advancePayment - paidTillNow;

              return (
                <tr key={h._id}>
                  <td>{new Date(h.paymentReceivedDate).toLocaleDateString()}</td>
                  <td>{h.paymentMethod.toUpperCase()}</td>
                  <td>₹{h.amountReceived}</td>
                  <td>
                    {pendingAfter === 0 ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>SOLD</span>
                    ) : (
                      <>₹{formatINR(pendingAfter)}</>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
