import pytest

from backend.app import create_app
from backend.config import Config
from backend.database import Complaint, db
from backend.ml.train_model import train_and_save


def test_required_secrets_must_be_configured():
    with pytest.raises(RuntimeError, match='Missing required environment variable'):
        Config.validate({'SECRET_KEY': None, 'ADMIN_API_KEY': None})

    with pytest.raises(RuntimeError, match='example or demo values'):
        Config.validate({
            'SECRET_KEY': 'replace-with-a-unique-random-secret-at-least-32-characters',
            'ADMIN_API_KEY': 'replace-with-a-different-unique-random-secret-at-least-32-chars',
        })


def setup_test_app():
    train_and_save()
    app = create_app({
        'TESTING': True,
        'SECRET_KEY': 'test-only-secret-key-do-not-use-in-production',
        'ADMIN_API_KEY': 'test-only-admin-api-key-do-not-use-in-production',
        'SQLALCHEMY_DATABASE_URI': 'sqlite://',
    })
    with app.app_context():
        db.drop_all()
        db.create_all()
    return app


def test_health_endpoint():
    app = setup_test_app()
    client = app.test_client()
    response = client.get('/api/health')
    assert response.status_code == 200
    payload = response.get_json()
    assert payload['status'] == 'healthy'


def test_predict_endpoint_valid():
    app = setup_test_app()
    client = app.test_client()
    response = client.post('/api/predict', json={
        'title': 'Garbage overflow near bus stop',
        'description': 'Waste bins are full and bags are piling up near the bus stop.',
    })
    assert response.status_code == 200
    payload = response.get_json()
    assert 'prediction' in payload
    assert payload['prediction']['predicted_category'] in {
        'Waste Management',
        'Road Damage',
        'Water and Drainage',
        'Street Lighting',
        'Air Quality',
    }


def test_invalid_prediction_input_fails():
    app = setup_test_app()
    client = app.test_client()
    response = client.post('/api/predict', json={'title': '', 'description': ''})
    assert response.status_code == 400


def test_submit_and_update_status():
    app = setup_test_app()
    client = app.test_client()

    response = client.post('/api/complaints', json={
        'title': 'Flooded road near market',
        'description': 'Standing water remains after rain and blocks vehicle movement.',
        'issue_category': 'Water and Drainage',
        'location': 'Central Market',
        'priority': 'High',
    })
    assert response.status_code == 201
    payload = response.get_json()
    complaint_id = payload['complaint']['id']

    unauthorized_response = client.patch(
        f'/api/complaints/{complaint_id}/status',
        json={'status': 'In Progress'},
    )
    assert unauthorized_response.status_code == 401

    patch_response = client.patch(
        f'/api/complaints/{complaint_id}/status',
        json={'status': 'In Progress'},
        headers={'X-API-Key': 'test-only-admin-api-key-do-not-use-in-production'},
    )

    assert patch_response.status_code == 200
    assert patch_response.get_json()['complaint']['status'] == 'In Progress'
