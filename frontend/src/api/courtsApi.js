import axiosClient from './axiosClient';

export const fetchCourts = () => axiosClient.get('/courts/').then((res) => res.data);
export const fetchCourt = (id) => axiosClient.get(`/courts/${id}`).then((res) => res.data);
export const createCourt = (data) => axiosClient.post('/courts/', data).then((res) => res.data);
export const updateCourt = (id, data) => axiosClient.put(`/courts/${id}`, data).then((res) => res.data);
export const deleteCourt = (id) => axiosClient.delete(`/courts/${id}`).then((res) => res.data);
export const fetchCourtAvailability = (id, params) =>
  axiosClient
    .get(`/courts/${id}/availability`, { params })
    .then((res) => res.data);
