import { useEffect, useState } from 'react';
import { Paper, TextField, Button } from '@mui/material';
import PageHeader from '../../components/common/PageHeader.jsx';
import useAuth from '../../hooks/useAuth.js';
import { updateUser } from '../../api/usersApi.js';

const ProfilePage = () => {
  const { user, loadUser } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });

  if (!user) return null;

  useEffect(() => {
    setForm({ full_name: user.full_name || '', phone: user.phone || '' });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(user.id, form);
    loadUser?.();
  };

  return (
    <div>
      <PageHeader title="Perfil" subtitle="Gestioná tus datos personales" />
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField label="Nombre" name="full_name" fullWidth value={form.full_name} onChange={handleChange} margin="normal" />
          <TextField label="Teléfono" name="phone" fullWidth value={form.phone} onChange={handleChange} margin="normal" />
          <Button type="submit" sx={{ mt: 2 }}>
            Guardar cambios
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default ProfilePage;
