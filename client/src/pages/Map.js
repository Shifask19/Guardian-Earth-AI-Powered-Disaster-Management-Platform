import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Warning, LocationOn, Home } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const { user } = useAuth();
  const [disasters, setDisasters] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [showDisasters, setShowDisasters] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const center = user?.location ? 
    [user.location.coordinates[1], user.location.coordinates[0]] : 
    [40.7128, -74.0060]; // Default to NYC

  useEffect(() => {
    if (user?.location) {
      fetchMapData();
    }
  }, [user]);

  const fetchMapData = async () => {
    try {
      const [disastersRes] = await Promise.all([
        axios.get(`/api/disasters/nearby?lat=${user.location.coordinates[1]}&lng=${user.location.coordinates[0]}&radius=100`)
      ]);

      setDisasters(disastersRes.data);
      
      // Mock shelter data
      setShelters([
        {
          id: 1,
          name: 'Community Center Shelter',
          location: { coordinates: [center[1] + 0.01, center[0] + 0.01] },
          capacity: 200,
          available: true,
          contact: '555-0123'
        },
        {
          id: 2,
          name: 'School Emergency Shelter',
          location: { coordinates: [center[1] - 0.01, center[0] - 0.01] },
          capacity: 150,
          available: true,
          contact: '555-0124'
        }
      ]);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisasterIcon = (type, severity) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#9C27B0'
    };

    return new L.DivIcon({
      html: `<div style="background-color: ${colors[severity] || '#FF9800'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">⚠</div>`,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const getShelterIcon = () => {
    return new L.DivIcon({
      html: `<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">🏠</div>`,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const filteredDisasters = disasters.filter(disaster => 
    filterType === 'all' || disaster.type === filterType
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading map...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Interactive Disaster Map
      </Typography>

      {/* Map Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              label="Filter Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Disasters</MenuItem>
              <MenuItem value="flood">Floods</MenuItem>
              <MenuItem value="cyclone">Cyclones</MenuItem>
              <MenuItem value="earthquake">Earthquakes</MenuItem>
              <MenuItem value="landslide">Landslides</MenuItem>
              <MenuItem value="fire">Fires</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showDisasters}
                onChange={(e) => setShowDisasters(e.target.checked)}
              />
            }
            label="Show Disasters"
          />

          <FormControlLabel
            control={
              <Switch
                checked={showShelters}
                onChange={(e) => setShowShelters(e.target.checked)}
              />
            }
            label="Show Shelters"
          />

          <Box display="flex" gap={1}>
            <Chip size="small" label="🟢 Low Risk" />
            <Chip size="small" label="🟡 Medium Risk" />
            <Chip size="small" label="🔴 High Risk" />
            <Chip size="small" label="🟣 Critical" />
          </Box>
        </Box>
      </Paper>

      {/* Map */}
      <Paper sx={{ height: 600, overflow: 'hidden' }}>
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location */}
          {user?.location && (
            <Marker position={center}>
              <Popup>
                <div>
                  <Typography variant="subtitle2">Your Location</Typography>
                  <Typography variant="body2">
                    {user.location.address || 'Current Position'}
                  </Typography>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Disasters */}
          {showDisasters && filteredDisasters.map((disaster) => (
            <React.Fragment key={disaster._id}>
              <Marker
                position={[disaster.location.coordinates[1], disaster.location.coordinates[0]]}
                icon={getDisasterIcon(disaster.type, disaster.severity)}
              >
                <Popup>
                  <div>
                    <Typography variant="subtitle2" color="error">
                      {disaster.type.toUpperCase()} - {disaster.severity.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      Status: {disaster.status}
                    </Typography>
                    {disaster.prediction?.expectedTime && (
                      <Typography variant="body2">
                        Expected: {new Date(disaster.prediction.expectedTime).toLocaleString()}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      Confidence: {Math.round((disaster.prediction?.confidence || 0) * 100)}%
                    </Typography>
                  </div>
                </Popup>
              </Marker>
              
              {/* Affected Area Circle */}
              <Circle
                center={[disaster.location.coordinates[1], disaster.location.coordinates[0]]}
                radius={disaster.affectedArea?.radius * 1000 || 5000}
                pathOptions={{
                  color: disaster.severity === 'critical' ? '#9C27B0' : 
                         disaster.severity === 'high' ? '#F44336' :
                         disaster.severity === 'medium' ? '#FF9800' : '#4CAF50',
                  fillOpacity: 0.1
                }}
              />
            </React.Fragment>
          ))}

          {/* Shelters */}
          {showShelters && shelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.location.coordinates[1], shelter.location.coordinates[0]]}
              icon={getShelterIcon()}
            >
              <Popup>
                <div>
                  <Typography variant="subtitle2" color="primary">
                    {shelter.name}
                  </Typography>
                  <Typography variant="body2">
                    Capacity: {shelter.capacity}
                  </Typography>
                  <Typography variant="body2">
                    Status: {shelter.available ? 'Available' : 'Full'}
                  </Typography>
                  <Typography variant="body2">
                    Contact: {shelter.contact}
                  </Typography>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Paper>

      {/* Legend */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Map Legend
          </Typography>
          <Box display="flex" gap={3} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn color="primary" />
              <Typography variant="body2">Your Location</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Warning color="error" />
              <Typography variant="body2">Disaster Zones</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Home color="info" />
              <Typography variant="body2">Emergency Shelters</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Map;