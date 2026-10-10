import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.ml.train_model import train_and_save

if __name__ == '__main__':
    train_and_save()
    print('Model training completed successfully.')
