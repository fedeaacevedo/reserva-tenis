import { useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, TextField, MenuItem, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import { fetchReservations, confirmReservation, cancelReservation } from '../../api/reservationsApi.js';
import { fetchCourts } from '../../api/courtsApi.js';
import dayjs from 'dayjs';

const ReservationsListPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filters, setFilters] = useState({ court_id: '', date: dayjs().format('YYYY-MM-DD') });
  const [courts, setCourts] = useState([]);
  const navigate = useNavigate();

  const loadReservations = async () => {
    const params = {};
    if (filters.court_id) params.court_id = filters.court_id;
    if (filters.date) {
      params.date_from = `${filters.date}T00:00:00`;
      params.date_to = `${filters.date}T23:59:59`;
    }
    const data = await fetchReservations(params);
    setReservations(data);
  };

  useEffect(() => {
    fetchCourts().then(setCourts);
  }, []);

  useEffect(() => {
    loadReservations();
  }, [filters]);

  const handleConfirm = async (id) => {
    await confirmReservation(id);
    loadReservations();
  };

  const handleCancel = async (id) => {
    await cancelReservation(id);
    loadReservations();
  };

  return (
    <div>
      <PageHeader title="Reservas" actionLabel="Nueva reserva" onAction={() => navigate('/reservations/new')} />
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Cancha"
          value={filters.court_id}
          onChange={(e) => setFilters((prev) => ({ ...prev, court_id: e.target.value }))}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {courts.map((court) => (
            <MenuItem key={court.id} value={court.id}>
              {court.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField type="date" label="Fecha" value={filters.date} onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))} />
        <Button onClick={loadReservations}>Aplicar filtros</Button>
      </Stack>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Cancha</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id} hover>
                <TableCell>{reservation.customer_name}</TableCell>
                <TableCell>{reservation.court_id}</TableCell>
                <TableCell>{dayjs(reservation.start_time).format('DD/MM HH:mm')}</TableCell>
                <TableCell>{dayjs(reservation.end_time).format('DD/MM HH:mm')}</TableCell>
                <TableCell>{reservation.status}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => navigate(`/reservations/${reservation.id}`)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleConfirm(reservation.id)} disabled={reservation.status === 'confirmed'}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton onClick={() => handleCancel(reservation.id)} disabled={reservation.status === 'cancelled'}>
                    <CancelIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

export default ReservationsListPage;
