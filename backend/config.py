import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

BACKEND_DIR = BASE_DIR / 'backend'
MODELS_DIR = BACKEND_DIR / 'models'
MODEL_PATH = MODELS_DIR / 'civic_classifier.joblib'
EVAL_PATH = MODELS_DIR / 'evaluation.json'
DATA_DIR = BACKEND_DIR / 'data'
DB_PATH = DATA_DIR / 'citycare.db'


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{DB_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_API_KEY = os.environ.get('ADMIN_API_KEY')
    JSON_SORT_KEYS = False

    @staticmethod
    def validate(config):
        required_secrets = ('SECRET_KEY', 'ADMIN_API_KEY')
        missing = [name for name in required_secrets if not config.get(name)]
        if missing:
            names = ', '.join(missing)
            raise RuntimeError(
                f'Missing required environment variable(s): {names}. '
                'Create a .env file from .env.example and set strong, unique values.'
            )

        weak = [
            name for name in required_secrets
            if (
                config[name].strip().lower().startswith('replace-with-')
                or len(config[name]) < 32
            )
        ]
        if weak:
            names = ', '.join(weak)
            raise RuntimeError(
                f'{names} must each be a unique secret with at least 32 characters. '
                'Generate random values; do not use example or demo values.'
            )

        if config['SECRET_KEY'] == config['ADMIN_API_KEY']:
            raise RuntimeError('SECRET_KEY and ADMIN_API_KEY must be different unique values.')
