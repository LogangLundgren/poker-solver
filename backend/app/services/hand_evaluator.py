"""Hand evaluator service wrapping the treys Evaluator."""

from treys import Evaluator


# Module-level instance for performance (avoids re-creating lookup tables).
_evaluator = Evaluator()


def evaluate_hand(hand: list[int], board: list[int]) -> int:
    """Evaluate a single hand against a board.

    Args:
        hand: List of exactly 2 treys card ints (hole cards).
        board: List of 3-5 treys card ints (community cards).

    Returns:
        Treys hand rank where 1 is the best and 7462 is the worst.
    """
    return _evaluator.evaluate(hand, board)


def compare_hands(hands: list[list[int]], board: list[int]) -> list[int]:
    """Evaluate multiple hands against the same board.

    Args:
        hands: List of hands, each a list of 2 treys card ints.
        board: List of 3-5 treys card ints.

    Returns:
        List of treys ranks, one per hand (lower is better).
    """
    return [_evaluator.evaluate(hand, board) for hand in hands]


def get_winner_indices(hands: list[list[int]], board: list[int]) -> list[int]:
    """Determine the index(es) of the winning hand(s).

    Args:
        hands: List of hands, each a list of 2 treys card ints.
        board: List of 3-5 treys card ints.

    Returns:
        List of indices into `hands` that share the best (lowest) rank.
        Multiple indices indicate a tie.
    """
    ranks = compare_hands(hands, board)
    best_rank = min(ranks)
    return [i for i, rank in enumerate(ranks) if rank == best_rank]
