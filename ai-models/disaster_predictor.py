import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import requests
import json
from datetime import datetime, timedelta

class DisasterPredictor:
    def __init__(self):
        self.models = {
            'flood': None,
            'cyclone': None,
            'earthquake': None,
            'landslide': None
        }
        self.scalers = {}
        self.feature_columns = [
            'temperature', 'humidity', 'pressure', 'wind_speed',
            'rainfall_24h', 'rainfall_7d', 'elevation', 'slope',
            'soil_moisture', 'river_level', 'season'
        ]
    
    def load_weather_data(self, lat, lon, api_key):
        """Fetch real-time weather data from OpenWeatherMap API"""
        try:
            # Current weather
            current_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            current_response = requests.get(current_url)
            current_data = current_response.json()
            
            # Historical weather (last 7 days)
            historical_data = []
            for i in range(7):
                timestamp = int((datetime.now() - timedelta(days=i)).timestamp())
                hist_url = f"http://api.openweathermap.org/data/2.5/onecall/timemachine?lat={lat}&lon={lon}&dt={timestamp}&appid={api_key}&units=metric"
                hist_response = requests.get(hist_url)
                if hist_response.status_code == 200:
                    historical_data.append(hist_response.json())
            
            return self.process_weather_data(current_data, historical_data)
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None
    
    def process_weather_data(self, current, historical):
        """Process weather data into features"""
        features = {}
        
        # Current conditions
        features['temperature'] = current['main']['temp']
        features['humidity'] = current['main']['humidity']
        features['pressure'] = current['main']['pressure']
        features['wind_speed'] = current['wind']['speed']
        
        # Calculate rainfall totals
        rainfall_24h = current.get('rain', {}).get('1h', 0) * 24
        rainfall_7d = sum([day.get('current', {}).get('rain', {}).get('1h', 0) * 24 
                          for day in historical])
        
        features['rainfall_24h'] = rainfall_24h
        features['rainfall_7d'] = rainfall_7d
        
        # Seasonal factor
        month = datetime.now().month
        if month in [12, 1, 2]:
            features['season'] = 0  # Winter
        elif month in [3, 4, 5]:
            features['season'] = 1  # Spring
        elif month in [6, 7, 8]:
            features['season'] = 2  # Summer
        else:
            features['season'] = 3  # Fall
        
        return features
    
    def load_geographical_data(self, lat, lon):
        """Load geographical features for the location"""
        # In a real implementation, this would query a geographical database
        # For now, we'll use placeholder values
        return {
            'elevation': 100,  # meters above sea level
            'slope': 5,        # degrees
            'soil_moisture': 30,  # percentage
            'river_level': 2.5    # meters
        }
    
    def prepare_features(self, lat, lon, weather_api_key):
        """Prepare feature vector for prediction"""
        weather_data = self.load_weather_data(lat, lon, weather_api_key)
        geo_data = self.load_geographical_data(lat, lon)
        
        if not weather_data:
            return None
        
        features = {**weather_data, **geo_data}
        
        # Ensure all required features are present
        feature_vector = []
        for col in self.feature_columns:
            feature_vector.append(features.get(col, 0))
        
        return np.array(feature_vector).reshape(1, -1)
    
    def predict_disasters(self, lat, lon, weather_api_key):
        """Predict disaster probabilities for a location"""
        features = self.prepare_features(lat, lon, weather_api_key)
        
        if features is None:
            return None
        
        predictions = {}
        
        for disaster_type, model in self.models.items():
            if model is not None:
                # Scale features
                if disaster_type in self.scalers:
                    features_scaled = self.scalers[disaster_type].transform(features)
                else:
                    features_scaled = features
                
                # Get prediction probability
                prob = model.predict_proba(features_scaled)[0][1]  # Probability of disaster
                predictions[disaster_type] = {
                    'probability': float(prob),
                    'risk_level': self.get_risk_level(prob),
                    'confidence': float(np.max(model.predict_proba(features_scaled)))
                }
        
        return predictions
    
    def get_risk_level(self, probability):
        """Convert probability to risk level"""
        if probability < 0.2:
            return 'low'
        elif probability < 0.5:
            return 'medium'
        elif probability < 0.8:
            return 'high'
        else:
            return 'critical'
    
    def train_models(self, training_data_path):
        """Train disaster prediction models"""
        # Load training data
        data = pd.read_csv(training_data_path)
        
        for disaster_type in self.models.keys():
            if f'{disaster_type}_occurred' in data.columns:
                # Prepare features and target
                X = data[self.feature_columns]
                y = data[f'{disaster_type}_occurred']
                
                # Split data
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )
                
                # Scale features
                scaler = StandardScaler()
                X_train_scaled = scaler.fit_transform(X_train)
                X_test_scaled = scaler.transform(X_test)
                
                # Train model
                model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                model.fit(X_train_scaled, y_train)
                
                # Store model and scaler
                self.models[disaster_type] = model
                self.scalers[disaster_type] = scaler
                
                # Evaluate model
                accuracy = model.score(X_test_scaled, y_test)
                print(f"{disaster_type} model accuracy: {accuracy:.3f}")
    
    def save_models(self, model_dir):
        """Save trained models to disk"""
        for disaster_type, model in self.models.items():
            if model is not None:
                joblib.dump(model, f"{model_dir}/{disaster_type}_model.pkl")
                joblib.dump(self.scalers[disaster_type], f"{model_dir}/{disaster_type}_scaler.pkl")
    
    def load_models(self, model_dir):
        """Load trained models from disk"""
        for disaster_type in self.models.keys():
            try:
                self.models[disaster_type] = joblib.load(f"{model_dir}/{disaster_type}_model.pkl")
                self.scalers[disaster_type] = joblib.load(f"{model_dir}/{disaster_type}_scaler.pkl")
            except FileNotFoundError:
                print(f"Model for {disaster_type} not found")

# Example usage
if __name__ == "__main__":
    predictor = DisasterPredictor()
    
    # Example prediction
    lat, lon = 40.7128, -74.0060  # New York City
    weather_api_key = "your_openweather_api_key"
    
    predictions = predictor.predict_disasters(lat, lon, weather_api_key)
    
    if predictions:
        print("Disaster Predictions:")
        for disaster_type, pred in predictions.items():
            print(f"{disaster_type}: {pred['probability']:.3f} ({pred['risk_level']})")
    else:
        print("Unable to make predictions - check weather API key and connection")