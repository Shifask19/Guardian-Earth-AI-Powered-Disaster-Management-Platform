#!/usr/bin/env python3
"""
Train all disaster prediction models with high accuracy
"""

from advanced_disaster_predictor import AdvancedDisasterPredictor
import sys

def main():
    print("\n" + "="*70)
    print(" "*15 + "GUARDIAN EARTH AI MODEL TRAINING")
    print("="*70)
    print("\nThis will train advanced ML models for disaster prediction:")
    print("  • Random Forest Classifier")
    print("  • XGBoost Classifier")
    print("  • LightGBM Classifier")
    print("  • Deep Neural Network")
    print("  • Ensemble Model (Weighted Average)")
    print("\nDisaster Types:")
    print("  1. Floods")
    print("  2. Cyclones/Hurricanes")
    print("  3. Earthquakes")
    print("  4. Landslides")
    print("  5. Wildfires")
    print("\n" + "="*70)
    
    response = input("\nProceed with training? (y/n): ")
    if response.lower() != 'y':
        print("Training cancelled.")
        sys.exit(0)
    
    # Initialize predictor
    predictor = AdvancedDisasterPredictor()
    
    # Train all disaster types
    disaster_types = ['flood', 'cyclone', 'earthquake', 'landslide', 'wildfire']
    
    total_accuracy = 0
    for disaster_type in disaster_types:
        accuracy = predictor.train_models(disaster_type)
        total_accuracy += accuracy
    
    # Save models
    predictor.save_models('models')
    
    # Summary
    print("\n" + "="*70)
    print(" "*20 + "TRAINING SUMMARY")
    print("="*70)
    
    avg_accuracy = total_accuracy / len(disaster_types)
    print(f"\nAverage Ensemble Accuracy: {avg_accuracy:.4f} ({avg_accuracy*100:.2f}%)")
    
    print("\nIndividual Model Accuracies:")
    for disaster_type, accuracies in predictor.model_accuracies.items():
        print(f"\n{disaster_type.upper()}:")
        print(f"  Random Forest:  {accuracies['rf']:.4f}")
        print(f"  XGBoost:        {accuracies['xgb']:.4f}")
        print(f"  LightGBM:       {accuracies['lgb']:.4f}")
        print(f"  Neural Network: {accuracies['nn']:.4f}")
        print(f"  Ensemble:       {accuracies['ensemble']:.4f} ⭐")
    
    print("\n" + "="*70)
    print("✅ Training Complete!")
    print("🚀 Models saved and ready for real-time predictions")
    print("="*70 + "\n")
    
    print("Next steps:")
    print("  1. Start the prediction server: python prediction_server.py")
    print("  2. Test predictions via API: POST http://localhost:8000/predict")
    print("  3. Integrate with Guardian Earth backend\n")

if __name__ == "__main__":
    main()
