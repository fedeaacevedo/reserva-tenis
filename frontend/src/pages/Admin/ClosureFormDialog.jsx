import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchCourts } from '../../api/courtsApi.js';

const ClosureFormDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({ court_id: '', start_time: '', end_time: '', reason: '' });
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    fetchCourts().then(setCourts);
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ court_id: '', start_time: '', end_time: '', reason: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (new Date(form.end_time) < new Date(form.start_time)) {
      alert('La fecha final debe ser posterior');
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar cierre' : 'Nuevo cierre'}</DialogTitle>
      <DialogContent>
        <TextField select label="Cancha" name="court_id" fullWidth value={form.court_id} onChange={handleChange} margin="normal">
          <MenuItem value="">Todas</MenuItem>
          {courts.map((court) => (
            <MenuItem key={court.id} value={court.id}>
              {court.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Inicio"
          type="datetime-local"
          name="start_time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={form.start_time}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Fin"
          type="datetime-local"
          name="end_time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={form.end_time}
          onChange={handleChange}
          margin="normal"
        />
        <TextField label="Motivo" name="reason" fullWidth value={form.reason} onChange={handleChange} margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClosureFormDialog;
