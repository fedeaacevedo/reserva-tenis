import { useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PageHeader from '../../components/common/PageHeader.jsx';
import { createAdminUser, fetchUsers, updateUser } from '../../api/usersApi.js';
import UserFormDialog from './UserFormDialog.jsx';

const UsersListPage = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (values) => {
    if (selected) {
      await updateUser(selected.id, values);
    } else {
      await createAdminUser(values);
    }
    setDialogOpen(false);
    setSelected(null);
    loadUsers();
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        actionLabel="Nuevo admin"
        onAction={() => {
          setSelected(null);
          setDialogOpen(true);
        }}
      />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_admin ? 'Admin' : 'Cliente'}</TableCell>
                <TableCell>{user.is_active ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setSelected(user);
                      setDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <UserFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
        onSubmit={handleSubmit}
        initialData={selected}
      />
    </div>
  );
};

export default UsersListPage;
