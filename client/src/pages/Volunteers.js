import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  VolunteerActivism,
  Add,
  LocationOn,
  Schedule,
  Person,
  Help,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Volunteers = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [volunteers, setVolunteers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openVolunteerDialog, setOpenVolunteerDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [requestForm, setRequestForm] = useState({
    type: '',
    title: '',
    description: '',
    urgency: 'medium',
    skillsNeeded: []
  });

  const [volunteerForm, setVolunteerForm] = useState({
    skills: [],
    availability: '',
    radius: 10
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user?.location) {
        const [volunteersRes, requestsRes] = await Promise.all([
          axios.get(`/api/volunteers/nearby?lat=${user.location.coordinates[1]}&lng=${user.location.coordinates[0]}&radius=20`),
          axios.get('/api/volunteers/requests')
        ]);

        setVolunteers(volunteersRes.data);
        setRequests(requestsRes.data);
      }
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVolunteer = async () => {
    try {
      await axios.post('/api/volunteers/register', volunteerForm);
      setOpenVolunteerDialog(false);
      // Refresh user data or show success message
      alert('Successfully registered as volunteer!');
    } catch (error) {
      console.error('Error registering as volunteer:', error);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const requestData = {
        ...requestForm,
        location: {
          type: 'Point',
          coordinates: user.location.coordinates,
          address: user.location.address
        }
      };

      await axios.post('/api/volunteers/request', requestData);
      setOpenRequestDialog(false);
      setRequestForm({
        type: '',
        title: '',
        description: '',
        urgency: 'medium',
        skillsNeeded: []
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const skillOptions = [
    'first-aid', 'medical', 'rescue', 'logistics', 'transport', 
    'communication', 'food-service', 'shelter-management', 'counseling'
  ];

  const requestTypes = [
    'rescue', 'medical', 'supplies', 'shelter', 'transport', 'other'
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Volunteer Hub 🤝
        </Typography>
        <Box display="flex" gap={2}>
          {!user?.isVolunteer && (
            <Button
              variant="contained"
              startIcon={<VolunteerActivism />}
              onClick={() => setOpenVolunteerDialog(true)}
            >
              Become Volunteer
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenRequestDialog(true)}
          >
            Request Help
          </Button>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Find Volunteers" />
        <Tab label="Help Requests" />
        {user?.isVolunteer && <Tab label="My Volunteer Work" />}
      </Tabs>

      {/* Find Volunteers Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Available Volunteers Near You
          </Typography>
          {volunteers.length === 0 ? (
            <Alert severity="info">
              No volunteers found in your area. Consider becoming one!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {volunteers.map((volunteer) => (
                <Grid item xs={12} md={6} key={volunteer._id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{volunteer.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Volunteer
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" gutterBottom>Skills:</Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {volunteer.volunteerProfile?.skills?.map((skill) => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                        </Box>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Schedule fontSize="small" />
                        <Typography variant="body2">
                          Available: {volunteer.volunteerProfile?.availability || 'Not specified'}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">
                          Within {volunteer.volunteerProfile?.radius || 10}km
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        startIcon={<Help />}
                      >
                        Request Help
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Help Requests Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            People Need Your Help
          </Typography>
          {requests.length === 0 ? (
            <Alert severity="info">
              No help requests in your area at the moment.
            </Alert>
          ) : (
            <List>
              {requests.map((request) => (
                <ListItem key={request._id} sx={{ mb: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getUrgencyColor(request.urgency) + '.main' }}>
                      <Help />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">{request.title}</Typography>
                        <Chip 
                          label={request.urgency} 
                          color={getUrgencyColor(request.urgency)}
                          size="small"
                        />
                        <Chip 
                          label={request.type} 
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" paragraph>
                          {request.description}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body2" color="text.secondary">
                            📍 {request.location?.address || 'Location provided'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            🕒 {new Date(request.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        {request.skillsNeeded?.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="body2" gutterBottom>Skills needed:</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {request.skillsNeeded.map((skill) => (
                                <Chip key={skill} label={skill} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ mt: 2 }}
                          startIcon={<CheckCircle />}
                        >
                          I Can Help
                        </Button>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* My Volunteer Work Tab */}
      {activeTab === 2 && user?.isVolunteer && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Volunteer Activities
          </Typography>
          <Alert severity="info">
            Your volunteer history and current assignments will appear here.
          </Alert>
        </Box>
      )}

      {/* Request Help Dialog */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Volunteer Help</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Type of Help</InputLabel>
              <Select
                value={requestForm.type}
                label="Type of Help"
                onChange={(e) => setRequestForm({...requestForm, type: e.target.value})}
              >
                {requestTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Title"
              value={requestForm.title}
              onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={requestForm.description}
              onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
            />

            <FormControl fullWidth>
              <InputLabel>Urgency</InputLabel>
              <Select
                value={requestForm.urgency}
                label="Urgency"
                onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRequest} variant="contained">Submit Request</Button>
        </DialogActions>
      </Dialog>

      {/* Volunteer Registration Dialog */}
      <Dialog open={openVolunteerDialog} onClose={() => setOpenVolunteerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Become a Volunteer</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Skills</InputLabel>
              <Select
                multiple
                value={volunteerForm.skills}
                label="Skills"
                onChange={(e) => setVolunteerForm({...volunteerForm, skills: e.target.value})}
              >
                {skillOptions.map((skill) => (
                  <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Availability"
              placeholder="e.g., Weekends, Evenings, Always"
              value={volunteerForm.availability}
              onChange={(e) => setVolunteerForm({...volunteerForm, availability: e.target.value})}
            />

            <TextField
              fullWidth
              label="Service Radius (km)"
              type="number"
              value={volunteerForm.radius}
              onChange={(e) => setVolunteerForm({...volunteerForm, radius: parseInt(e.target.value)})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVolunteerDialog(false)}>Cancel</Button>
          <Button onClick={handleRegisterVolunteer} variant="contained">Register</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Volunteers;