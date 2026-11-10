import logging
from sqlalchemy.orm import Session
from ..models.other import Notification

logger = logging.getLogger("careathome.notifications")

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "INFO",
    action_link: str = None
) -> Notification:
    """
    Creates an in-app notification and dispatches mock/real SMS/Email
    """
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        action_link=action_link
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Simulated SMS/Email log
    logger.info(f"[SMS/Email Alert] User {user_id} - '{title}': {message}")
    return notif

