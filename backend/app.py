import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from flask import Flask
from flask_cors import CORS

from backend.api import api
from backend.config import Config
from backend.database import db


def create_app(config_override=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_override:
        app.config.update(config_override)
    Config.validate(app.config)
    app.config['ENV'] = os.environ.get('FLASK_ENV', 'development')

    CORS(app, resources={r'/api/*': {'origins': '*'}})
    db.init_app(app)
    app.register_blueprint(api)

    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == '__main__':
    app.run(
        debug=os.environ.get('FLASK_DEBUG') == '1',
        host='127.0.0.1',
        port=5000,
    )
