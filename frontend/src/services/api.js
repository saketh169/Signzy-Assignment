import axios from 'axios';

const BASE_URL = '/api';

// Create a pre-configured Axios client instance
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const api = {
  // Configurations CRUD
  getAPIs: () => client.get('/workflows').then(res => res.data),
  getAPIById: (id) => client.get(`/workflows/${id}`).then(res => res.data),
  createAPI: (data) => client.post('/workflows', data).then(res => res.data),
  updateAPI: (id, data) => client.put(`/workflows/${id}`, data).then(res => res.data),
  deleteAPI: (id) => client.delete(`/workflows/${id}`).then(res => res.data),

  // Telemetry logs and analytics
  getLogs: () => client.get('/logs').then(res => res.data),
  clearLogs: () => client.delete('/logs').then(res => res.data),
  getStats: () => client.get('/stats').then(res => res.data),

  // Dynamic API runner executing calls through the proxy
  runAPI: async (endpoint, payload, method = 'POST') => {
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `/run${cleanPath}`;
    
    try {
      const config = {
        method: method.toUpperCase(),
        url
      };

      if (config.method === 'GET') {
        config.params = payload;
      } else {
        config.data = payload;
      }

      const res = await client(config);
      return { status: res.status, ok: true, data: res.data };
    } catch (err) {
      return {
        status: err.response ? err.response.status : 505,
        ok: false,
        data: err.response ? err.response.data : { error: err.message }
      };
    }
  }
};

export default api;
