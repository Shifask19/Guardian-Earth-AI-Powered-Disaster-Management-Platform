import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import LocationSafetyChecker from '../components/LocationSafetyChecker';
import WeatherWidget from '../components/WeatherWidget';
import LiveStats from '../components/LiveStats';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { alerts } = useSocket();
  const [stats, setStats] = useState({
    nearbyDisasters: 0,
    activeAlerts: 0,
    volunteerRequests: 0,
    preparednessScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (user?.location) {
        const [disastersRes, alertsRes, volunteerRes] = await Promise.all([
          axios.get(`/api/disasters/nearby?lat=${user.location.coordinates[1]}&lng=${user.location.coordinates[0]}&radius=50`),
          axios.get('/api/alerts'),
          user.isVolunteer ? axios.get('/api/volunteers/requests') : Promise.resolve({ data: [] })
        ]);

        setStats({
          nearbyDisasters: disastersRes.data.length,
          activeAlerts: alertsRes.data.length,
          volunteerRequests: volunteerRes.data.length,
          preparednessScore: user.preparednessScore || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color = 'primary', subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" ml={1}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" color={color} fontWeight="bold">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay informed and prepared with your personalized disaster management dashboard
        </Typography>
      </Box>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">Recent Alerts ({alerts.length})</Typography>
          {alerts.slice(0, 3).map((alert, index) => (
            <Typography key={index} variant="body2">
              • {alert.message}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Cyclone color="error" />}
            title="Nearby Disasters"
            value={stats.nearbyDisasters}
            color="error.main"
            subtitle="Within 50km radius"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Warning color="warning" />}
            title="Active Alerts"
            value={stats.activeAlerts}
            color="warning.main"
            subtitle="Requires attention"
          />
        </Grid>
        {user?.isVolunteer && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<VolunteerActivism color="primary" />}
              title="Help Requests"
              value={stats.volunteerRequests}
              subtitle="People need your help"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<School color="success" />}
            title="Preparedness Score"
            value={`${stats.preparednessScore}%`}
            color="success.main"
            subtitle="Keep improving!"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="outlined" startIcon={<Warning />} fullWidth>
                  Report Emergency
                </Button>
                <Button variant="outlined" startIcon={<VolunteerActivism />} fullWidth>
                  Find Volunteers
                </Button>
                <Button variant="outlined" startIcon={<MonetizationOn />} fullWidth>
                  Make Donation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preparedness Progress
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Emergency Kit: Complete
                </Typography>
                <LinearProgress variant="determinate" value={100} color="success" />
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Safety Training: 75%
                </Typography>
                <LinearProgress variant="determinate" value={75} />
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Family Plan: 50%
                </Typography>
                <LinearProgress variant="determinate" value={50} color="warning" />
              </Box>
              <Button variant="text" startIcon={<TrendingUp />}>
                Improve Score
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Chips */}
      <Box mt={4} display="flex" gap={1} flexWrap="wrap">
        <Chip 
          label={`Location: ${user?.location?.address || 'Set Location'}`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={user?.isVolunteer ? 'Volunteer' : 'Citizen'} 
          color="secondary" 
        />
        <Chip 
          label={`Alerts: ${user?.preferences?.alertTypes?.length || 0} types`} 
          color="info" 
          variant="outlined" 
        />
      </Box>
    </Container>
  );
};

export default Dashboard;