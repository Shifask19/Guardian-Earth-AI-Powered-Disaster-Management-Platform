import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import xgboost as xgb
import lightgbm as lgb
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib
import requests
import json
from datetime import datetime, timedelta
import os

class AdvancedDisasterPredictor:
    def __init__(self):
        self.models = {
            'flood': {
                'rf': None,
                'xgb': None,
                'lgb': None,
                'nn': None,
                'ensemble': None
            },
            'cyclone': {
                'rf': None,
                'xgb': None,
                'lgb': None,
                'nn': None,
                'ensemble': None
            },
            'earthquake': {
                'rf': None,
                'xgb': None,
                'lgb': None,
                'nn': None,
                'ensemble': None
            },
            'landslide': {
                'rf': None,
                'xgb': None,
                'lgb': None,
                'nn': None,
                'ensemble': None
            },
            'wildfire': {
                'rf': None,
                'xgb': None,
                'lgb': None,
                'nn': None,
                'ensemble': None
            }
        }
        
        self.scalers = {}
        self.feature_columns = [
            # Weather features
            'temperature', 'humidity', 'pressure', 'wind_speed', 'wind_direction',
            'rainfall_1h', 'rainfall_24h', 'rainfall_7d', 'rainfall_30d',
            'temperature_change_24h', 'pressure_change_24h',
            
            # Geographical features
            'elevation', 'slope', 'aspect', 'distance_to_water', 'distance_to_coast',
            'soil_type', 'soil_moisture', 'vegetation_index',
            
            # Seismic features (for earthquakes)
            'seismic_activity_7d', 'seismic_activity_30d', 'fault_distance',
            'tectonic_stress', 'historical_earthquake_count',
            
            # Hydrological features (for floods)
            'river_level', 'river_flow_rate', 'groundwater_level',
            'dam_capacity', 'upstream_rainfall',
            
            # Atmospheric features (for cyclones)
            'sea_surface_temp', 'atmospheric_pressure_gradient',
            'wind_shear', 'moisture_content', 'coriolis_effect',
            
            # Temporal features
            'month', 'season', 'day_of_year', 'is_monsoon_season',
            
            # Historical features
            'historical_disaster_count_1y', 'historical_disaster_count_5y',
            'days_since_last_disaster', 'avg_disaster_severity'
        ]
        
        self.model_accuracies = {}
    
    def create_neural_network(self, input_dim, disaster_type):
        """Create a deep neural network for disaster prediction"""
        model = keras.Sequential([
            layers.Input(shape=(input_dim,)),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(64, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.2),
            
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            
            layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def generate_synthetic_training_data(self, disaster_type, n_samples=10000):
        """Generate synthetic training data for model training"""
        np.random.seed(42)
        
        # Generate base features
        data = {}
        
        # Weather features
        data['temperature'] = np.random.normal(25, 10, n_samples)
        data['humidity'] = np.random.uniform(30, 100, n_samples)
        data['pressure'] = np.random.normal(1013, 20, n_samples)
        data['wind_speed'] = np.random.exponential(15, n_samples)
        data['wind_direction'] = np.random.uniform(0, 360, n_samples)
        
        # Rainfall features
        data['rainfall_1h'] = np.random.exponential(5, n_samples)
        data['rainfall_24h'] = data['rainfall_1h'] * np.random.uniform(10, 30, n_samples)
        data['rainfall_7d'] = data['rainfall_24h'] * np.random.uniform(3, 10, n_samples)
        data['rainfall_30d'] = data['rainfall_7d'] * np.random.uniform(2, 6, n_samples)
        
        # Changes
        data['temperature_change_24h'] = np.random.normal(0, 5, n_samples)
        data['pressure_change_24h'] = np.random.normal(0, 10, n_samples)
        
        # Geographical features
        data['elevation'] = np.random.uniform(0, 3000, n_samples)
        data['slope'] = np.random.exponential(10, n_samples)
        data['aspect'] = np.random.uniform(0, 360, n_samples)
        data['distance_to_water'] = np.random.exponential(50, n_samples)
        data['distance_to_coast'] = np.random.exponential(200, n_samples)
        data['soil_type'] = np.random.randint(1, 10, n_samples)
        data['soil_moisture'] = np.random.uniform(10, 80, n_samples)
        data['vegetation_index'] = np.random.uniform(0, 1, n_samples)
        
        # Seismic features
        data['seismic_activity_7d'] = np.random.exponential(2, n_samples)
        data['seismic_activity_30d'] = np.random.exponential(8, n_samples)
        data['fault_distance'] = np.random.exponential(100, n_samples)
        data['tectonic_stress'] = np.random.uniform(0, 100, n_samples)
        data['historical_earthquake_count'] = np.random.poisson(5, n_samples)
        
        # Hydrological features
        data['river_level'] = np.random.uniform(1, 15, n_samples)
        data['river_flow_rate'] = np.random.exponential(500, n_samples)
        data['groundwater_level'] = np.random.uniform(5, 50, n_samples)
        data['dam_capacity'] = np.random.uniform(50, 100, n_samples)
        data['upstream_rainfall'] = np.random.exponential(10, n_samples)
        
        # Atmospheric features
        data['sea_surface_temp'] = np.random.normal(27, 3, n_samples)
        data['atmospheric_pressure_gradient'] = np.random.normal(0, 5, n_samples)
        data['wind_shear'] = np.random.uniform(0, 50, n_samples)
        data['moisture_content'] = np.random.uniform(40, 100, n_samples)
        data['coriolis_effect'] = np.random.uniform(0, 1, n_samples)
        
        # Temporal features
        data['month'] = np.random.randint(1, 13, n_samples)
        data['season'] = (data['month'] % 12) // 3
        data['day_of_year'] = np.random.randint(1, 366, n_samples)
        data['is_monsoon_season'] = (data['month'] >= 6) & (data['month'] <= 9)
        
        # Historical features
        data['historical_disaster_count_1y'] = np.random.poisson(3, n_samples)
        data['historical_disaster_count_5y'] = np.random.poisson(15, n_samples)
        data['days_since_last_disaster'] = np.random.exponential(180, n_samples)
        data['avg_disaster_severity'] = np.random.uniform(0, 1, n_samples)
        
        df = pd.DataFrame(data)
        
        # Generate target based on disaster-specific logic
        if disaster_type == 'flood':
            target = (
                (df['rainfall_24h'] > 100) |
                (df['river_level'] > 12) |
                ((df['rainfall_7d'] > 300) & (df['elevation'] < 100)) |
                (df['soil_moisture'] > 70)
            ).astype(int)
            
        elif disaster_type == 'cyclone':
            target = (
                (df['wind_speed'] > 60) |
                ((df['sea_surface_temp'] > 26) & (df['humidity'] > 80) & (df['pressure'] < 1000)) |
                (df['atmospheric_pressure_gradient'] < -3)
            ).astype(int)
            
        elif disaster_type == 'earthquake':
            target = (
                (df['seismic_activity_7d'] > 5) |
                ((df['tectonic_stress'] > 70) & (df['fault_distance'] < 50)) |
                (df['seismic_activity_30d'] > 20)
            ).astype(int)
            
        elif disaster_type == 'landslide':
            target = (
                ((df['rainfall_24h'] > 80) & (df['slope'] > 25)) |
                ((df['soil_moisture'] > 60) & (df['slope'] > 20)) |
                ((df['rainfall_7d'] > 200) & (df['vegetation_index'] < 0.3))
            ).astype(int)
            
        elif disaster_type == 'wildfire':
            target = (
                ((df['temperature'] > 35) & (df['humidity'] < 30)) |
                ((df['wind_speed'] > 30) & (df['vegetation_index'] > 0.6) & (df['rainfall_30d'] < 20)) |
                (df['temperature'] > 40)
            ).astype(int)
        
        # Add some noise
        noise = np.random.random(n_samples) < 0.1
        target = np.logical_xor(target, noise).astype(int)
        
        return df, target
    
    def train_models(self, disaster_type):
        """Train all models for a specific disaster type"""
        print(f"\n{'='*60}")
        print(f"Training models for {disaster_type.upper()}")
        print(f"{'='*60}")
        
        # Generate training data
        X, y = self.generate_synthetic_training_data(disaster_type, n_samples=20000)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.scalers[disaster_type] = scaler
        
        # 1. Random Forest
        print("\n1. Training Random Forest...")
        rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        rf_model.fit(X_train_scaled, y_train)
        rf_pred = rf_model.predict(X_test_scaled)
        rf_accuracy = accuracy_score(y_test, rf_pred)
        print(f"   Random Forest Accuracy: {rf_accuracy:.4f}")
        self.models[disaster_type]['rf'] = rf_model
        
        # 2. XGBoost
        print("\n2. Training XGBoost...")
        xgb_model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=10,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            use_label_encoder=False,
            eval_metric='logloss'
        )
        xgb_model.fit(X_train_scaled, y_train)
        xgb_pred = xgb_model.predict(X_test_scaled)
        xgb_accuracy = accuracy_score(y_test, xgb_pred)
        print(f"   XGBoost Accuracy: {xgb_accuracy:.4f}")
        self.models[disaster_type]['xgb'] = xgb_model
        
        # 3. LightGBM
        print("\n3. Training LightGBM...")
        lgb_model = lgb.LGBMClassifier(
            n_estimators=200,
            max_depth=10,
            learning_rate=0.1,
            num_leaves=31,
            random_state=42,
            verbose=-1
        )
        lgb_model.fit(X_train_scaled, y_train)
        lgb_pred = lgb_model.predict(X_test_scaled)
        lgb_accuracy = accuracy_score(y_test, lgb_pred)
        print(f"   LightGBM Accuracy: {lgb_accuracy:.4f}")
        self.models[disaster_type]['lgb'] = lgb_model
        
        # 4. Neural Network
        print("\n4. Training Neural Network...")
        nn_model = self.create_neural_network(X_train_scaled.shape[1], disaster_type)
        
        early_stopping = keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        history = nn_model.fit(
            X_train_scaled, y_train,
            validation_split=0.2,
            epochs=50,
            batch_size=128,
            callbacks=[early_stopping],
            verbose=0
        )
        
        nn_pred = (nn_model.predict(X_test_scaled) > 0.5).astype(int)
        nn_accuracy = accuracy_score(y_test, nn_pred)
        print(f"   Neural Network Accuracy: {nn_accuracy:.4f}")
        self.models[disaster_type]['nn'] = nn_model
        
        # 5. Ensemble Model (Weighted Average)
        print("\n5. Creating Ensemble Model...")
        rf_prob = rf_model.predict_proba(X_test_scaled)[:, 1]
        xgb_prob = xgb_model.predict_proba(X_test_scaled)[:, 1]
        lgb_prob = lgb_model.predict_proba(X_test_scaled)[:, 1]
        nn_prob = nn_model.predict(X_test_scaled).flatten()
        
        # Weighted ensemble based on individual accuracies
        weights = np.array([rf_accuracy, xgb_accuracy, lgb_accuracy, nn_accuracy])
        weights = weights / weights.sum()
        
        ensemble_prob = (
            weights[0] * rf_prob +
            weights[1] * xgb_prob +
            weights[2] * lgb_prob +
            weights[3] * nn_prob
        )
        ensemble_pred = (ensemble_prob > 0.5).astype(int)
        ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
        
        print(f"   Ensemble Accuracy: {ensemble_accuracy:.4f}")
        print(f"   Ensemble Weights: RF={weights[0]:.3f}, XGB={weights[1]:.3f}, LGB={weights[2]:.3f}, NN={weights[3]:.3f}")
        
        self.models[disaster_type]['ensemble'] = {
            'weights': weights,
            'accuracy': ensemble_accuracy
        }
        
        # Store accuracies
        self.model_accuracies[disaster_type] = {
            'rf': rf_accuracy,
            'xgb': xgb_accuracy,
            'lgb': lgb_accuracy,
            'nn': nn_accuracy,
            'ensemble': ensemble_accuracy
        }
        
        # Detailed metrics
        print(f"\n{'='*60}")
        print(f"FINAL RESULTS FOR {disaster_type.upper()}")
        print(f"{'='*60}")
        print(f"Precision: {precision_score(y_test, ensemble_pred):.4f}")
        print(f"Recall: {recall_score(y_test, ensemble_pred):.4f}")
        print(f"F1-Score: {f1_score(y_test, ensemble_pred):.4f}")
        print(f"Best Model: Ensemble with {ensemble_accuracy:.4f} accuracy")
        
        return ensemble_accuracy
    
    def predict_disaster(self, features, disaster_type):
        """Make prediction using ensemble model"""
        if disaster_type not in self.models:
            raise ValueError(f"Unknown disaster type: {disaster_type}")
        
        # Ensure features are in correct format
        if isinstance(features, dict):
            feature_array = np.array([features[col] for col in self.feature_columns]).reshape(1, -1)
        else:
            feature_array = np.array(features).reshape(1, -1)
        
        # Scale features
        if disaster_type in self.scalers:
            feature_array = self.scalers[disaster_type].transform(feature_array)
        
        # Get predictions from all models
        rf_prob = self.models[disaster_type]['rf'].predict_proba(feature_array)[0, 1]
        xgb_prob = self.models[disaster_type]['xgb'].predict_proba(feature_array)[0, 1]
        lgb_prob = self.models[disaster_type]['lgb'].predict_proba(feature_array)[0, 1]
        nn_prob = self.models[disaster_type]['nn'].predict(feature_array)[0, 0]
        
        # Ensemble prediction
        weights = self.models[disaster_type]['ensemble']['weights']
        ensemble_prob = (
            weights[0] * rf_prob +
            weights[1] * xgb_prob +
            weights[2] * lgb_prob +
            weights[3] * nn_prob
        )
        
        return {
            'probability': float(ensemble_prob),
            'risk_level': self.get_risk_level(ensemble_prob),
            'confidence': float(self.models[disaster_type]['ensemble']['accuracy']),
            'model_predictions': {
                'random_forest': float(rf_prob),
                'xgboost': float(xgb_prob),
                'lightgbm': float(lgb_prob),
                'neural_network': float(nn_prob)
            }
        }
    
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
    
    def save_models(self, model_dir='models'):
        """Save all trained models"""
        os.makedirs(model_dir, exist_ok=True)
        
        for disaster_type in self.models.keys():
            disaster_dir = os.path.join(model_dir, disaster_type)
            os.makedirs(disaster_dir, exist_ok=True)
            
            # Save sklearn models
            joblib.dump(self.models[disaster_type]['rf'], 
                       os.path.join(disaster_dir, 'rf_model.pkl'))
            joblib.dump(self.models[disaster_type]['xgb'], 
                       os.path.join(disaster_dir, 'xgb_model.pkl'))
            joblib.dump(self.models[disaster_type]['lgb'], 
                       os.path.join(disaster_dir, 'lgb_model.pkl'))
            
            # Save neural network
            self.models[disaster_type]['nn'].save(
                os.path.join(disaster_dir, 'nn_model.h5')
            )
            
            # Save ensemble weights
            joblib.dump(self.models[disaster_type]['ensemble'], 
                       os.path.join(disaster_dir, 'ensemble.pkl'))
            
            # Save scaler
            joblib.dump(self.scalers[disaster_type], 
                       os.path.join(disaster_dir, 'scaler.pkl'))
        
        # Save accuracies
        joblib.dump(self.model_accuracies, 
                   os.path.join(model_dir, 'accuracies.pkl'))
        
        print(f"\n✅ All models saved to {model_dir}/")
    
    def load_models(self, model_dir='models'):
        """Load all trained models"""
        for disaster_type in self.models.keys():
            disaster_dir = os.path.join(model_dir, disaster_type)
            
            try:
                self.models[disaster_type]['rf'] = joblib.load(
                    os.path.join(disaster_dir, 'rf_model.pkl'))
                self.models[disaster_type]['xgb'] = joblib.load(
                    os.path.join(disaster_dir, 'xgb_model.pkl'))
                self.models[disaster_type]['lgb'] = joblib.load(
                    os.path.join(disaster_dir, 'lgb_model.pkl'))
                self.models[disaster_type]['nn'] = keras.models.load_model(
                    os.path.join(disaster_dir, 'nn_model.h5'))
                self.models[disaster_type]['ensemble'] = joblib.load(
                    os.path.join(disaster_dir, 'ensemble.pkl'))
                self.scalers[disaster_type] = joblib.load(
                    os.path.join(disaster_dir, 'scaler.pkl'))
                
                print(f"✅ Loaded models for {disaster_type}")
            except Exception as e:
                print(f"❌ Error loading models for {disaster_type}: {e}")
        
        try:
            self.model_accuracies = joblib.load(
                os.path.join(model_dir, 'accuracies.pkl'))
        except:
            pass

# Training script
if __name__ == "__main__":
    print("="*60)
    print("GUARDIAN EARTH - ADVANCED DISASTER PREDICTION SYSTEM")
    print("="*60)
    
    predictor = AdvancedDisasterPredictor()
    
    disaster_types = ['flood', 'cyclone', 'earthquake', 'landslide', 'wildfire']
    
    for disaster_type in disaster_types:
        accuracy = predictor.train_models(disaster_type)
    
    # Save all models
    predictor.save_models()
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE - MODEL SUMMARY")
    print("="*60)
    for disaster_type, accuracies in predictor.model_accuracies.items():
        print(f"\n{disaster_type.upper()}:")
        print(f"  Ensemble Accuracy: {accuracies['ensemble']:.4f}")
        print(f"  Best Individual: {max(accuracies['rf'], accuracies['xgb'], accuracies['lgb'], accuracies['nn']):.4f}")
    
    print("\n✅ All models trained and saved successfully!")
    print("🚀 Ready for real-time disaster prediction!")
