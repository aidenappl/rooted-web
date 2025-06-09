// lib/axios.ts or services/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: () => true,
  timeout: 10000,
});

const nextAPI = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: () => true,
  timeout: 10000,
});

export { api, nextAPI };
