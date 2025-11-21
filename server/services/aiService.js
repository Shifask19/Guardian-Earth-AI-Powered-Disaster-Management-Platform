const axios = require('axios');
const cron = require('node-cron');
const Disaster = require('../models/Disaster');
const Alert = require('../models/Alert');
const User = require('../models/User');

class AIService {
  constructor() {
    this.weatherApiKey = process.env.WEATHER_API_KEY;
    this.aiModelEndpoint = process.env.AI_MODEL_ENDPOINT || 'http://localhost:8000';
    this.predictionThreshold = parseFloat(process.env.PREDICTION_THRESHOLD) || 0.7;
    
    // Start prediction cron job (every 30 minutes)
    this.startPredictionScheduler();
  }

  async getWeatherData(lat, lon) {
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.weatherApiKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  async predictDisasters(lat, lon) {
    try {
      // Call Python AI prediction server
      const aiServerUrl = process.env.AI_MODEL_ENDPOINT || 'http://localhost:8000';
      
      try {
        const response = await axios.post(`${aiServerUrl}/predict`, {
          latitude: lat,
          longitude: lon,
          disaster_types: ['flood', 'cyclone', 'earthquake', 'landslide', 'wildfire']
        }, {
          timeout: 10000
        });
        
        if (response.data && response.data.predictions) {
          const predictions = {};
          
          for (const [disasterType, prediction] of Object.entries(response.data.predictions)) {
            predictions[disasterType] = {
              probability: prediction.probability,
              riskLevel: prediction.risk_level,
              confidence: prediction.confidence,
              modelPredictions: prediction.model_predictions
            };
          }
          
          console.log(`✅ AI Predictions for (${lat}, ${lon}):`, 
                     Object.keys(predictions).map(k => `${k}: ${predictions[k].probability.toFixed(3)}`).join(', '));
          
          return predictions;
        }
      } catch (aiError) {
        console.warn('⚠️  AI server unavailable, using fallback predictions:', aiError.message);
      }
      
      // Fallback: Use weather-based predictions if AI server is unavailable
      const weatherData = await this.getWeatherData(lat, lon);
      
      if (!weatherData) {
        return null;
      }

      const predictions = {};
      const temp = weatherData.main.temp;
      const humidity = weatherData.main.humidity;
      const windSpeed = weatherData.wind?.speed || 0;
      const rainfall = weatherData.rain?.['1h'] || 0;

      // Flood prediction logic
      predictions.flood = {
        probability: Math.min(0.9, (rainfall * 0.1 + humidity * 0.005)),
        riskLevel: this.getRiskLevel(rainfall * 0.1 + humidity * 0.005),
        confidence: 0.65
      };

      // Cyclone prediction logic
      predictions.cyclone = {
        probability: Math.min(0.9, (windSpeed * 0.05 + (humidity > 80 ? 0.3 : 0))),
        riskLevel: this.getRiskLevel(windSpeed * 0.05),
        confidence: 0.60
      };

      // Earthquake prediction (basic)
      predictions.earthquake = {
        probability: Math.random() * 0.3, // Placeholder
        riskLevel: 'low',
        confidence: 0.50
      };

      // Landslide prediction
      predictions.landslide = {
        probability: Math.min(0.9, rainfall * 0.08),
        riskLevel: this.getRiskLevel(rainfall * 0.08),
        confidence: 0.55
      };

      // Wildfire prediction
      predictions.wildfire = {
        probability: temp > 30 && humidity < 40 ? Math.min(0.9, (temp - 25) * 0.05) : 0,
        riskLevel: this.getRiskLevel(temp > 30 && humidity < 40 ? (temp - 25) * 0.05 : 0),
        confidence: 0.60
      };

      return predictions;
    } catch (error) {
      console.error('Error predicting disasters:', error);
      return null;
    }
  }

  getRiskLevel(probability) {
    if (probability < 0.2) return 'low';
    if (probability < 0.5) return 'medium';
    if (probability < 0.8) return 'high';
    return 'critical';
  }

  async processLocationPredictions(lat, lon) {
    const predictions = await this.predictDisasters(lat, lon);
    
    if (!predictions) return;

    for (const [disasterType, prediction] of Object.entries(predictions)) {
      if (prediction.probability > this.predictionThreshold) {
        await this.createDisasterPrediction(lat, lon, disasterType, prediction);
      }
    }
  }

  async createDisasterPrediction(lat, lon, type, prediction) {
    try {
      // Check if similar prediction already exists
      const existingDisaster = await Disaster.findOne({
        type,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            $maxDistance: 10000 // 10km radius
          }
        },
        status: 'predicted',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      if (existingDisaster) {
        // Update existing prediction
        existingDisaster.prediction.confidence = prediction.confidence;
        existingDisaster.prediction.predictedAt = new Date();
        await existingDisaster.save();
        return existingDisaster;
      }

      // Create new disaster prediction
      const disaster = new Disaster({
        type,
        severity: prediction.riskLevel,
        status: 'predicted',
        location: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        prediction: {
          confidence: prediction.confidence,
          predictedAt: new Date(),
          expectedTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
          aiModel: 'guardian-earth-v1',
          dataSource: ['weather-api', 'satellite-data']
        },
        affectedArea: {
          radius: this.getAffectedRadius(type, prediction.riskLevel),
          description: `Predicted ${type} in the area`
        }
      });

      await disaster.save();

      // Create alert for nearby users
      await this.createAlert(disaster);

      return disaster;
    } catch (error) {
      console.error('Error creating disaster prediction:', error);
    }
  }

  getAffectedRadius(type, severity) {
    const baseRadius = {
      flood: 5,
      cyclone: 50,
      earthquake: 100,
      landslide: 2,
      heatwave: 20
    };

    const multiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      critical: 2
    };

    return (baseRadius[type] || 10) * (multiplier[severity] || 1);
  }

  async createAlert(disaster) {
    try {
      const alert = new Alert({
        disaster: disaster._id,
        type: disaster.severity === 'critical' ? 'emergency' : 'warning',
        severity: disaster.severity,
        title: `${disaster.type.toUpperCase()} Alert`,
        message: `A ${disaster.type} has been predicted in your area. Expected time: ${disaster.prediction.expectedTime.toLocaleString()}. Please stay alert and follow safety guidelines.`,
        location: disaster.location,
        affectedRadius: disaster.affectedArea.radius,
        channels: ['push', 'email'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        actionItems: this.getActionItems(disaster.type)
      });

      await alert.save();

      // Find users in affected area and send notifications
      await this.notifyAffectedUsers(alert);

      return alert;
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  getActionItems(disasterType) {
    const actionItems = {
      flood: [
        { action: 'Move to higher ground', priority: 'high', description: 'Evacuate low-lying areas immediately' },
        { action: 'Avoid flood waters', priority: 'high', description: 'Do not walk or drive through flood waters' },
        { action: 'Monitor updates', priority: 'medium', description: 'Stay tuned to emergency broadcasts' }
      ],
      cyclone: [
        { action: 'Secure property', priority: 'high', description: 'Bring in outdoor furniture and secure loose objects' },
        { action: 'Stock supplies', priority: 'high', description: 'Ensure you have water, food, and batteries' },
        { action: 'Stay indoors', priority: 'high', description: 'Remain inside during the storm' }
      ],
      earthquake: [
        { action: 'Drop, Cover, Hold', priority: 'high', description: 'Practice earthquake safety procedures' },
        { action: 'Secure heavy items', priority: 'medium', description: 'Secure furniture and appliances' },
        { action: 'Know evacuation routes', priority: 'medium', description: 'Plan multiple exit routes' }
      ]
    };

    return actionItems[disasterType] || [];
  }

  async notifyAffectedUsers(alert) {
    try {
      const users = await User.find({
        location: {
          $near: {
            $geometry: alert.location,
            $maxDistance: alert.affectedRadius * 1000 // Convert km to meters
          }
        }
      });

      // In a real implementation, this would send actual notifications
      console.log(`Notifying ${users.length} users about ${alert.title}`);

      // Update alert with sent notifications
      alert.sentTo = users.map(user => ({
        user: user._id,
        channel: 'push',
        sentAt: new Date(),
        delivered: true
      }));

      await alert.save();
    } catch (error) {
      console.error('Error notifying users:', error);
    }
  }

  startPredictionScheduler() {
    // Run predictions every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('Running disaster predictions...');
      
      try {
        // Get unique locations from active users
        const locations = await User.aggregate([
          { $match: { location: { $exists: true } } },
          { $group: { 
            _id: null, 
            locations: { $addToSet: '$location.coordinates' } 
          }}
        ]);

        if (locations.length > 0) {
          for (const coords of locations[0].locations) {
            await this.processLocationPredictions(coords[1], coords[0]);
          }
        }
      } catch (error) {
        console.error('Error in prediction scheduler:', error);
      }
    });

    console.log('✅ AI prediction scheduler started');
  }
}

module.exports = new AIService();