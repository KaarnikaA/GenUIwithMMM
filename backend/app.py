# #====with neon db=============================================================================================================
from flask import Flask, request, jsonify, send_from_directory, g
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, ForeignKey, Boolean
from contextlib import contextmanager
import os
from datetime import datetime
import uuid
import requests
import json
import numpy as np
import arviz as az
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from flask_cors import CORS
import traceback
import warnings
from typing import Dict, List, Optional

# Suppress warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/charts/*": {"origins": "*"},
    r"/chat": {"origins": "*"},
    r"/model-info": {"origins": "*"},
    r"/chat-history/*": {"origins": "*"},
    r"/simulate-scenario": {"origins": "*"}
})

# Database configuration
DATABASE_URL = "postgresql://neondb_owner:npg_CbjvOo6crh2U@ep-flat-dust-a5ogym0n-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# DB_CONFIG = {
#     "user": os.getenv("DB_USER", "postgres"),
#     "password": os.getenv("DB_PASSWORD", "yourpassword"),
#     "host": os.getenv("DB_HOST", "localhost"),
#     "database": os.getenv("DB_NAME", "mmm_chat")
# }

# DATABASE_URL = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}/{DB_CONFIG['database']}"
# engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Model configuration
API_KEY = "AIzaSyDe__T37dV8Y1pXzSidTk0rpofAgfM8FIE"
GEMINI_ENDPOINTS = [
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-2:generateContent",
]

# File system setup
CHARTS_DIR = "charts"
os.makedirs(CHARTS_DIR, exist_ok=True)

# Database Models
Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True)
    session_id = Column(String(36), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    session_metadata = Column(JSON)
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    message_text = Column(Text)
    sender = Column(String(10))  # 'user' or 'bot'
    timestamp = Column(DateTime, default=datetime.utcnow)
    message_metadata = Column(JSON)
    session = relationship("ChatSession", back_populates="messages")
    charts = relationship("Chart", back_populates="message", cascade="all, delete-orphan")

class Chart(Base):
    __tablename__ = "charts"
    id = Column(Integer, primary_key=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"))
    chart_url = Column(String(255))
    chart_type = Column(String(50))
    analysis_type = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    message = relationship("ChatMessage", back_populates="charts")

# Database session management
@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Model loading and processing
def load_model(file_path: str = 'mmm_model_trace.nc') -> Optional[az.InferenceData]:
    try:
        model = az.from_netcdf(file_path)
        print("✅ Model loaded successfully")
        
        # Extract correct dimensions dynamically
        if "channel_contributions" in model.posterior.data_vars:
            num_channels = model.posterior.sizes["channel_contributions_dim_1"]
            model.model_info = {
                "type": "Marketing Mix Model (MMM)",
                "framework": "PyMC + ArviZ",
                "posterior_samples": model.posterior.sizes["draw"],
                "chains": model.posterior.sizes["chain"],
                "channels": [f"Channel_{i+1}" for i in range(num_channels)]
            }
        else:
            model.model_info = {
                "type": "Marketing Mix Model (MMM)",
                "framework": "PyMC + ArviZ",
                "posterior_samples": model.posterior.sizes["draw"],
                "chains": model.posterior.sizes["chain"],
                "channels": ["Unknown"]
            }

        return model
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        return None


MODEL = load_model()

def parse_query_parameters(query: str) -> Dict:
    params = {
        "analysis_type": "general",
        "channels": [],
        "time_period": "all",
        "metrics": ["contribution", "roi"],
        "visualization_needed": False
    }
    
    if MODEL and MODEL.model_info["channels"]:
        params["channels"] = [
            channel for channel in MODEL.model_info["channels"] 
            if channel.lower() in query.lower()
        ] or MODEL.model_info["channels"]
    
    query_lower = query.lower()
    if "roi" in query_lower or "return on investment" in query_lower:
        params["analysis_type"] = "roi"
    elif "contribution" in query_lower:
        params["analysis_type"] = "contribution"
    elif "compare" in query_lower or "comparison" in query_lower:
        params["analysis_type"] = "comparison"
    elif "trend" in query_lower or "over time" in query_lower:
        params["analysis_type"] = "trend"
    
    params["visualization_needed"] = any(
        kw in query_lower 
        for kw in ["compare", "trend", "performance", "roi", "contribution"]
    )
    
    if params["visualization_needed"]:
        params["visualization"] = "bar" if params["analysis_type"] in ["roi", "comparison"] else "pie"
    
    return params

def generate_chart(results: Dict, params: Dict) -> Optional[str]:
    try:
        plt.figure(figsize=(10, 6))
        plt.style.use('ggplot')
        
        chart_type = params.get("visualization", "bar")
        channels = results.get("channels", [])
        
        filename = f"{CHARTS_DIR}/chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        
        if results["analysis_type"] == "ROI Analysis":
            if "mean_roi" in results:
                plt.bar(channels, results["mean_roi"])
                plt.title('Channel ROI')
                plt.ylabel('ROI')
        
        elif "Contribution" in results["analysis_type"]:
            if "percentage_contribution" in results:
                plt.pie(results["percentage_contribution"], labels=channels, autopct='%1.1f%%')
                plt.title('Channel Contribution')
        
        plt.tight_layout()
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()
        
        return f"/charts/{os.path.basename(filename)}"
    except Exception as e:
        print(f"Chart generation error: {str(e)}")
        return None

def process_with_model(user_input: str, chat_history: str = "") -> Dict:
    if not MODEL:
        return {"error": "Model not loaded"}
    
    try:
        # Parse parameters from user query
        params = parse_query_parameters(user_input)
        
        # Get posterior samples
        posterior = MODEL.posterior
        
        # Calculate channel metrics
        channel_contributions = posterior.channel_contributions.values
        roi_values = posterior.roi.values if hasattr(posterior, 'roi') else None
        
        # Calculate summary statistics across chains and draws
        # Mean of channel contributions across all posterior samples
        mean_contributions = np.mean(channel_contributions, axis=(0, 1))
        
        # Get the time dimension if available
        time_periods = mean_contributions.shape[0]
        
        # Prepare results based on analysis type
        if params["analysis_type"] == "roi":
            if roi_values is not None:
                mean_roi = np.mean(roi_values, axis=(0, 1))
                credible_intervals = np.percentile(roi_values, [2.5, 97.5], axis=(0, 1))
                
                results = {
                    "analysis_type": "ROI Analysis",
                    "channels": MODEL.model_info["channels"],
                    "mean_roi": mean_roi.tolist(),
                    "credible_intervals": {
                        "lower": credible_intervals[0].tolist(),
                        "upper": credible_intervals[1].tolist()
                    },
                    "visualization_type": params.get("visualization", "bar")
                }
            else:
                # If ROI is not available, calculate it from contributions and spend
                spend = posterior.spend.values if hasattr(posterior, 'spend') else None
                if spend is not None:
                    # Mean of spend across all posterior samples
                    mean_spend = np.mean(spend, axis=(0, 1))
                    # Calculate ROI as contribution / spend
                    with np.errstate(divide='ignore', invalid='ignore'):
                        roi = mean_contributions / mean_spend
                        # Replace NaN/Inf with 0
                        roi = np.nan_to_num(roi, nan=0, posinf=0, neginf=0)
                    
                    # Average ROI across time periods
                    mean_roi = np.nanmean(roi, axis=0)
                    
                    results = {
                        "analysis_type": "ROI Analysis",
                        "channels": MODEL.model_info["channels"],
                        "mean_roi": mean_roi.tolist(),
                        "visualization_type": params.get("visualization", "bar")
                    }
                else:
                    results = {
                        "error": "ROI data not available in model"
                    }
        
        elif params["analysis_type"] == "contribution":
            # Sum contributions across time for total contribution
            total_contributions = np.sum(mean_contributions, axis=0)
            # Calculate percentage contribution
            total_sum = np.sum(total_contributions)
            percentage_contribution = (total_contributions / total_sum * 100) if total_sum > 0 else np.zeros_like(total_contributions)
            
            results = {
                "analysis_type": "Channel Contribution Analysis",
                "channels": MODEL.model_info["channels"],
                "total_contributions": total_contributions.tolist(),
                "percentage_contribution": percentage_contribution.tolist(),
                "visualization_type": params.get("visualization", "pie")
            }
        
        elif params["analysis_type"] == "trend":
            # For time trend analysis, we keep the time dimension
            results = {
                "analysis_type": "Time Trend Analysis",
                "channels": MODEL.model_info["channels"],
                "time_periods": time_periods,
                "contributions_over_time": mean_contributions.tolist(),
                "visualization_type": params.get("visualization", "line")
            }
        
        else:  # Default to general analysis with multiple metrics
            # Sum contributions across time for total contribution
            total_contributions = np.sum(mean_contributions, axis=0)
            # Calculate percentage contribution
            total_sum = np.sum(total_contributions)
            percentage_contribution = (total_contributions / total_sum * 100) if total_sum > 0 else np.zeros_like(total_contributions)
            
            # ROI calculation if available
            roi_metrics = {}
            if roi_values is not None:
                mean_roi = np.mean(roi_values, axis=(0, 1))
                roi_metrics = {
                    "mean_roi": mean_roi.tolist()
                }
            
            results = {
                "analysis_type": "General Model Analysis",
                "channels": MODEL.model_info["channels"],
                "total_contributions": total_contributions.tolist(),
                "percentage_contribution": percentage_contribution.tolist(),
                "visualization_type": params.get("visualization", "bar"),
                **roi_metrics
            }
        
        # Add any adstock or saturation parameters if available
        if hasattr(posterior, 'adstock'):
            results["adstock_parameters"] = np.mean(posterior.adstock.values, axis=(0, 1)).tolist()
        
        if hasattr(posterior, 'saturation'):
            results["saturation_parameters"] = np.mean(posterior.saturation.values, axis=(0, 1)).tolist()
        
        # Generate chart if needed
        if params.get("visualization_needed", False):
            chart_url = generate_chart(results, params)
            if chart_url:
                results["chart_url"] = chart_url
        
        return results
    
    except Exception as e:
        import traceback
        print(f"Error processing model: {str(e)}")
        print(traceback.format_exc())
        return
def get_gemini_response(query: str, model_results: Dict, chat_history: str = "") -> Dict:
    try:
        context = f"""
        Previous conversation:
        {chat_history}
        
        Analyze these marketing mix model results for a business user:
        {json.dumps(model_results, indent=2)}
        
        Question: {query}
        
        Provide key insights and recommendations in simple terms.
        """
        
        for endpoint in GEMINI_ENDPOINTS:
            try:
                response = requests.post(
                    f"{endpoint}?key={API_KEY}",
                    json={
                        "contents": [{
                            "parts": [{"text": context}]
                        }],
                        "generationConfig": {
                            "temperature": 0.4,
                            "maxOutputTokens": 2000
                        }
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("candidates"):
                        return {
                            "response": data["candidates"][0]["content"]["parts"][0]["text"],
                            "status": "success"
                        }
            except Exception as e:
                print(f"Error with endpoint {endpoint}: {str(e)}")
                continue
        
        # Fallback response if Gemini API fails
        return {
            "response": "Based on the marketing mix model analysis, I can see that " + 
                       model_results.get("analysis_type", "the analysis") + 
                       " shows some interesting patterns across your channels. " +
                       "However, I couldn't connect to the AI service for detailed insights. " +
                       "You can still see the chart for a visual representation of the data.",
            "status": "fallback"
        }
    except Exception as e:
        traceback.print_exc()  # Print traceback for debugging
        return {"error": str(e)}

# Application routes
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "model_loaded": MODEL is not None,
        "endpoints": {
            "chat": {"method": "POST", "path": "/chat"},
            "model_info": {"method": "GET", "path": "/model-info"},
            "chat_history": {"method": "GET", "path": "/chat-history/<session_id>"},
            "simulate": {"method": "POST", "path": "/simulate-scenario"}
        }
    })

@app.route("/model-info", methods=["GET"])
def get_model_info():
    if not MODEL:
        return jsonify({"error": "Model not loaded"}), 400
    return jsonify(MODEL.model_info)

@app.route("/chat", methods=["POST"])
def handle_chat():
    try:
        data = request.get_json()
        user_input = data.get("message")
        session_id = data.get("session_id", str(uuid.uuid4()))
        
        if not user_input:
            return jsonify({"error": "No message provided"}), 400
        
        # Get previous messages for context
        previous_messages = []
        with get_db() as db:
            session = db.query(ChatSession).filter_by(session_id=session_id).first()
            if session:
                previous_messages = db.query(ChatMessage)\
                    .filter_by(session_id=session.id)\
                    .order_by(ChatMessage.timestamp.asc())\
                    .all()
        
        # Build context from previous messages
        chat_history = "\n".join(
            f"{msg.sender}: {msg.message_text}" 
            for msg in previous_messages[-10:]  # Last 10 messages for context
        )
        
        # Process with model including context
        model_results = process_with_model(user_input, chat_history)
        if "error" in model_results:
            return jsonify(model_results), 400
        
        # Get Gemini response with context
        gemini_response = get_gemini_response(user_input, model_results, chat_history)
        if "error" in gemini_response:
            return jsonify(gemini_response), 400
        
        # Store conversation
        with get_db() as db:
            session = db.query(ChatSession).filter_by(session_id=session_id).first()
            if not session:
                session = ChatSession(session_id=session_id)
                db.add(session)
                db.commit()
            
            # Store user message
            user_msg = ChatMessage(
                session_id=session.id,
                message_text=user_input,
                sender="user",
                message_metadata={"model_results": model_results}
            )
            db.add(user_msg)
            db.flush()  # Get the message ID
            
            # Store bot response
            bot_msg = ChatMessage(
                session_id=session.id,
                message_text=gemini_response["response"],
                sender="bot",
                message_metadata={"model_results": model_results}
            )
            db.add(bot_msg)
            db.flush()
            
            if "chart_url" in model_results:
                chart = Chart(
                    message_id=bot_msg.id,
                    chart_url=model_results["chart_url"],
                    chart_type="analysis",
                    analysis_type=model_results["analysis_type"]
                )
                db.add(chart)
            
            db.commit()
        
        return jsonify({
            "response": gemini_response["response"],
            "model_results": model_results,
            "session_id": session_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/chat-history/<session_id>", methods=["GET"])
def get_chat_history(session_id: str):
    try:
        with get_db() as db:
            session = db.query(ChatSession).filter_by(session_id=session_id).first()
            if not session:
                return jsonify({"error": "Session not found"}), 404
            
            messages = db.query(ChatMessage).filter_by(session_id=session.id).order_by(ChatMessage.timestamp).all()
            
            history = []
            for msg in messages:
                history.append({
                    "id": msg.id,
                    "text": msg.message_text,
                    "sender": msg.sender,
                    "timestamp": msg.timestamp.isoformat(),
                    "charts": [chart.chart_url for chart in msg.charts]
                })
            
            return jsonify({"history": history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/simulate-scenario", methods=["POST"])
def simulate_scenario():
    if not MODEL:
        return jsonify({"error": "Model not loaded"}), 400
    
    try:
        data = request.get_json()
        scenario = data.get("scenario", {})
        
        # Sample simulation - replace with your actual simulation logic
        results = {
            "analysis_type": "Scenario Analysis",
            "base_value": 100,
            "simulated_value": 110,
            "change_percentage": 10,
            "chart_url": generate_chart({
                "analysis_type": "Scenario",
                "channels": MODEL.model_info["channels"],
                "values": [100, 110]
            }, {"visualization": "bar"})
        }
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/charts/<filename>", methods=["GET"])
def serve_chart_file(filename: str):
    try:
        return send_from_directory(CHARTS_DIR, filename)
    except FileNotFoundError:
        return jsonify({"error": "Chart not found"}), 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)