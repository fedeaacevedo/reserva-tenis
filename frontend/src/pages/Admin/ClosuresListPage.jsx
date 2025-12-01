import { useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader.jsx';
import { createClosure, deleteClosure, fetchClosures, updateClosure } from '../../api/closuresApi.js';
import ClosureFormDialog from './ClosureFormDialog.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

const ClosuresListPage = () => {
  const [closures, setClosures] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadClosures = async () => {
    const data = await fetchClosures();
    setClosures(data);
  };

  useEffect(() => {
    loadClosures();
  }, []);

  const handleSubmit = async (values) => {
    if (selected) {
      await updateClosure(selected.id, values);
    } else {
      await createClosure(values);
    }
    setFormOpen(false);
    loadClosures();
  };

  const handleDelete = async () => {
    await deleteClosure(selected.id);
    setConfirmOpen(false);
    loadClosures();
  };

  return (
    <div>
      <PageHeader
        title="Cierres"
        actionLabel="Nuevo cierre"
        onAction={() => {
          setSelected(null);
          setFormOpen(true);
        }}
      />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cancha</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {closures.map((closure) => (
              <TableRow key={closure.id} hover>
                <TableCell>{closure.court_id || 'Todas'}</TableCell>
                <TableCell>{dayjs(closure.start_time).format('DD/MM HH:mm')}</TableCell>
                <TableCell>{dayjs(closure.end_time).format('DD/MM HH:mm')}</TableCell>
                <TableCell>{closure.reason}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setSelected(closure);
                      setFormOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelected(closure);
                      setConfirmOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <ClosureFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        onSubmit={handleSubmit}
        initialData={selected}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar cierre"
        message="Esta acción es permanente"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClosuresListPage;
