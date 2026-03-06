"""Tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_ok(self):
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["version"] == "0.1.0"


class TestEquityEndpoint:
    def test_hand_vs_hand(self):
        res = client.post("/api/v1/equity", json={
            "players": [{"hand": "AhAd"}, {"hand": "KhKd"}],
            "board": ["2c", "5d", "9s", "Js", "3h"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["method"] == "exact"
        assert data["players"][0]["equity"] == 100.0

    def test_preflop_monte_carlo(self):
        res = client.post("/api/v1/equity", json={
            "players": [{"hand": "AhAd"}, {"hand": "KhKd"}],
            "iterations": 5000,
        })
        assert res.status_code == 200
        data = res.json()
        assert data["method"] == "montecarlo"
        assert 79 <= data["players"][0]["equity"] <= 86

    def test_range_vs_range(self):
        res = client.post("/api/v1/equity", json={
            "players": [{"range": "AA"}, {"range": "KK"}],
            "iterations": 5000,
        })
        assert res.status_code == 200
        data = res.json()
        assert len(data["players"]) == 2

    def test_missing_hand_and_range(self):
        res = client.post("/api/v1/equity", json={
            "players": [{}, {"hand": "KhKd"}],
        })
        assert res.status_code == 422

    def test_too_few_players(self):
        res = client.post("/api/v1/equity", json={
            "players": [{"hand": "AhAd"}],
        })
        assert res.status_code == 422


class TestRangeParseEndpoint:
    def test_parse_pair(self):
        res = client.post("/api/v1/range/parse", json={"range": "AA"})
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == 6

    def test_parse_suited(self):
        res = client.post("/api/v1/range/parse", json={"range": "AKs"})
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == 4

    def test_parse_complex(self):
        res = client.post("/api/v1/range/parse", json={"range": "JJ+,AKs"})
        assert res.status_code == 200
        data = res.json()
        # JJ(6) + QQ(6) + KK(6) + AA(6) + AKs(4) = 28
        assert data["count"] == 28
        assert data["percentage"] > 0

    def test_parse_empty(self):
        res = client.post("/api/v1/range/parse", json={"range": ""})
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == 0
