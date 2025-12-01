import { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import { fetchReservations } from '../../api/reservationsApi.js';
import { fetchCourts } from '../../api/courtsApi.js';
import dayjs from 'dayjs';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState({ today: 0, week: 0, courts: 0 });

  useEffect(() => {
    const loadData = async () => {
      const courts = await fetchCourts();
      const allReservations = await fetchReservations();
      const today = dayjs().startOf('day');
      const week = dayjs().startOf('week');
      const todayCount = allReservations.filter((r) => dayjs(r.start_time).isSame(today, 'day')).length;
      const weekCount = allReservations.filter((r) => dayjs(r.start_time).isAfter(week)).length;
      setMetrics({ today: todayCount, week: weekCount, courts: courts.length });
    };
    loadData().catch((err) => console.error(err));
  }, []);

  const cards = [
    { label: 'Reservas de hoy', value: metrics.today },
    { label: 'Reservas de la semana', value: metrics.week },
    { label: 'Canchas activas', value: metrics.courts }
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Resumen operativo rápido" />
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} md={4} key={card.label}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default DashboardPage;
