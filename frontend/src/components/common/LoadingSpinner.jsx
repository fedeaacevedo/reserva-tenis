import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
    <CircularProgress color="primary" />
  </Box>
);

export default LoadingSpinner;
