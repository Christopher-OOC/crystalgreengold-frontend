

import axios from 'axios';

import { API_BASE_URL as BASE_URL } from '@/lib/config/api';

const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default publicClient;