import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, MenuItem, Paper, TextField, Typography, Button } from '@mui/material';
import dayjs from 'dayjs';
import { fetchCourts, fetchCourtAvailability } from '../../api/courtsApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { useNavigate } from 'react-router-dom';

const hoursRange = Array.from({ length: 16 }, (_, idx) => 8 + idx);

const CourtAvailabilityPage = () => {
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [availability, setAvailability] = useState([]);
  const [fromHour, setFromHour] = useState(8);
  const [toHour, setToHour] = useState(23);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourts().then((data) => {
      setCourts(data);
      if (data.length) {
        setSelectedCourt(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCourt) return;
    fetchCourtAvailability(Number(selectedCourt), {
      date,
      slot_minutes: 60,
      from_hour: fromHour,
      to_hour: toHour
    }).then(setAvailability);
  }, [selectedCourt, date, fromHour, toHour]);

  const gridMap = useMemo(() => {
    const map = {};
    availability.forEach((slot) => {
      const start = dayjs(slot.start_time);
      map[start.format('HH:mm')] = slot;
    });
    return map;
  }, [availability]);

  return (
    <div>
      <PageHeader title="Disponibilidad" subtitle="Seleccioná una cancha para ver los huecos libres" />
      <Paper sx={{ p: 3, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Cancha"
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              fullWidth
            >
              {courts.map((court) => (
                <MenuItem key={court.id} value={court.id}>
                  {court.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField type="date" label="Fecha" value={date} onChange={(e) => setDate(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={3} md={2}>
            <TextField select label="Desde" value={fromHour} onChange={(e) => setFromHour(Number(e.target.value))} fullWidth>
              {hoursRange.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour}:00
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3} md={2}>
            <TextField select label="Hasta" value={toHour} onChange={(e) => setToHour(Number(e.target.value))} fullWidth>
              {hoursRange.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour}:00
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={1}>
          {hoursRange.map((hour) => {
            const key = `${String(hour).padStart(2, '0')}:00`;
            const slot = gridMap[key];
            const available = Boolean(slot);
            return (
              <Grid item xs={6} md={3} key={key}>
                <Box
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: available ? 'white' : 'grey.200',
                    border: '1px solid',
                    borderColor: available ? 'primary.main' : 'grey.300'
                  }}
                >
                  <Typography variant="subtitle1">{key}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {available ? 'Disponible' : 'Ocupado'}
                  </Typography>
                  {available && (
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => navigate('/reservations/new', { state: { slot: { ...slot, court_id: Number(selectedCourt) } } })}
                    >
                      Reservar
                    </Button>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </div>
  );
};

export default CourtAvailabilityPage;
