import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from app.database import Base

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_repeat = Column(Boolean, default=False)
    economic_score = Column(Integer)
    identity_score = Column(Integer)
    technology_score = Column(Integer)
    society_score = Column(Integer)
    economic_persona = Column(String)
    identity_persona = Column(String)
    technology_persona = Column(String)
    society_persona = Column(String)
    primary_persona = Column(String)
    primary_axis = Column(String)
    questionnaire_answers = Column(String)

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"))
    question_id = Column(Integer)
    model = Column(String)
    score = Column(Integer)
    reasoning = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
