from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True)
    reference_id = db.Column(db.String(80), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    issue_category = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    priority = db.Column(db.String(40), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    predicted_category = db.Column(db.String(120), nullable=False)
    confidence = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(40), nullable=False, default='Reported')
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'reference_id': self.reference_id,
            'title': self.title,
            'description': self.description,
            'issue_category': self.issue_category,
            'location': self.location,
            'priority': self.priority,
            'image_url': self.image_url,
            'predicted_category': self.predicted_category,
            'confidence': round(float(self.confidence), 4),
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
