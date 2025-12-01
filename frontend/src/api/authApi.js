import axiosClient from './axiosClient';

export const loginRequest = (credentials) => {
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);
  return axiosClient.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then((res) => res.data);
};
