from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DB_URL", "postgresql://user:password@localhost/mmm_chat")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    session_metadata = Column(JSON)  # Changed from 'metadata'
    
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    message_text = Column(Text)
    sender = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message_metadata = Column(JSON)  # Changed from 'metadata'
    
    session = relationship("ChatSession", back_populates="messages")
    charts = relationship("Chart", back_populates="message")

class Chart(Base):
    __tablename__ = "charts"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"))
    chart_url = Column(String)
    chart_type = Column(String)
    analysis_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    message = relationship("ChatMessage", back_populates="charts")

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, unique=True)
    file_path = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    model_metadata = Column(JSON)  # Changed from 'metadata'
    is_active = Column(Boolean, default=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()