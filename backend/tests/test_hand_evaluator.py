"""Tests for hand evaluator service."""

import pytest
from app.core.cards import parse_hand, parse_board
from app.services.hand_evaluator import evaluate_hand, compare_hands, get_winner_indices


class TestEvaluateHand:
    def test_pair_beats_high_card(self):
        hand_pair = parse_hand("AhAd")
        hand_high = parse_hand("KhQd")
        board = parse_board(["2c", "5d", "9s", "Js", "3h"])
        assert evaluate_hand(hand_pair, board) < evaluate_hand(hand_high, board)

    def test_flush_beats_straight(self):
        hand_flush = parse_hand("AhKh")
        hand_straight = parse_hand("9c8d")
        board = parse_board(["2h", "5h", "7h", "6s", "Td"])
        rank_flush = evaluate_hand(hand_flush, board)
        rank_straight = evaluate_hand(hand_straight, board)
        assert rank_flush < rank_straight

    def test_full_house_beats_flush(self):
        hand_fh = parse_hand("AhAd")
        hand_flush = parse_hand("Kh9h")
        board = parse_board(["Ac", "2h", "5h", "2d", "7h"])
        assert evaluate_hand(hand_fh, board) < evaluate_hand(hand_flush, board)


class TestCompareHands:
    def test_returns_rank_per_hand(self):
        hands = [parse_hand("AhAd"), parse_hand("KhKd")]
        board = parse_board(["2c", "5d", "9s", "Js", "3h"])
        ranks = compare_hands(hands, board)
        assert len(ranks) == 2
        assert ranks[0] < ranks[1]  # AA beats KK


class TestGetWinnerIndices:
    def test_single_winner(self):
        hands = [parse_hand("AhAd"), parse_hand("KhKd")]
        board = parse_board(["2c", "5d", "9s", "Js", "3h"])
        winners = get_winner_indices(hands, board)
        assert winners == [0]

    def test_tie(self):
        # Both players have same kickers with board pair
        hand1 = parse_hand("AhKd")
        hand2 = parse_hand("AcKs")
        board = parse_board(["2c", "2d", "5s", "9h", "Js"])
        winners = get_winner_indices([hand1, hand2], board)
        assert len(winners) == 2

    def test_three_players(self):
        hands = [parse_hand("AhAd"), parse_hand("KhKd"), parse_hand("QhQd")]
        board = parse_board(["2c", "5d", "9s", "Js", "3h"])
        winners = get_winner_indices(hands, board)
        assert winners == [0]
