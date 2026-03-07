import logging
import json
import io
import os
from app.core.logger import JSONFormatter, setup_logging

def test_json_formatter_with_extra():
    formatter = JSONFormatter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=10,
        msg="test message",
        args=None,
        exc_info=None
    )
    # Add extra attribute
    record.custom_field = "custom_value"
    
    formatted = formatter.format(record)
    data = json.loads(formatted)
    
    assert data["message"] == "test message"
    assert data["custom_field"] == "custom_value"
    assert "timestamp" in data

def test_json_formatter_with_exception():
    formatter = JSONFormatter()
    try:
        raise ValueError("Oops")
    except ValueError:
        import sys
        exc_info = sys.exc_info()
        
    record = logging.LogRecord(
        name="test",
        level=logging.ERROR,
        pathname="test.py",
        lineno=20,
        msg="error message",
        args=None,
        exc_info=exc_info
    )
    
    formatted = formatter.format(record)
    data = json.loads(formatted)
    
    assert data["message"] == "error message"
    assert "exception" in data
    assert "ValueError: Oops" in data["exception"]

def test_setup_logging():
    # Call twice to cover the handlers.clear() path
    setup_logging()
    logger = setup_logging()
    assert isinstance(logger, logging.Logger)
    assert len(logging.getLogger().handlers) >= 2 # Console and File
    assert os.path.exists("logs/app.log")
