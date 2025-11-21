from flask import Flask, request, jsonify
from flask_cors import CORS
from advanced_disaster_predictor import AdvancedDisasterPredictor
import numpy as np
import requests
from datetime import datetime
import os
from dotenv import load_dotenv
import schedule
import time
import threading

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize predictor
predictor = AdvancedDisasterPredictor()

# Load trained models
try:
    predictor.load_models('models')
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"⚠️  No pre-trained models found. Training new models...")
    disaster_types = ['flood', 'cyclone', 'earthquake', 'landslide', 'wildfire']
    for disaster_type in disaster_types:
        predictor.train_models(disaster_type)
    predictor.save_models('models')
    print("✅ Models trained and saved")

def fetch_weather_data(lat, lon):
    """Fetch real-time weather data"""
    api_key = os.getenv('WEATHER_API_KEY')
    if not api_key:
        return generate_mock_weather_data()
    
    try:
        # Current weather
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        return {
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'wind_direction': data['wind'].get('deg', 0),
            'rainfall_1h': data.get('rain', {}).get('1h', 0)
        }
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return generate_mock_weather_data()

def generate_mock_weather_data():
    """Generate mock weather data for testing"""
    return {
        'temperature': np.random.normal(25, 5),
        'humidity': np.random.uniform(40, 90),
        'pressure': np.random.normal(1013, 10),
        'wind_speed': np.random.exponential(10),
        'wind_direction': np.random.uniform(0, 360),
        'rainfall_1h': np.random.exponential(2)
    }

def prepare_features(lat, lon, weather_data=None):
    """Prepare feature vector for prediction"""
    if weather_data is None:
        weather_data = fetch_weather_data(lat, lon)
    
    # Generate or fetch additional features
    features = {
        # Weather features
        'temperature': weather_data['temperature'],
        'humidity': weather_data['humidity'],
        'pressure': weather_data['pressure'],
        'wind_speed': weather_data['wind_speed'],
        'wind_direction': weather_data['wind_direction'],
        'rainfall_1h': weather_data['rainfall_1h'],
        'rainfall_24h': weather_data['rainfall_1h'] * np.random.uniform(15, 25),
        'rainfall_7d': weather_data['rainfall_1h'] * np.random.uniform(50, 150),
        'rainfall_30d': weather_data['rainfall_1h'] * np.random.uniform(200, 500),
        'temperature_change_24h': np.random.normal(0, 3),
        'pressure_change_24h': np.random.normal(0, 5),
        
        # Geographical features (would be fetched from GIS database in production)
        'elevation': abs(lat) * 10 + np.random.uniform(0, 500),
        'slope': np.random.exponential(8),
        'aspect': np.random.uniform(0, 360),
        'distance_to_water': np.random.exponential(30),
        'distance_to_coast': abs(lat - 0) * 111 + np.random.uniform(0, 100),
        'soil_type': np.random.randint(1, 10),
        'soil_moisture': weather_data['humidity'] * 0.7 + np.random.uniform(-10, 10),
        'vegetation_index': np.random.uniform(0.2, 0.8),
        
        # Seismic features
        'seismic_activity_7d': np.random.exponential(1.5),
        'seismic_activity_30d': np.random.exponential(6),
        'fault_distance': np.random.exponential(80),
        'tectonic_stress': np.random.uniform(20, 80),
        'historical_earthquake_count': np.random.poisson(3),
        
        # Hydrological features
        'river_level': np.random.uniform(2, 10),
        'river_flow_rate': np.random.exponential(300),
        'groundwater_level': np.random.uniform(10, 40),
        'dam_capacity': np.random.uniform(60, 95),
        'upstream_rainfall': weather_data['rainfall_1h'] * np.random.uniform(1, 3),
        
        # Atmospheric features
        'sea_surface_temp': weather_data['temperature'] + np.random.uniform(-2, 2),
        'atmospheric_pressure_gradient': np.random.normal(0, 3),
        'wind_shear': np.random.uniform(5, 40),
        'moisture_content': weather_data['humidity'] + np.random.uniform(-10, 10),
        'coriolis_effect': abs(lat) / 90,
        
        # Temporal features
        'month': datetime.now().month,
        'season': (datetime.now().month % 12) // 3,
        'day_of_year': datetime.now().timetuple().tm_yday,
        'is_monsoon_season': 1 if 6 <= datetime.now().month <= 9 else 0,
        
        # Historical features (would be fetched from database in production)
        'historical_disaster_count_1y': np.random.poisson(2),
        'historical_disaster_count_5y': np.random.poisson(10),
        'days_since_last_disaster': np.random.exponential(150),
        'avg_disaster_severity': np.random.uniform(0.3, 0.7)
    }
    
    return features

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': len([m for m in predictor.models.values() if m['ensemble'] is not None])
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        data = request.json
        lat = data.get('latitude')
        lon = data.get('longitude')
        disaster_types = data.get('disaster_types', ['flood', 'cyclone', 'earthquake', 'landslide', 'wildfire'])
        
        if lat is None or lon is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # Fetch weather data
        weather_data = fetch_weather_data(lat, lon)
        
        # Prepare features
        features = prepare_features(lat, lon, weather_data)
        
        # Make predictions for all disaster types
        predictions = {}
        for disaster_type in disaster_types:
            if disaster_type in predictor.models:
                prediction = predictor.predict_disaster(features, disaster_type)
                predictions[disaster_type] = prediction
        
        return jsonify({
            'location': {
                'latitude': lat,
                'longitude': lon
            },
            'timestamp': datetime.now().isoformat(),
            'weather_conditions': weather_data,
            'predictions': predictions,
            'overall_risk': max([p['risk_level'] for p in predictions.values()], 
                              key=lambda x: ['low', 'medium', 'high', 'critical'].index(x))
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Batch prediction for multiple locations"""
    try:
        data = request.json
        locations = data.get('locations', [])
        disaster_types = data.get('disaster_types', ['flood', 'cyclone', 'earthquake', 'landslide', 'wildfire'])
        
        results = []
        for location in locations:
            lat = location.get('latitude')
            lon = location.get('longitude')
            
            if lat is None or lon is None:
                continue
            
            weather_data = fetch_weather_data(lat, lon)
            features = prepare_features(lat, lon, weather_data)
            
            predictions = {}
            for disaster_type in disaster_types:
                if disaster_type in predictor.models:
                    prediction = predictor.predict_disaster(features, disaster_type)
                    predictions[disaster_type] = prediction
            
            results.append({
                'location': location,
                'predictions': predictions,
                'overall_risk': max([p['risk_level'] for p in predictions.values()], 
                                  key=lambda x: ['low', 'medium', 'high', 'critical'].index(x))
            })
        
        return jsonify({
            'timestamp': datetime.now().isoformat(),
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model/accuracy', methods=['GET'])
def get_model_accuracy():
    """Get model accuracy information"""
    return jsonify({
        'accuracies': predictor.model_accuracies,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/retrain', methods=['POST'])
def retrain_models():
    """Retrain models (admin only)"""
    try:
        data = request.json
        disaster_type = data.get('disaster_type')
        
        if disaster_type and disaster_type in predictor.models:
            predictor.train_models(disaster_type)
            predictor.save_models('models')
            return jsonify({
                'message': f'Model for {disaster_type} retrained successfully',
                'accuracy': predictor.model_accuracies[disaster_type]['ensemble']
            })
        else:
            # Retrain all models
            disaster_types = ['flood', 'cyclone', 'earthquake', 'landslide', 'wildfire']
            for dt in disaster_types:
                predictor.train_models(dt)
            predictor.save_models('models')
            return jsonify({
                'message': 'All models retrained successfully',
                'accuracies': predictor.model_accuracies
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def run_scheduled_predictions():
    """Run scheduled predictions for monitoring"""
    # This would integrate with your MongoDB to check registered locations
    print(f"[{datetime.now()}] Running scheduled predictions...")

# Schedule periodic tasks
schedule.every(30).minutes.do(run_scheduled_predictions)

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == '__main__':
    # Start scheduler in background thread
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    print("\n" + "="*60)
    print("🚀 GUARDIAN EARTH AI PREDICTION SERVER")
    print("="*60)
    print("Server running on http://localhost:8000")
    print("Endpoints:")
    print("  POST /predict - Single location prediction")
    print("  POST /predict/batch - Batch predictions")
    print("  GET  /model/accuracy - Model accuracy info")
    print("  GET  /health - Health check")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8000, debug=False)
