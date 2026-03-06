"""PLO hand evaluator supporting PLO4, PLO5, and PLO6.

Omaha rules: must use exactly 2 hole cards + exactly 3 board cards
to make the best 5-card hand. This applies to all PLO variants.
"""

from itertools import combinations
from treys import Evaluator

_evaluator = Evaluator()


def evaluate_plo_hand(hole_cards: list[int], board: list[int]) -> int:
    """Evaluate a PLO hand (4, 5, or 6 hole cards) against a board.

    Tries all valid combinations of exactly 2 hole cards + exactly 3 board cards.
    Returns the best (lowest) treys rank.

    Args:
        hole_cards: 4, 5, or 6 treys card ints
        board: 3-5 treys card ints

    Returns:
        Best treys hand rank (1=best, 7462=worst)
    """
    if len(hole_cards) < 4 or len(hole_cards) > 6:
        raise ValueError(f"PLO requires 4-6 hole cards, got {len(hole_cards)}")
    if len(board) < 3 or len(board) > 5:
        raise ValueError(f"Board must have 3-5 cards, got {len(board)}")

    best_rank = 7463  # Worse than worst possible

    for hole_combo in combinations(hole_cards, 2):
        for board_combo in combinations(board, 3):
            hand = list(hole_combo)
            b = list(board_combo)
            rank = _evaluator.evaluate(hand, b)
            if rank < best_rank:
                best_rank = rank

    return best_rank


def compare_plo_hands(hands: list[list[int]], board: list[int]) -> list[int]:
    """Evaluate multiple PLO hands against the same board.

    Returns list of ranks, one per hand (lower is better).
    """
    return [evaluate_plo_hand(hand, board) for hand in hands]


def get_plo_winner_indices(hands: list[list[int]], board: list[int]) -> list[int]:
    """Return indices of the winning PLO hand(s). Multiple = tie."""
    ranks = compare_plo_hands(hands, board)
    best_rank = min(ranks)
    return [i for i, rank in enumerate(ranks) if rank == best_rank]
