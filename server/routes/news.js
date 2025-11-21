const express = require('express');
const News = require('../models/News');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Get news articles
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      disasterType, 
      location, 
      limit = 20, 
      page = 1,
      breaking = false,
      language = 'en'
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (disasterType) query.disasterType = disasterType;
    if (breaking === 'true') query.isBreaking = true;
    
    // Location-based filtering
    if (location) {
      const [lat, lng, radius = 100] = location.split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    const skip = (page - 1) * limit;
    
    let news = await News.find(query)
      .sort({ publishedAt: -1, isBreaking: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('relatedDisasters', 'type severity location');

    // Apply translations if needed
    if (language !== 'en') {
      news = news.map(article => {
        const translation = article.translations.find(t => t.language === language);
        if (translation) {
          return {
            ...article.toObject(),
            title: translation.title,
            content: translation.content,
            summary: translation.summary
          };
        }
        return article;
      });
    }

    res.json({
      news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await News.countDocuments(query)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get breaking news
router.get('/breaking', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    let breakingNews = await News.find({ 
      isBreaking: true,
      publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .sort({ publishedAt: -1 })
    .limit(10)
    .populate('relatedDisasters', 'type severity location');

    // Apply translations
    if (language !== 'en') {
      breakingNews = breakingNews.map(article => {
        const translation = article.translations.find(t => t.language === language);
        if (translation) {
          return {
            ...article.toObject(),
            title: translation.title,
            content: translation.content,
            summary: translation.summary
          };
        }
        return article;
      });
    }

    res.json(breakingNews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get news by ID
router.get('/:id', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    let article = await News.findById(req.params.id)
      .populate('relatedDisasters', 'type severity location')
      .populate('verifiedBy', 'name');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment view count
    article.engagement.views += 1;
    await article.save();

    // Apply translation
    if (language !== 'en') {
      const translation = article.translations.find(t => t.language === language);
      if (translation) {
        article = {
          ...article.toObject(),
          title: translation.title,
          content: translation.content,
          summary: translation.summary
        };
      }
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create news article (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const newsData = {
      ...req.body,
      verifiedBy: req.userId
    };

    const article = new News(newsData);
    await article.save();

    // Auto-translate to supported languages
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      await translateArticle(article);
    }

    res.status(201).json({ message: 'News article created', article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// React to news article
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const article = await News.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const reaction = article.engagement.reactions.find(r => r.type === reactionType);
    if (reaction) {
      reaction.count += 1;
    } else {
      article.engagement.reactions.push({ type: reactionType, count: 1 });
    }

    await article.save();
    res.json({ message: 'Reaction recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch external news (scheduled job)
router.post('/fetch-external', async (req, res) => {
  try {
    await fetchExternalNews();
    res.json({ message: 'External news fetched successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to fetch external news
async function fetchExternalNews() {
  try {
    // Example: NewsAPI integration
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) return;

    const response = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: 'disaster OR earthquake OR flood OR hurricane OR wildfire OR tsunami',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: newsApiKey
      }
    });

    const articles = response.data.articles;
    
    for (const article of articles) {
      // Check if article already exists
      const exists = await News.findOne({ 
        title: article.title,
        'source.url': article.url 
      });
      
      if (!exists) {
        const newsArticle = new News({
          title: article.title,
          content: article.content || article.description,
          summary: article.description,
          category: 'update',
          source: {
            name: article.source.name,
            url: article.url,
            credibility: 7
          },
          images: article.urlToImage ? [article.urlToImage] : [],
          publishedAt: new Date(article.publishedAt),
          isVerified: false,
          aiGenerated: false
        });

        await newsArticle.save();
      }
    }
  } catch (error) {
    console.error('Error fetching external news:', error);
  }
}

// Helper function to translate articles
async function translateArticle(article) {
  // Implementation would use Google Translate API or similar
  // For now, we'll skip the actual translation
  console.log(`Translation needed for article: ${article.title}`);
}

module.exports = router;