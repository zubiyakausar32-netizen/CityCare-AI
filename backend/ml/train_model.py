import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

from backend.config import EVAL_PATH, MODELS_DIR, MODEL_PATH


def build_synthetic_dataset():
    rows = [
        ('Garbage dump near school gate', 'Overflowing bins and plastic waste around the school gate smell bad and attract flies.', 'Waste Management'),
        ('Trash accumulating on market street', 'Large piles of bags and food waste left beside the main road without collection.', 'Waste Management'),
        ('Overflowing public dustbin', 'The neighborhood dustbin is full and waste is spilling onto the pavement.', 'Waste Management'),
        ('Plastic litter around park', 'Compost and single-use plastics are collecting near the walking path.', 'Waste Management'),
        ('Road surface broken near bus stop', 'The road has deep potholes and damaged asphalt close to the bus stop.', 'Road Damage'),
        ('Potholes on residential street', 'Multiple potholes are creating traffic hazards for cyclists and cars.', 'Road Damage'),
        ('Cracked pavement outside clinic', 'The pavement is broken and uneven near the healthcare center entrance.', 'Road Damage'),
        ('Street damaged after heavy rain', 'Large cracks and rutting are visible on the lane near the market.', 'Road Damage'),
        ('Drain blocked near housing block', 'Stormwater is collecting on the road because the drain is blocked by debris.', 'Water and Drainage'),
        ('Waterlogging on main junction', 'The road remains flooded after rain and standing water covers the junction.', 'Water and Drainage'),
        ('Sewage overflow in lane', 'Dirty water is pooling near the drain and the smell is spreading to nearby homes.', 'Water and Drainage'),
        ('Open drain clogged with garbage', 'Water cannot flow properly because the roadside drain is filled with plastic and leaves.', 'Water and Drainage'),
        ('Streetlight not working on bridge', 'The pedestrian bridge is dark and difficult to use during evening hours.', 'Street Lighting'),
        ('Avenue lighting outage', 'Several lamps around the avenue are off and visibility is poor after sunset.', 'Street Lighting'),
        ('Broken lantern near park path', 'The public lighting column is damaged and the park path is no longer safe.', 'Street Lighting'),
        ('Dark crossing near school', 'The crossing on the roadside has no working lights causing safety concerns.', 'Street Lighting'),
        ('Smoke from factories near homes', 'The air smells of smoke and dust and residents are coughing during the evening.', 'Air Quality'),
        ('Burning waste causing air pollution', 'Open burning near the drainage canal is releasing thick smoke into the air.', 'Air Quality'),
        ('Dust at construction zone', 'Strong dust and particulate matter are blowing through the neighborhood during work.', 'Air Quality'),
        ('Poor air quality near traffic corridor', 'Vehicle exhaust and smoke are worsening air conditions for nearby communities.', 'Air Quality'),
        ('Waste containers left on sidewalk', 'There are several bins and litter bags stacked on the sidewalk and not collected.', 'Waste Management'),
        ('Broken curb and uneven road', 'The road edge is cracked and the surface is uneven for pedestrians and drivers.', 'Road Damage'),
        ('Flooded underpass after storm', 'The underpass is waterlogged and high water is blocking commuters from passing safely.', 'Water and Drainage'),
        ('Lamp post flickering near community hall', 'The lights flicker all evening and the area feels unsafe at night.', 'Street Lighting'),
        ('Dust and smoke from garbage burn', 'The smell of smoke from burning waste is worsening air quality in the nearby houses.', 'Air Quality'),
        ('Overflowing waste behind bus stand', 'Garbage bags are piling behind the bus stand and creating sanitation problems.', 'Waste Management'),
        ('Traffic sign damaged near lane', 'The sign is broken and the road surface has potholes creating safety risks.', 'Road Damage'),
        ('Drainage issue after monsoon', 'Water remains stagnant outside the shops due to blocked drainage channels.', 'Water and Drainage'),
        ('Outdoor lights are off near library', 'The public lights near the library are not functioning leaving the pathway dark.', 'Street Lighting'),
        ('Heavy haze around industrial area', 'The air is visibly hazy and residents report poor air quality from nearby activity.', 'Air Quality'),
    ]
    df = pd.DataFrame(rows, columns=['title', 'description', 'category'])
    df['text'] = df['title'] + ' ' + df['description']
    return df


def train_and_save():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    df = build_synthetic_dataset()

    X = df['text']
    y = df['category']

    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), min_df=1)
    X_vectorized = vectorizer.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_vectorized,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y,
    )

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, average='macro', zero_division=0)
    recall = recall_score(y_test, predictions, average='macro', zero_division=0)
    f1 = f1_score(y_test, predictions, average='macro', zero_division=0)
    labels = sorted(df['category'].unique().tolist())
    cm = confusion_matrix(y_test, predictions, labels=labels).tolist()
    report = classification_report(y_test, predictions, labels=labels, output_dict=True)

    metrics = {
        'dataset': 'synthetic civic complaint dataset',
        'description': 'Small demonstration dataset built for local model testing and portfolio use.',
        'accuracy': round(float(accuracy), 4),
        'precision': round(float(precision), 4),
        'recall': round(float(recall), 4),
        'macro_f1': round(float(f1), 4),
        'classes': labels,
        'confusion_matrix': cm,
        'classification_report': report,
    }

    bundle = {
        'vectorizer': vectorizer,
        'classifier': model,
        'classes': labels,
        'metadata': metrics,
    }

    joblib.dump(bundle, MODEL_PATH)
    with EVAL_PATH.open('w', encoding='utf-8') as handle:
        json.dump(metrics, handle, indent=2)

    return metrics


if __name__ == '__main__':
    train_and_save()
    print('Model trained and saved successfully.')
