const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../server/models/User');
const Disaster = require('../server/models/Disaster');
const { Campaign } = require('../server/models/Donation');
const News = require('../server/models/News');
const { Community } = require('../server/models/Community');
const { Training, Resource } = require('../server/models/Preparedness');

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guardian-earth');
    console.log('✅ Connected to MongoDB');

    // Create sample admin user
    let adminUser = await User.findOne({ email: 'admin@guardianearth.com' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Guardian Earth Admin',
        email: 'admin@guardianearth.com',
        password: 'admin123',
        phone: '+1234567890',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128], // New York City
          address: 'New York, NY, USA'
        },
        preferences: {
          language: 'en',
          alertTypes: ['flood', 'cyclone', 'earthquake', 'landslide', 'fire'],
          notificationMethods: ['email', 'push']
        },
        isVolunteer: true,
        volunteerProfile: {
          skills: ['first-aid', 'rescue', 'medical', 'logistics'],
          availability: 'always',
          radius: 50
        },
        preparednessScore: 85
      });

      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample disaster data
    const sampleDisasters = [
      {
        type: 'flood',
        severity: 'high',
        status: 'predicted',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128]
        },
        prediction: {
          confidence: 0.85,
          predictedAt: new Date(),
          expectedTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          aiModel: 'guardian-earth-v1'
        },
        affectedArea: {
          radius: 10,
          population: 50000,
          description: 'Heavy rainfall expected in Manhattan area'
        }
      },
      {
        type: 'cyclone',
        severity: 'medium',
        status: 'predicted',
        location: {
          type: 'Point',
          coordinates: [-80.1918, 25.7617] // Miami
        },
        prediction: {
          confidence: 0.72,
          predictedAt: new Date(),
          expectedTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          aiModel: 'guardian-earth-v1'
        },
        affectedArea: {
          radius: 100,
          population: 200000,
          description: 'Tropical storm developing in the Atlantic'
        }
      }
    ];

    for (const disasterData of sampleDisasters) {
      const exists = await Disaster.findOne({
        type: disasterData.type,
        location: disasterData.location
      });
      
      if (!exists) {
        const disaster = new Disaster(disasterData);
        await disaster.save();
        console.log(`✅ Sample ${disasterData.type} disaster created`);
      }
    }

    // Create sample relief campaigns
    const sampleCampaigns = [
      {
        title: 'Hurricane Relief Fund',
        description: 'Emergency relief for hurricane victims in Florida. Funds will be used for temporary shelter, food, and medical supplies.',
        organizer: adminUser._id,
        goal: {
          amount: 100000,
          items: [
            { name: 'Water bottles', quantity: 10000, unit: 'bottles' },
            { name: 'Emergency food kits', quantity: 5000, unit: 'kits' },
            { name: 'Blankets', quantity: 2000, unit: 'pieces' }
          ]
        },
        status: 'active',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        images: ['/images/hurricane-relief.jpg']
      },
      {
        title: 'Earthquake Emergency Response',
        description: 'Immediate response fund for earthquake victims. Supporting rescue operations and medical aid.',
        organizer: adminUser._id,
        goal: {
          amount: 75000,
          items: [
            { name: 'Medical supplies', quantity: 1000, unit: 'kits' },
            { name: 'Rescue equipment', quantity: 50, unit: 'sets' }
          ]
        },
        status: 'active',
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        images: ['/images/earthquake-relief.jpg']
      }
    ];

    for (const campaignData of sampleCampaigns) {
      const exists = await Campaign.findOne({ title: campaignData.title });
      if (!exists) {
        const campaign = new Campaign(campaignData);
        await campaign.save();
        console.log(`✅ Sample campaign "${campaignData.title}" created`);
      }
    }

    // Create sample news articles
    const sampleNews = [
      {
        title: 'Hurricane Alert: Category 4 Storm Approaching Florida Coast',
        content: 'A powerful Category 4 hurricane is expected to make landfall along the Florida coast within the next 48 hours. Residents in evacuation zones are urged to leave immediately. The storm brings winds of up to 150 mph and life-threatening storm surge.',
        summary: 'Category 4 hurricane approaching Florida with 150 mph winds. Immediate evacuation required for coastal areas.',
        category: 'breaking',
        disasterType: 'cyclone',
        location: {
          type: 'Point',
          coordinates: [-80.1918, 25.7617],
          country: 'USA',
          region: 'Florida',
          city: 'Miami'
        },
        severity: 'critical',
        source: {
          name: 'National Hurricane Center',
          url: 'https://nhc.noaa.gov',
          credibility: 10
        },
        isBreaking: true,
        isVerified: true,
        verifiedBy: adminUser._id,
        tags: ['hurricane', 'evacuation', 'florida', 'emergency'],
        translations: [
          {
            language: 'es',
            title: 'Alerta de Huracán: Tormenta Categoría 4 se Acerca a la Costa de Florida',
            content: 'Un poderoso huracán de categoría 4 se espera que toque tierra en la costa de Florida en las próximas 48 horas.',
            summary: 'Huracán categoría 4 se acerca a Florida con vientos de 150 mph. Se requiere evacuación inmediata.'
          }
        ]
      },
      {
        title: 'Earthquake Preparedness: New Early Warning System Launched',
        content: 'Scientists have developed a new earthquake early warning system that can provide up to 60 seconds of advance notice before strong shaking begins. The system uses AI to analyze seismic data in real-time.',
        summary: 'New AI-powered earthquake warning system provides 60 seconds advance notice.',
        category: 'update',
        disasterType: 'earthquake',
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          country: 'USA',
          region: 'California',
          city: 'Los Angeles'
        },
        severity: 'medium',
        source: {
          name: 'USGS',
          url: 'https://usgs.gov',
          credibility: 9
        },
        isVerified: true,
        verifiedBy: adminUser._id,
        tags: ['earthquake', 'technology', 'preparedness', 'ai']
      },
      {
        title: 'Flood Recovery Efforts Continue in Pakistan',
        content: 'International aid organizations continue relief efforts in Pakistan following devastating floods that affected over 33 million people. Clean water and medical supplies remain the top priorities.',
        summary: 'Recovery efforts ongoing in Pakistan after floods affected 33 million people.',
        category: 'recovery',
        disasterType: 'flood',
        location: {
          type: 'Point',
          coordinates: [69.3451, 30.3753],
          country: 'Pakistan',
          region: 'Sindh'
        },
        severity: 'high',
        source: {
          name: 'UN OCHA',
          url: 'https://unocha.org',
          credibility: 9
        },
        isVerified: true,
        verifiedBy: adminUser._id,
        tags: ['flood', 'pakistan', 'recovery', 'aid']
      }
    ];

    for (const newsData of sampleNews) {
      const exists = await News.findOne({ title: newsData.title });
      if (!exists) {
        const article = new News(newsData);
        await article.save();
        console.log(`✅ Sample news article "${newsData.title.substring(0, 50)}..." created`);
      }
    }

    // Create sample communities
    const sampleCommunities = [
      {
        name: 'New York Disaster Preparedness',
        description: 'Community for NYC residents to share disaster preparedness tips and coordinate emergency response',
        type: 'city',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
          city: 'New York',
          region: 'New York',
          country: 'USA'
        },
        creator: adminUser._id,
        admins: [adminUser._id],
        members: [{
          user: adminUser._id,
          role: 'admin',
          joinedAt: new Date()
        }],
        memberCount: 1,
        settings: {
          isPublic: true,
          requireApproval: false,
          allowPosts: true,
          allowEvents: true
        },
        tags: ['preparedness', 'emergency', 'nyc']
      },
      {
        name: 'Earthquake Safety Network',
        description: 'Learn and share earthquake safety practices and early warning information',
        type: 'disaster-specific',
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          city: 'Los Angeles',
          region: 'California',
          country: 'USA'
        },
        creator: adminUser._id,
        admins: [adminUser._id],
        members: [{
          user: adminUser._id,
          role: 'admin',
          joinedAt: new Date()
        }],
        memberCount: 1,
        tags: ['earthquake', 'safety', 'california']
      }
    ];

    for (const communityData of sampleCommunities) {
      const exists = await Community.findOne({ name: communityData.name });
      if (!exists) {
        const community = new Community(communityData);
        await community.save();
        console.log(`✅ Sample community "${communityData.name}" created`);
      }
    }

    // Create sample training modules
    const sampleTrainings = [
      {
        title: 'First Aid Basics',
        description: 'Learn essential first aid skills for emergency situations',
        category: 'first-aid',
        type: 'video',
        content: {
          videoUrl: 'https://example.com/first-aid-video',
          steps: [
            { title: 'Check the scene', description: 'Ensure the area is safe before approaching', duration: 2 },
            { title: 'Call for help', description: 'Dial emergency services immediately', duration: 1 },
            { title: 'Provide care', description: 'Administer appropriate first aid', duration: 5 }
          ]
        },
        duration: 30,
        difficulty: 'beginner',
        language: 'en',
        tags: ['first-aid', 'emergency', 'medical'],
        rating: { average: 4.5, count: 120 }
      },
      {
        title: 'Earthquake Safety: Drop, Cover, Hold On',
        description: 'Master the essential earthquake safety technique',
        category: 'earthquake',
        type: 'interactive',
        content: {
          steps: [
            { title: 'Drop', description: 'Drop to your hands and knees', duration: 1 },
            { title: 'Cover', description: 'Cover your head and neck under a sturdy table', duration: 2 },
            { title: 'Hold On', description: 'Hold on until shaking stops', duration: 3 }
          ]
        },
        duration: 15,
        difficulty: 'beginner',
        language: 'en',
        tags: ['earthquake', 'safety', 'drill'],
        rating: { average: 4.8, count: 250 }
      },
      {
        title: 'Fire Safety and Evacuation',
        description: 'Learn how to safely evacuate during a fire emergency',
        category: 'fire-safety',
        type: 'course',
        content: {
          steps: [
            { title: 'Stay low', description: 'Crawl low under smoke', duration: 2 },
            { title: 'Feel doors', description: 'Check if doors are hot before opening', duration: 2 },
            { title: 'Exit quickly', description: 'Leave immediately, don\'t stop for belongings', duration: 3 },
            { title: 'Meet outside', description: 'Go to designated meeting point', duration: 2 }
          ]
        },
        duration: 25,
        difficulty: 'beginner',
        language: 'en',
        tags: ['fire', 'evacuation', 'safety'],
        rating: { average: 4.6, count: 180 }
      }
    ];

    for (const trainingData of sampleTrainings) {
      const exists = await Training.findOne({ title: trainingData.title });
      if (!exists) {
        const training = new Training(trainingData);
        await training.save();
        console.log(`✅ Sample training "${trainingData.title}" created`);
      }
    }

    // Create sample resources
    const sampleResources = [
      {
        title: 'Emergency Kit Checklist',
        description: 'Complete checklist for building your emergency kit',
        category: 'checklist',
        disasterType: 'general',
        content: {
          fileUrl: 'https://example.com/emergency-kit-checklist.pdf',
          text: 'Essential items for your emergency kit...'
        },
        language: 'en',
        tags: ['checklist', 'emergency-kit', 'preparedness'],
        isOfficial: true,
        source: 'FEMA',
        downloadCount: 1500
      },
      {
        title: 'Family Emergency Plan Template',
        description: 'Template to create your family emergency communication plan',
        category: 'template',
        disasterType: 'general',
        content: {
          fileUrl: 'https://example.com/family-plan-template.pdf'
        },
        language: 'en',
        tags: ['template', 'family-plan', 'communication'],
        isOfficial: true,
        source: 'Red Cross',
        downloadCount: 2300
      },
      {
        title: 'Flood Safety Guide',
        description: 'Comprehensive guide to staying safe during floods',
        category: 'guide',
        disasterType: 'flood',
        content: {
          fileUrl: 'https://example.com/flood-safety-guide.pdf'
        },
        language: 'en',
        tags: ['flood', 'safety', 'guide'],
        isOfficial: true,
        source: 'NOAA',
        downloadCount: 890
      }
    ];

    for (const resourceData of sampleResources) {
      const exists = await Resource.findOne({ title: resourceData.title });
      if (!exists) {
        const resource = new Resource(resourceData);
        await resource.save();
        console.log(`✅ Sample resource "${resourceData.title}" created`);
      }
    }

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run setup
setupDatabase();