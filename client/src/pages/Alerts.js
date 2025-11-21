import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Alert,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Close,
  LocationOn,
  Schedule,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const Alerts = () => {
  const { user } = useAuth();
  const { alerts: realtimeAlerts, clearAlerts } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await axios.put(`/api/alerts/${alertId}/read`);
      setAlerts(alerts.map(alert => 
        alert._id === alertId 
          ? { ...alert, readBy: [...(alert.readBy || []), user._id] }
          : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'high':
        return <Warning color="error" />;
      case 'medium':
        return <Warning color="warning" />;
      case 'low':
        return <Info color="info" />;
      default:
        return <Info color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'error';
      case 'warning':
        return 'warning';
      case 'watch':
        return 'info';
      case 'advisory':
        return 'default';
      default:
        return 'default';
    }
  };

  const isAlertRead = (alert) => {
    return alert.readBy && alert.readBy.includes(user._id);
  };

  const AlertCard = ({ alert, isRealtime = false }) => (
    <Card 
      sx={{ 
        mb: 2, 
        border: isAlertRead(alert) ? 'none' : '2px solid',
        borderColor: isAlertRead(alert) ? 'transparent' : getSeverityColor(alert.severity) + '.main',
        opacity: isAlertRead(alert) ? 0.7 : 1
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {getSeverityIcon(alert.severity)}
            <Typography variant="h6" component="div">
              {alert.title}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={alert.type} 
              color={getTypeColor(alert.type)}
              size="small"
            />
            <Chip 
              label={alert.severity} 
              color={getSeverityColor(alert.severity)}
              size="small"
            />
            {!isAlertRead(alert) && !isRealtime && (
              <IconButton 
                size="small" 
                onClick={() => handleMarkAsRead(alert._id)}
                title="Mark as read"
              >
                <CheckCircle color="success" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          {alert.message}
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {alert.location && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {alert.affectedRadius}km radius
              </Typography>
            </Box>
          )}
          <Box display="flex" alignItems="center" gap={0.5}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {new Date(alert.createdAt || alert.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {alert.actionItems && alert.actionItems.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => setSelectedAlert(alert)}
            size="small"
          >
            View Action Items
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading alerts...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Emergency Alerts
        </Typography>
        {realtimeAlerts.length > 0 && (
          <Button variant="outlined" onClick={clearAlerts}>
            Clear Recent ({realtimeAlerts.length})
          </Button>
        )}
      </Box>

      {/* Real-time Alerts */}
      {realtimeAlerts.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom color="error">
            🔴 Live Alerts
          </Typography>
          {realtimeAlerts.map((alert, index) => (
            <AlertCard key={`realtime-${index}`} alert={alert} isRealtime={true} />
          ))}
        </Box>
      )}

      {/* Historical Alerts */}
      <Typography variant="h6" gutterBottom>
        Recent Alerts
      </Typography>

      {alerts.length === 0 ? (
        <Alert severity="info">
          No alerts in your area. Stay safe! 🛡️
        </Alert>
      ) : (
        <Box>
          {alerts.map((alert) => (
            <AlertCard key={alert._id} alert={alert} />
          ))}
        </Box>
      )}

      {/* Alert Details Dialog */}
      <Dialog 
        open={Boolean(selectedAlert)} 
        onClose={() => setSelectedAlert(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Action Items
            <IconButton onClick={() => setSelectedAlert(null)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAlert?.actionItems && (
            <List>
              {selectedAlert.actionItems.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {item.priority === 'high' ? (
                      <Error color="error" />
                    ) : item.priority === 'medium' ? (
                      <Warning color="warning" />
                    ) : (
                      <Info color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.action}
                    secondary={item.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAlert(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Alert Statistics */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alert Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="error">
                  {alerts.filter(a => a.severity === 'critical').length}
                </Typography>
                <Typography variant="body2">Critical</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {alerts.filter(a => a.severity === 'high').length}
                </Typography>
                <Typography variant="body2">High</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {alerts.filter(a => a.severity === 'medium').length}
                </Typography>
                <Typography variant="body2">Medium</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {alerts.filter(a => a.severity === 'low').length}
                </Typography>
                <Typography variant="body2">Low</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Alerts;