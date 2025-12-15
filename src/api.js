import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/lily",
  baseURL: "http://localhost:5000/api/listings",
});

export default api;
