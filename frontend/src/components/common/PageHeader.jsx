import { Box, Button, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, actionLabel, onAction }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="subtitle2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
    {actionLabel && (
      <Button onClick={onAction} color="primary">
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default PageHeader;
