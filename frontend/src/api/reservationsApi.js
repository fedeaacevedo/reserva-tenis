import axiosClient from './axiosClient';

export const fetchReservations = (params) =>
  axiosClient.get('/reservations/', { params }).then((res) => res.data);

export const createReservation = (data) =>
  axiosClient.post('/reservations/', data).then((res) => res.data);

export const fetchReservation = (id) =>
  axiosClient.get(`/reservations/${id}`).then((res) => res.data);

export const confirmReservation = (id) =>
  axiosClient.post(`/reservations/${id}/confirm`).then((res) => res.data);

export const cancelReservation = (id) =>
  axiosClient.delete(`/reservations/${id}`).then((res) => res.data);
