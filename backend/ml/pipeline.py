import json
from pathlib import Path

import joblib
import numpy as np

from backend.config import EVAL_PATH, MODEL_PATH


def load_model_bundle():
    if not MODEL_PATH.exists():
        raise FileNotFoundError('Model file not found. Train the model first with python scripts/train_model.py.')
    bundle = joblib.load(MODEL_PATH)
    if not isinstance(bundle, dict) or 'vectorizer' not in bundle or 'classifier' not in bundle:
        raise ValueError('Model bundle is invalid.')
    return bundle


def load_evaluation_metrics():
    if EVAL_PATH.exists():
        with EVAL_PATH.open('r', encoding='utf-8') as file:
            return json.load(file)
    return {
        'status': 'not_available',
        'message': 'Model evaluation metrics are not available yet. Train the model first.',
    }


def predict_complaint(title: str, description: str):
    text = ' '.join([title.strip(), description.strip()]).strip()
    if not text:
        raise ValueError('Complaint title and description cannot be empty.')

    bundle = load_model_bundle()
    vectorizer = bundle['vectorizer']
    classifier = bundle['classifier']
    classes = bundle.get('classes', getattr(classifier, 'classes_', []))

    transformed = vectorizer.transform([text])
    probabilities = classifier.predict_proba(transformed)[0]
    max_index = int(np.argmax(probabilities))
    category = str(classes[max_index])
    confidence = float(probabilities[max_index])

    return {
        'category': category,
        'confidence': round(confidence, 4),
        'confidence_label': 'High confidence' if confidence >= 0.7 else 'Medium confidence' if confidence >= 0.45 else 'Low confidence',
    }
