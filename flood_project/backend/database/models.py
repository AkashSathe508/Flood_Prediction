"""
Database models — SQLAlchemy ORM + PostGIS support.
Falls back to SQLite for development.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    type = Column(String(50), default="water_level")  # water_level, rainfall, soil
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    readings = relationship("SensorReading", back_populates="sensor")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    water_level = Column(Float)
    rainfall = Column(Float)

    sensor = relationship("Sensor", back_populates="readings")


class FloodZone(Base):
    __tablename__ = "flood_zones"

    id = Column(Integer, primary_key=True, index=True)
    region_key = Column(String(20), index=True)  # "lat_lng" bucketed to 2 decimal places
    zone_name = Column(String(200))
    geojson = Column(Text)               # store raw GeoJSON string
    risk_score = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    source = Column(String(50), default="osm")  # "osm" | "computed"


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String(50), nullable=False)  # cnn_classifier, cnn_segmentation, lstm
    input_hash = Column(String(64))
    output_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    message = Column(Text, nullable=False)
    lat = Column(Float)
    lng = Column(Float)
    triggered_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
