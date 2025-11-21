import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  Grid,
  LinearProgress,
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  MonetizationOn,
  Inventory,
  Handyman,
  Add,
  Visibility,
  TrendingUp,
  People,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Donations = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [openDonateDialog, setOpenDonateDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [donationForm, setDonationForm] = useState({
    type: 'money',
    amount: '',
    items: [],
    message: '',
    isAnonymous: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, donationsRes] = await Promise.all([
        axios.get('/api/donations/campaigns'),
        user ? axios.get('/api/donations/my-donations') : Promise.resolve({ data: [] })
      ]);

      setCampaigns(campaignsRes.data);
      setMyDonations(donationsRes.data);
    } catch (error) {
      console.error('Error fetching donation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    try {
      const donationData = {
        campaignId: selectedCampaign._id,
        ...donationForm
      };

      await axios.post('/api/donations', donationData);
      setOpenDonateDialog(false);
      setDonationForm({
        type: 'money',
        amount: '',
        items: [],
        message: '',
        isAnonymous: false
      });
      fetchData(); // Refresh data
      alert('Thank you for your donation! 🙏');
    } catch (error) {
      console.error('Error making donation:', error);
    }
  };

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const CampaignCard = ({ campaign }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {campaign.images && campaign.images[0] && (
        <CardMedia
          component="img"
          height="200"
          image={campaign.images[0]}
          alt={campaign.title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {campaign.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {campaign.description.substring(0, 150)}...
        </Typography>

        {/* Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">
              {formatCurrency(campaign.raised?.amount || 0)} raised
            </Typography>
            <Typography variant="body2">
              Goal: {formatCurrency(campaign.goal?.amount || 0)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage(campaign.raised?.amount || 0, campaign.goal?.amount || 1)}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {campaign.raised?.donors || 0} donors
          </Typography>
        </Box>

        {/* Status and Type */}
        <Box display="flex" gap={1} mb={2}>
          <Chip 
            label={campaign.status} 
            color={campaign.status === 'active' ? 'success' : 'default'}
            size="small"
          />
          {campaign.disaster && (
            <Chip 
              label={campaign.disaster.type} 
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<MonetizationOn />}
            onClick={() => {
              setSelectedCampaign(campaign);
              setOpenDonateDialog(true);
            }}
            fullWidth
          >
            Donate
          </Button>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => setSelectedCampaign(campaign)}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

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
          Relief Donations 💧
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => alert('Campaign creation coming soon!')}
        >
          Create Campaign
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Active Campaigns" />
        <Tab label="My Donations" />
        <Tab label="Impact Reports" />
      </Tabs>

      {/* Active Campaigns Tab */}
      {activeTab === 0 && (
        <Box>
          {campaigns.length === 0 ? (
            <Alert severity="info">
              No active campaigns at the moment. Check back later!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {campaigns.map((campaign) => (
                <Grid item xs={12} md={6} lg={4} key={campaign._id}>
                  <CampaignCard campaign={campaign} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* My Donations Tab */}
      {activeTab === 1 && (
        <Box>
          {!user ? (
            <Alert severity="warning">
              Please log in to view your donation history.
            </Alert>
          ) : myDonations.length === 0 ? (
            <Alert severity="info">
              You haven't made any donations yet. Consider supporting a cause!
            </Alert>
          ) : (
            <List>
              {myDonations.map((donation) => (
                <ListItem key={donation._id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                  <ListItemIcon>
                    {donation.type === 'money' ? <MonetizationOn color="primary" /> :
                     donation.type === 'supplies' ? <Inventory color="secondary" /> :
                     <Handyman color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">
                          {donation.campaign?.title || 'General Donation'}
                        </Typography>
                        <Chip 
                          label={donation.status} 
                          color={donation.status === 'confirmed' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {donation.type === 'money' 
                            ? `Amount: ${formatCurrency(donation.amount)}`
                            : `Items: ${donation.items?.length || 0} items`
                          }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {new Date(donation.createdAt).toLocaleDateString()}
                        </Typography>
                        {donation.message && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            "{donation.message}"
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* Impact Reports Tab */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" color="primary">
                    $2.5M
                  </Typography>
                  <Typography variant="body2">
                    Total Raised This Year
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h4" color="secondary">
                    15,000
                  </Typography>
                  <Typography variant="body2">
                    People Helped
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" color="success.main">
                    98%
                  </Typography>
                  <Typography variant="body2">
                    Funds Directly Used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Impact Stories
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🏠 <strong>Hurricane Relief Fund</strong> provided temporary shelter for 500 families in Florida
                </Typography>
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🚑 <strong>Earthquake Response</strong> delivered medical supplies to 12 affected communities
                </Typography>
              </Alert>
              <Alert severity="success">
                <Typography variant="body2">
                  💧 <strong>Flood Relief</strong> distributed clean water to 2,000 people in affected areas
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Donation Dialog */}
      <Dialog open={openDonateDialog} onClose={() => setOpenDonateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Make a Donation
          {selectedCampaign && (
            <Typography variant="body2" color="text.secondary">
              to {selectedCampaign.title}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Donation Type</InputLabel>
              <Select
                value={donationForm.type}
                label="Donation Type"
                onChange={(e) => setDonationForm({...donationForm, type: e.target.value})}
              >
                <MenuItem value="money">Money</MenuItem>
                <MenuItem value="supplies">Supplies</MenuItem>
                <MenuItem value="services">Services</MenuItem>
              </Select>
            </FormControl>

            {donationForm.type === 'money' && (
              <TextField
                fullWidth
                label="Amount ($)"
                type="number"
                value={donationForm.amount}
                onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
              />
            )}

            <TextField
              fullWidth
              label="Message (Optional)"
              multiline
              rows={3}
              value={donationForm.message}
              onChange={(e) => setDonationForm({...donationForm, message: e.target.value})}
              placeholder="Leave a message of support..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDonateDialog(false)}>Cancel</Button>
          <Button onClick={handleDonate} variant="contained">
            Donate {donationForm.type === 'money' && donationForm.amount ? `$${donationForm.amount}` : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Details Dialog */}
      {selectedCampaign && !openDonateDialog && (
        <Dialog 
          open={Boolean(selectedCampaign)} 
          onClose={() => setSelectedCampaign(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedCampaign.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              {selectedCampaign.description}
            </Typography>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Progress</Typography>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage(selectedCampaign.raised?.amount || 0, selectedCampaign.goal?.amount || 1)}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="body2">
                  {formatCurrency(selectedCampaign.raised?.amount || 0)} raised
                </Typography>
                <Typography variant="body2">
                  Goal: {formatCurrency(selectedCampaign.goal?.amount || 0)}
                </Typography>
              </Box>
            </Box>

            {selectedCampaign.transparency && (
              <Box>
                <Typography variant="h6" gutterBottom>Transparency Report</Typography>
                <Typography variant="body2">
                  Beneficiaries: {selectedCampaign.transparency.beneficiaries || 'TBD'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
            <Button 
              variant="contained"
              onClick={() => setOpenDonateDialog(true)}
              startIcon={<MonetizationOn />}
            >
              Donate Now
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Donations;