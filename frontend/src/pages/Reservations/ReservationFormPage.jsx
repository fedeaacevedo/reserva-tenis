import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, TextField, MenuItem, Grid, Button } from '@mui/material';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader.jsx';
import { fetchCourts } from '../../api/courtsApi.js';
import { createReservation } from '../../api/reservationsApi.js';
import useApiErrorHandler from '../../hooks/useApiErrorHandler.js';

const ReservationFormPage = () => {
  const [courts, setCourts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const handleError = useApiErrorHandler();
  const preselected = location.state?.slot;
  const formatSlot = (value) => (value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '');
  const [form, setForm] = useState({
    court_id: preselected?.court_id || '',
    customer_name: '',
    start_time: formatSlot(preselected?.start_time),
    end_time: formatSlot(preselected?.end_time)
  });

  useEffect(() => {
    fetchCourts().then(setCourts);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.start_time || !form.end_time) {
      return handleError({ message: 'Debés seleccionar horarios válidos' });
    }
    if (dayjs(form.end_time).isBefore(dayjs(form.start_time))) {
      return handleError({ message: 'La hora fin debe ser posterior' });
    }
    try {
      await createReservation({
        court_id: Number(form.court_id),
        start_time: form.start_time,
        end_time: form.end_time,
        customer_name: form.customer_name,
        customer_phone: ''
      });
      navigate('/reservations');
    } catch (error) {
      handleError(error, 'No se pudo crear la reserva');
    }
  };

  return (
    <div>
      <PageHeader title="Nueva reserva" />
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Cancha"
                name="court_id"
                fullWidth
                value={form.court_id}
                onChange={handleChange}
                required
              >
                {courts.map((court) => (
                  <MenuItem key={court.id} value={court.id}>
                    {court.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre del cliente"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Inicio"
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fin"
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
          <Button type="submit" sx={{ mt: 3 }}>
            Guardar
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default ReservationFormPage;
