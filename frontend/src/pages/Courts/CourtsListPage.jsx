import { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader.jsx';
import { createCourt, deleteCourt, fetchCourts, updateCourt } from '../../api/courtsApi.js';
import CourtFormDialog from './CourtFormDialog.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

const CourtsListPage = () => {
  const [courts, setCourts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadCourts = async () => {
    const data = await fetchCourts();
    setCourts(data);
  };

  useEffect(() => {
    loadCourts();
  }, []);

  const handleCreate = () => {
    setSelectedCourt(null);
    setFormOpen(true);
  };

  const handleEdit = (court) => {
    setSelectedCourt(court);
    setFormOpen(true);
  };

  const handleDelete = (court) => {
    setSelectedCourt(court);
    setConfirmOpen(true);
  };

  const handleSubmit = async (formValues) => {
    if (selectedCourt) {
      await updateCourt(selectedCourt.id, formValues);
    } else {
      await createCourt(formValues);
    }
    setFormOpen(false);
    loadCourts();
  };

  const confirmDelete = async () => {
    await deleteCourt(selectedCourt.id);
    setConfirmOpen(false);
    loadCourts();
  };

  return (
    <div>
      <PageHeader title="Canchas" actionLabel="Nueva cancha" onAction={handleCreate} />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Superficie</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courts.map((court) => (
              <TableRow key={court.id} hover>
                <TableCell>{court.name}</TableCell>
                <TableCell>{court.surface || 'N/D'}</TableCell>
                <TableCell>{court.is_active ? 'Activa' : 'Inactiva'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(court)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(court)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <CourtFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialData={selectedCourt} />
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar cancha"
        message="¿Estás seguro?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CourtsListPage;
