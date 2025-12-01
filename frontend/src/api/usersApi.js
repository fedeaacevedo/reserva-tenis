import axiosClient from './axiosClient';

export const fetchUsers = () => axiosClient.get('/users/').then((res) => res.data);
export const fetchMe = () => axiosClient.get('/users/me').then((res) => res.data);
export const createUser = (data) => axiosClient.post('/users/', data).then((res) => res.data);
export const createAdminUser = (data) => axiosClient.post('/users/admin', data).then((res) => res.data);
export const updateUser = (id, data) => axiosClient.put(`/users/${id}`, data).then((res) => res.data);
export const fetchUser = (id) => axiosClient.get(`/users/${id}`).then((res) => res.data);
