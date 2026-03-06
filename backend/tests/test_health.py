"""
Phase 2 will add full test suite covering:
- Hand evaluator accuracy
- Range parser correctness
- Equity calculation benchmarks
- API endpoint integration tests
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
