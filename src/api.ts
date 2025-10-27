import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/jwt', // URL backend Flask
  headers: { 'Content-Type': 'application/json' }
});
