"""Tests for PLO evaluator and PLO equity calculations."""

import pytest
from app.core.cards import parse_hand, parse_board
from app.services.plo_evaluator import evaluate_plo_hand, get_plo_winner_indices
from app.services.equity_calculator import calculate_equity


class TestPloEvaluator:
    def test_plo4_basic_evaluation(self):
        """PLO4: evaluate a 4-card hand against a board."""
        hand = parse_hand("AhKhQhJh", num_cards=4)
        board = parse_board(["2h", "5h", "9d", "Tc", "3s"])
        rank = evaluate_plo_hand(hand, board)
        assert 1 <= rank <= 7462

    def test_plo4_must_use_exactly_two(self):
        """PLO rule: must use exactly 2 hole cards, not more."""
        # Hand has 4 hearts, board has 1 heart — NOT a flush (only 3 hearts max with 2 hole)
        hand = parse_hand("AhKhQhJh", num_cards=4)
        board = parse_board(["2h", "5d", "9c", "Tc", "3s"])
        rank = evaluate_plo_hand(hand, board)
        # With only 1 board heart, best possible is 2 hole hearts + 1 board heart = 3 hearts, not flush
        # So rank should be worse than a flush
        assert rank > 1600  # Flushes are rank ~1600 or better

    def test_plo5_evaluation(self):
        """PLO5: 5 hole cards still uses exactly 2."""
        hand = parse_hand("AhKhQhJhTd", num_cards=5)
        board = parse_board(["2c", "5d", "9s", "8c", "3h"])
        rank = evaluate_plo_hand(hand, board)
        assert 1 <= rank <= 7462

    def test_plo6_evaluation(self):
        """PLO6: 6 hole cards still uses exactly 2."""
        hand = parse_hand("AhKhQhJhTd9c", num_cards=6)
        board = parse_board(["2c", "5d", "8s", "4c", "3h"])
        rank = evaluate_plo_hand(hand, board)
        assert 1 <= rank <= 7462

    def test_plo4_winner(self):
        """PLO4: determine winner between two hands."""
        hand1 = parse_hand("AhAdKhKd", num_cards=4)  # Aces + Kings
        hand2 = parse_hand("2c3c4c5c", num_cards=4)  # Low cards
        board = parse_board(["7s", "8d", "Js", "Qs", "2d"])
        winners = get_plo_winner_indices([hand1, hand2], board)
        assert winners == [0]  # AA should win

    def test_plo4_invalid_hole_count(self):
        """PLO evaluator rejects wrong number of hole cards."""
        hand = parse_hand("AhKs")  # Only 2 cards
        board = parse_board(["2c", "5d", "9s", "Js", "3h"])
        with pytest.raises(ValueError):
            evaluate_plo_hand(hand, board)


class TestPloEquityCalculator:
    def test_plo4_equity(self):
        """PLO4 hand vs hand equity calculation."""
        result = calculate_equity(
            players=[
                {"hand": "AhAdKhKd"},
                {"hand": "QcQsJcJs"},
            ],
            format="plo4",
            iterations=5000,
        )
        assert result["method"] == "montecarlo"
        assert len(result["players"]) == 2
        total = sum(p["equity"] for p in result["players"])
        assert 99 <= total <= 101

    def test_plo5_equity(self):
        """PLO5 hand vs hand equity calculation."""
        result = calculate_equity(
            players=[
                {"hand": "AhAdKhKdQc"},
                {"hand": "2c3c4c5c6c"},
            ],
            format="plo5",
            iterations=5000,
        )
        assert result["method"] == "montecarlo"
        assert len(result["players"]) == 2

    def test_plo6_equity(self):
        """PLO6 hand vs hand equity calculation."""
        result = calculate_equity(
            players=[
                {"hand": "AhAdKhKdQcQs"},
                {"hand": "2c3c4c5c6c7c"},
            ],
            format="plo6",
            iterations=5000,
        )
        assert result["method"] == "montecarlo"
        assert len(result["players"]) == 2

    def test_plo4_with_board(self):
        """PLO4 with partial board."""
        result = calculate_equity(
            players=[
                {"hand": "AhAdKhKd"},
                {"hand": "QcQsJcJs"},
            ],
            board=["2c", "5d", "9s"],
            format="plo4",
            iterations=5000,
        )
        assert len(result["players"]) == 2
        assert result["elapsed_ms"] < 10000  # Under 10s

    def test_plo_range_not_supported(self):
        """PLO does not support range notation."""
        with pytest.raises(ValueError, match="Range notation is only supported for NLHE"):
            calculate_equity(
                players=[{"range": "AA"}, {"hand": "QcQsJcJs"}],
                format="plo4",
            )

    def test_plo4_three_players(self):
        """PLO4 three-way equity."""
        result = calculate_equity(
            players=[
                {"hand": "AhAdKhKd"},
                {"hand": "QcQsJcJs"},
                {"hand": "Tc9c8c7c"},
            ],
            format="plo4",
            iterations=5000,
        )
        assert len(result["players"]) == 3
        total = sum(p["equity"] for p in result["players"])
        assert 99 <= total <= 101

    def test_plo4_under_5_seconds(self):
        """PLO4 preflop calculation completes in reasonable time."""
        result = calculate_equity(
            players=[
                {"hand": "AhAdKhKd"},
                {"hand": "QcQsJcJs"},
            ],
            format="plo4",
            iterations=10000,
        )
        assert result["elapsed_ms"] < 5000
