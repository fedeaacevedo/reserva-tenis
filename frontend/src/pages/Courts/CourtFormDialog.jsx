import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch } from '@mui/material';
import { useEffect, useState } from 'react';

const CourtFormDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({ name: '', surface: '', is_active: true });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: '', surface: '', is_active: true });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e) => {
    setForm((prev) => ({ ...prev, is_active: e.target.checked }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar cancha' : 'Nueva cancha'}</DialogTitle>
      <DialogContent>
        <TextField margin="normal" label="Nombre" name="name" fullWidth value={form.name} onChange={handleChange} />
        <TextField margin="normal" label="Superficie" name="surface" fullWidth value={form.surface} onChange={handleChange} />
        <FormControlLabel control={<Switch checked={form.is_active} onChange={handleToggle} />} label="Activa" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourtFormDialog;
