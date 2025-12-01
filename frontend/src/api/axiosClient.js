import axios from 'axios';
import dayjs from 'dayjs';
import { DEV_TOKEN, DEV_USER, MOCK_STATE_KEY } from '../constants/devAuth.js';

const rawBaseUrl = import.meta.env?.VITE_API_BASE_URL ?? '/api/v1';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '') || '/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL
});

const emptyState = {
  courts: [
    { id: 1, name: 'Cancha Central', surface: 'Cemento', is_active: true },
    { id: 2, name: 'Cancha Auxiliar', surface: 'Polvo de ladrillo', is_active: true }
  ],
  reservations: [
    {
      id: 1,
      court_id: 1,
      customer_name: 'Juan Pérez',
      customer_phone: '+54 11 1111-2222',
      start_time: dayjs().hour(9).minute(0).second(0).millisecond(0).toISOString(),
      end_time: dayjs().hour(10).minute(0).second(0).millisecond(0).toISOString(),
      status: 'confirmed'
    }
  ],
  closures: [],
  users: [DEV_USER]
};

const loadState = () => {
  try {
    const stored = localStorage.getItem(MOCK_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error reading mock state', error);
  }
  localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(emptyState));
  return JSON.parse(JSON.stringify(emptyState));
};

const saveState = (state) => {
  localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(state));
};

const nextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1);

const toAxiosResponse = (config, data, status = 200) =>
  Promise.resolve({
    data,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: {},
    config
  });

const filterReservations = (reservations, params = {}) => {
  let filtered = [...reservations];
  if (params.court_id) {
    filtered = filtered.filter((res) => res.court_id === Number(params.court_id));
  }
  if (params.date_from) {
    const from = new Date(params.date_from);
    filtered = filtered.filter((res) => new Date(res.start_time) >= from);
  }
  if (params.date_to) {
    const to = new Date(params.date_to);
    filtered = filtered.filter((res) => new Date(res.end_time) <= to);
  }
  return filtered;
};

const buildAvailability = (state, courtId, params = {}) => {
  const date = params.date || dayjs().format('YYYY-MM-DD');
  const slotMinutes = Number(params.slot_minutes) || 60;
  const fromHour = params.from_hour !== undefined ? Number(params.from_hour) : 8;
  const toHour = params.to_hour !== undefined ? Number(params.to_hour) : 23;

  const slots = [];
  const reservations = state.reservations.filter(
    (res) =>
      res.court_id === courtId &&
      res.status !== 'cancelled' &&
      dayjs(res.start_time).format('YYYY-MM-DD') === date
  );

  for (let hour = fromHour; hour < toHour; hour += slotMinutes / 60) {
    const start = dayjs(`${date}T${String(hour).padStart(2, '0')}:00:00`);
    const end = start.add(slotMinutes, 'minute');
    const overlapping = reservations.some((res) => {
      const resStart = dayjs(res.start_time);
      const resEnd = dayjs(res.end_time);
      return resStart.isBefore(end) && resEnd.isAfter(start);
    });
    if (!overlapping) {
      slots.push({
        court_id: courtId,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      });
    }
  }

  return slots;
};

const ensureCourt = (state, courtId) => {
  const court = state.courts.find((c) => c.id === courtId);
  if (!court) throw new Error('Court not found');
  return court;
};

const resolveRelativeUrl = (config) => {
  const rawUrl = (config.url || '').replace(/\/+$/, '');
  if (!config.baseURL) {
    return rawUrl || '/';
  }
  const normalizedBase = config.baseURL.replace(/\/+$/, '');
  if (normalizedBase && rawUrl.startsWith(normalizedBase)) {
    const stripped = rawUrl.slice(normalizedBase.length) || '/';
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }
  return rawUrl || '/';
};

const handleMockRequest = async (config) => {
  const state = loadState();
  const method = (config.method || 'get').toLowerCase();
  const url = resolveRelativeUrl(config).replace(/\/+$/, '');
  const params = config.params || {};
  const payload = config.data ? JSON.parse(config.data) : {};

  // Courts
  if (url === '/courts') {
    if (method === 'get') return toAxiosResponse(config, state.courts);
    if (method === 'post') {
      const newCourt = { id: nextId(state.courts), is_active: true, ...payload };
      state.courts.push(newCourt);
      saveState(state);
      return toAxiosResponse(config, newCourt, 201);
    }
  }
  if (/^\/courts\/\d+$/.test(url)) {
    const id = Number(url.split('/')[2]);
    const court = state.courts.find((c) => c.id === id);
    if (method === 'get') return toAxiosResponse(config, court);
    if (method === 'put') {
      Object.assign(court, payload);
      saveState(state);
      return toAxiosResponse(config, court);
    }
    if (method === 'delete') {
      state.courts = state.courts.filter((c) => c.id !== id);
      saveState(state);
      return toAxiosResponse(config, {});
    }
  }
  if (/^\/courts\/\d+\/availability$/.test(url)) {
    const id = Number(url.split('/')[2]);
    ensureCourt(state, id);
    const slots = buildAvailability(state, id, params);
    return toAxiosResponse(config, slots);
  }

  // Reservations
  if (url === '/reservations') {
    if (method === 'get') {
      const data = filterReservations(state.reservations, params);
      return toAxiosResponse(config, data);
    }
    if (method === 'post') {
      const newReservation = {
        id: nextId(state.reservations),
        status: 'pending',
        ...payload
      };
      state.reservations.push(newReservation);
      saveState(state);
      return toAxiosResponse(config, newReservation, 201);
    }
  }
  if (/^\/reservations\/\d+$/.test(url)) {
    const id = Number(url.split('/')[2]);
    const reservation = state.reservations.find((r) => r.id === id);
    if (method === 'get') return toAxiosResponse(config, reservation);
    if (method === 'delete') {
      reservation.status = 'cancelled';
      saveState(state);
      return toAxiosResponse(config, reservation);
    }
  }
  if (/^\/reservations\/\d+\/confirm$/.test(url) && method === 'post') {
    const id = Number(url.split('/')[2]);
    const reservation = state.reservations.find((r) => r.id === id);
    reservation.status = 'confirmed';
    saveState(state);
    return toAxiosResponse(config, reservation);
  }

  // Closures
  if (url === '/admin/closures') {
    if (method === 'get') return toAxiosResponse(config, state.closures);
    if (method === 'post') {
      const newClosure = { id: nextId(state.closures), ...payload };
      state.closures.push(newClosure);
      saveState(state);
      return toAxiosResponse(config, newClosure, 201);
    }
  }
  if (/^\/admin\/closures\/\d+$/.test(url)) {
    const id = Number(url.split('/')[3]);
    const closure = state.closures.find((c) => c.id === id);
    if (method === 'put') {
      Object.assign(closure, payload);
      saveState(state);
      return toAxiosResponse(config, closure);
    }
    if (method === 'delete') {
      state.closures = state.closures.filter((c) => c.id !== id);
      saveState(state);
      return toAxiosResponse(config, {});
    }
    if (method === 'get') return toAxiosResponse(config, closure);
  }

  // Users
  if (url === '/users/me' && method === 'get') {
    return toAxiosResponse(config, DEV_USER);
  }
  if (url === '/users' && method === 'get') {
    return toAxiosResponse(config, state.users);
  }
  if (url === '/users' && method === 'post') {
    const newUser = { id: nextId(state.users), is_admin: false, is_active: true, ...payload };
    state.users.push(newUser);
    saveState(state);
    return toAxiosResponse(config, newUser, 201);
  }
  if (url === '/users/admin' && method === 'post') {
    const newAdmin = { id: nextId(state.users), is_admin: true, is_active: true, ...payload };
    state.users.push(newAdmin);
    saveState(state);
    return toAxiosResponse(config, newAdmin, 201);
  }
  if (/^\/users\/\d+$/.test(url) && method === 'put') {
    const id = Number(url.split('/')[2]);
    const user = state.users.find((u) => u.id === id);
    Object.assign(user, payload);
    saveState(state);
    return toAxiosResponse(config, user);
  }
  if (/^\/users\/\d+$/.test(url) && method === 'get') {
    const id = Number(url.split('/')[2]);
    const user = state.users.find((u) => u.id === id);
    return toAxiosResponse(config, user);
  }

  return Promise.reject(new Error(`Mock handler missing for ${method.toUpperCase()} ${url}`));
};

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (token === DEV_TOKEN) {
    config.adapter = () => handleMockRequest(config);
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    if (token === DEV_TOKEN) {
      return Promise.reject(error);
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
