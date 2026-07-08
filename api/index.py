import sys
import os

# Add parent directory to path so we can import server.py
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# Import the Flask application instance
from server import app
