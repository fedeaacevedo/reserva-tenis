import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import useAuth from '../../hooks/useAuth.js';
import useApiErrorHandler from '../../hooks/useApiErrorHandler.js';
import { DEV_CREDENTIALS } from '../../constants/devAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleError = useApiErrorHandler();
  const [form, setForm] = useState({ username: DEV_CREDENTIALS.username, password: DEV_CREDENTIALS.password });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (error) {
      handleError(error, 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: 'background.default' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
              <SportsTennisIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              EDLP Tenis
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Accedé para gestionar tus reservas
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              helperText="Por defecto: admin@reservatenis.com"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              helperText="Por defecto: admin123"
            />
            <Button type="submit" fullWidth sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
