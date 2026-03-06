"""Tests for equity calculator service."""

import pytest
from app.services.equity_calculator import calculate_equity


class TestExactEquity:
    def test_aa_vs_kk_on_river(self):
        """Complete board — exact single evaluation."""
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            board=["2c", "5d", "9s", "Js", "3h"],
        )
        assert result["method"] == "exact"
        assert result["players"][0]["equity"] == 100.0
        assert result["players"][1]["equity"] == 0.0

    def test_exact_on_turn(self):
        """Turn dealt — only 1 card to deal, exact enumeration."""
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            board=["2c", "5d", "9s", "Js"],
        )
        assert result["method"] == "exact"
        assert result["total_boards"] > 0
        assert result["players"][0]["equity"] > 80

    def test_exact_on_flop(self):
        """Flop dealt — 2 cards to deal, exact enumeration."""
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            board=["2c", "5d", "9s"],
        )
        assert result["method"] == "exact"
        assert result["players"][0]["equity"] > 80


class TestMonteCarloEquity:
    def test_aa_vs_kk_preflop(self):
        """AA vs KK preflop should be ~82% for AA."""
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            iterations=20000,
        )
        assert result["method"] == "montecarlo"
        aa_equity = result["players"][0]["equity"]
        assert 79 <= aa_equity <= 86, f"AA equity {aa_equity}% outside expected range"

    def test_ak_vs_22_preflop(self):
        """AKs vs 22 should be ~48-50% for AK."""
        result = calculate_equity(
            players=[{"hand": "AhKh"}, {"hand": "2c2d"}],
            iterations=20000,
        )
        ak_equity = result["players"][0]["equity"]
        assert 45 <= ak_equity <= 53, f"AK equity {ak_equity}% outside expected range"

    def test_monte_carlo_variance(self):
        """Two runs with same seed should give same result."""
        r1 = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            iterations=10000,
        )
        r2 = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            iterations=10000,
        )
        assert r1["players"][0]["equity"] == r2["players"][0]["equity"]


class TestRangeEquity:
    def test_range_vs_range(self):
        """JJ+ vs AKs — ranges should work."""
        result = calculate_equity(
            players=[{"range": "JJ+"}, {"range": "AKs"}],
            iterations=10000,
        )
        assert result["method"] == "montecarlo"
        assert len(result["players"]) == 2
        total_equity = sum(p["equity"] for p in result["players"])
        assert 99 <= total_equity <= 101  # Should sum to ~100

    def test_hand_vs_range(self):
        """Specific hand vs range."""
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"range": "KK"}],
            iterations=10000,
        )
        assert result["players"][0]["equity"] > 70


class TestResponseShape:
    def test_response_has_required_fields(self):
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            board=["2c", "5d", "9s", "Js", "3h"],
        )
        assert "players" in result
        assert "total_boards" in result
        assert "method" in result
        assert "iterations" in result
        assert "elapsed_ms" in result

    def test_player_result_fields(self):
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            board=["2c", "5d", "9s", "Js", "3h"],
        )
        p = result["players"][0]
        assert "equity" in p
        assert "wins" in p
        assert "ties" in p
        assert "losses" in p

    def test_equities_sum_to_100(self):
        result = calculate_equity(
            players=[{"hand": "AhAd"}, {"hand": "KhKd"}],
            board=["2c", "5d", "9s"],
        )
        total = sum(p["equity"] for p in result["players"])
        assert 99.5 <= total <= 100.5


class TestEdgeCases:
    def test_invalid_player_raises(self):
        with pytest.raises(ValueError):
            calculate_equity(players=[{}, {"hand": "KhKd"}])

    def test_three_players(self):
        result = calculate_equity(
            players=[
                {"hand": "AhAd"},
                {"hand": "KhKd"},
                {"hand": "QhQd"},
            ],
            iterations=5000,
        )
        assert len(result["players"]) == 3
        total = sum(p["equity"] for p in result["players"])
        assert 99 <= total <= 101
