import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch } from '@mui/material';

const UserFormDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', is_admin: false });

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, password: '' });
    } else {
      setForm({ full_name: '', email: '', phone: '', password: '', is_admin: false });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e) => {
    setForm((prev) => ({ ...prev, is_admin: e.target.checked }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <DialogContent>
        <TextField margin="normal" label="Nombre" name="full_name" fullWidth value={form.full_name} onChange={handleChange} />
        <TextField margin="normal" label="Email" name="email" fullWidth value={form.email} onChange={handleChange} />
        <TextField margin="normal" label="Teléfono" name="phone" fullWidth value={form.phone} onChange={handleChange} />
        <TextField
          margin="normal"
          label="Contraseña"
          name="password"
          fullWidth
          value={form.password}
          onChange={handleChange}
          type="password"
        />
        <FormControlLabel control={<Switch checked={form.is_admin} onChange={handleToggle} />} label="Administrador" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
