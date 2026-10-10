import hmac
from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import func

from backend.database import Complaint, db
from backend.ml.pipeline import load_evaluation_metrics, predict_complaint

api = Blueprint('api', __name__)

VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
VALID_STATUSES = ['Reported', 'Under Review', 'In Progress', 'Resolved']
CATEGORIES = [
    'Waste Management',
    'Road Damage',
    'Water and Drainage',
    'Street Lighting',
    'Air Quality',
]


def serialize_complaint(complaint):
    return complaint.to_dict()


@api.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'CityCare AI',
        'timestamp': datetime.now(timezone.utc).isoformat(),
    })


@api.route('/api/model/evaluation')
def model_evaluation():
    return jsonify(load_evaluation_metrics())


@api.route('/api/predict', methods=['POST'])
def classify_complaint():
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()

    if not title or not description:
        return jsonify({'error': 'Title and description are required.'}), 400

    try:
        prediction = predict_complaint(title, description)
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400
    except FileNotFoundError as exc:
        return jsonify({'error': str(exc)}), 500

    selected_category = (data.get('issue_category') or '').strip()
    if selected_category and selected_category not in CATEGORIES:
        return jsonify({'error': 'Selected category is invalid.'}), 400

    return jsonify({
        'status': 'success',
        'prediction': {
            'predicted_category': prediction['category'],
            'confidence': prediction['confidence'],
            'confidence_label': prediction['confidence_label'],
            'selected_category': selected_category or 'Not provided',
        },
    })


@api.route('/api/complaints', methods=['POST'])
def submit_complaint():
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    location = (data.get('location') or '').strip()
    priority = (data.get('priority') or '').strip()
    selected_category = (data.get('issue_category') or '').strip()
    image_url = (data.get('image_url') or '').strip() or None

    if not title or not description or not location or not priority:
        return jsonify({'error': 'Title, description, location, and priority are required.'}), 400

    if selected_category not in CATEGORIES:
        return jsonify({'error': 'Issue category must be one of the supported civic categories.'}), 400

    if priority not in VALID_PRIORITIES:
        return jsonify({'error': 'Priority must be Low, Medium, High, or Critical.'}), 400

    try:
        prediction = predict_complaint(title, description)
    except (FileNotFoundError, ValueError) as exc:
        return jsonify({'error': str(exc)}), 500 if isinstance(exc, FileNotFoundError) else 400

    complaint = Complaint(
        reference_id=f"CC-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{len(Complaint.query.all()) + 1}",
        title=title,
        description=description,
        issue_category=selected_category,
        location=location,
        priority=priority,
        image_url=image_url,
        predicted_category=prediction['category'],
        confidence=prediction['confidence'],
        status='Reported',
    )

    db.session.add(complaint)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Complaint submitted successfully.',
        'complaint': serialize_complaint(complaint),
        'prediction': {
            'predicted_category': prediction['category'],
            'confidence': prediction['confidence'],
            'confidence_label': prediction['confidence_label'],
        },
    }), 201


@api.route('/api/complaints', methods=['GET'])
def list_complaints():
    page = max(int(request.args.get('page', 1)), 1)
    per_page = min(max(int(request.args.get('per_page', 10)), 1), 50)
    category_filter = request.args.get('category')
    neighborhood_filter = request.args.get('location')
    status_filter = request.args.get('status')

    query = Complaint.query
    if category_filter:
        query = query.filter(Complaint.predicted_category == category_filter)
    if neighborhood_filter:
        query = query.filter(Complaint.location.ilike(f'%{neighborhood_filter}%'))
    if status_filter:
        query = query.filter(Complaint.status == status_filter)

    pagination = query.order_by(Complaint.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'items': [serialize_complaint(item) for item in pagination.items],
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages,
        'total': pagination.total,
    })


@api.route('/api/complaints/<int:complaint_id>', methods=['GET'])
def complaint_detail(complaint_id):
    complaint = Complaint.query.get_or_404(complaint_id)
    return jsonify({'complaint': serialize_complaint(complaint)})


@api.route('/api/complaints/<int:complaint_id>/status', methods=['PATCH'])
def update_status(complaint_id):
    api_key = request.headers.get('X-API-Key', '')
    if not hmac.compare_digest(api_key, current_app.config['ADMIN_API_KEY']):
        return jsonify({'error': 'Admin authorization required to update complaint status.'}), 401

    payload = request.get_json(silent=True) or {}
    new_status = (payload.get('status') or '').strip()
    if new_status not in VALID_STATUSES:
        return jsonify({'error': 'Status must be one of Reported, Under Review, In Progress, or Resolved.'}), 400

    complaint = Complaint.query.get_or_404(complaint_id)
    complaint.status = new_status
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Complaint status updated successfully.',
        'complaint': serialize_complaint(complaint),
    })


@api.route('/api/analytics', methods=['GET'])
def analytics():
    total_complaints = Complaint.query.count()
    open_complaints = Complaint.query.filter(Complaint.status != 'Resolved').count()
    resolved_complaints = Complaint.query.filter(Complaint.status == 'Resolved').count()
    resolution_rate = round((resolved_complaints / total_complaints) * 100, 2) if total_complaints else 0.0

    category_counts = db.session.query(
        Complaint.predicted_category,
        func.count(Complaint.id).label('count'),
    ).group_by(Complaint.predicted_category).order_by(func.count(Complaint.id).desc()).all()

    neighborhood_counts = db.session.query(
        Complaint.location,
        func.count(Complaint.id).label('count'),
    ).group_by(Complaint.location).order_by(func.count(Complaint.id).desc()).all()

    priority_counts = db.session.query(
        Complaint.priority,
        func.count(Complaint.id).label('count'),
    ).group_by(Complaint.priority).order_by(func.count(Complaint.id).desc()).all()

    recent_activity = [serialize_complaint(item) for item in Complaint.query.order_by(Complaint.created_at.desc()).limit(5).all()]

    daily_counts = db.session.query(
        func.date(Complaint.created_at).label('date'),
        func.count(Complaint.id).label('count'),
    ).group_by(func.date(Complaint.created_at)).order_by(func.date(Complaint.created_at)).all()

    weekly_counts = db.session.query(
        func.strftime('%Y-%W', Complaint.created_at).label('week'),
        func.count(Complaint.id).label('count'),
    ).group_by(func.strftime('%Y-%W', Complaint.created_at)).order_by(func.strftime('%Y-%W', Complaint.created_at)).all()

    mean_confidence = db.session.query(func.avg(Complaint.confidence)).scalar() or 0.0

    return jsonify({
        'summary': {
            'total_complaints': total_complaints,
            'open_complaints': open_complaints,
            'resolved_complaints': resolved_complaints,
            'resolution_rate': resolution_rate,
            'average_confidence': round(float(mean_confidence), 4),
        },
        'complaints_by_category': [
            {'name': category, 'value': count} for category, count in category_counts
        ],
        'complaints_by_neighborhood': [
            {'name': neighborhood, 'value': count} for neighborhood, count in neighborhood_counts
        ],
        'priority_distribution': [
            {'name': priority, 'value': count} for priority, count in priority_counts
        ],
        'daily_trend': [{'date': date, 'count': count} for date, count in daily_counts],
        'weekly_trend': [{'week': week, 'count': count} for week, count in weekly_counts],
        'recent_activity': recent_activity,
    })
