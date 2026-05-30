import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_predict():
    response = client.post("/predict", json={"text": "This is a test text"})
    assert response.status_code == 200
    data = response.json()
    assert "label" in data
    assert "confidence" in data

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}