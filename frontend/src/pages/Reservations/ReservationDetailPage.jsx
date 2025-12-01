import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Typography, Stack, Button } from '@mui/material';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader.jsx';
import { fetchReservation, confirmReservation, cancelReservation } from '../../api/reservationsApi.js';

const ReservationDetailPage = () => {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const navigate = useNavigate();

  const loadReservation = async () => {
    const data = await fetchReservation(reservationId);
    setReservation(data);
  };

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  if (!reservation) return null;

  const canConfirm = reservation.status === 'pending';
  const canCancel = reservation.status !== 'cancelled';

  const handleConfirm = async () => {
    await confirmReservation(reservation.id);
    loadReservation();
  };

  const handleCancel = async () => {
    await cancelReservation(reservation.id);
    loadReservation();
  };

  return (
    <div>
      <PageHeader title={`Reserva #${reservation.id}`} subtitle={reservation.customer_name} />
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Cancha
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {reservation.court_id}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Horario
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {dayjs(reservation.start_time).format('DD/MM/YYYY HH:mm')} - {dayjs(reservation.end_time).format('HH:mm')}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Estado
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {reservation.status}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button onClick={() => navigate('/reservations')}>Volver</Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Confirmar
          </Button>
          <Button onClick={handleCancel} disabled={!canCancel} color="warning">
            Cancelar
          </Button>
        </Stack>
        {/* TODO: consultar endpoint de cierres para validar superposición si aplica */}
      </Paper>
    </div>
  );
};

export default ReservationDetailPage;
