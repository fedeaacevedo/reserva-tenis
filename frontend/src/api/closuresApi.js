import axiosClient from './axiosClient';

export const fetchClosures = () => axiosClient.get('/admin/closures/').then((res) => res.data);
export const createClosure = (data) => axiosClient.post('/admin/closures/', data).then((res) => res.data);
export const updateClosure = (id, data) => axiosClient.put(`/admin/closures/${id}`, data).then((res) => res.data);
export const deleteClosure = (id) => axiosClient.delete(`/admin/closures/${id}`).then((res) => res.data);
