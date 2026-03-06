"""Equity calculator supporting full enumeration and Monte Carlo simulation."""

import random
import time
from itertools import combinations
from typing import Optional

from app.core.cards import (
    card_str_to_int,
    get_available_deck,
    parse_board,
    parse_hand,
)
from app.services.hand_evaluator import get_winner_indices
from app.services.range_parser import parse_range


def _resolve_players(
    players: list[dict],
    board_ints: list[int],
) -> tuple[list[list[list[int]]], list[int]]:
    """Resolve each player to a list of possible hands (as treys ints).

    Returns (player_hands, dead_cards) where:
    - player_hands[i] is a list of [card1_int, card2_int] possibilities
    - dead_cards are cards that cannot appear on the board
    """
    dead_cards: list[int] = list(board_ints)
    player_hands: list[list[list[int]]] = []

    for p in players:
        hand_str = p.get("hand")
        range_str = p.get("range")

        if hand_str:
            hand_ints = parse_hand(hand_str)
            player_hands.append([hand_ints])
            dead_cards.extend(hand_ints)
        elif range_str:
            combos = parse_range(range_str)
            hands = []
            for c1, c2 in combos:
                hands.append([card_str_to_int(c1), card_str_to_int(c2)])
            player_hands.append(hands)
        else:
            raise ValueError("Each player must have either 'hand' or 'range'")

    return player_hands, dead_cards


def _is_exact_feasible(player_hands: list[list[list[int]]], board_to_deal: int) -> bool:
    """Determine if full enumeration is feasible (small enough search space)."""
    if len(player_hands) > 2:
        return False
    total_combos = 1
    for ph in player_hands:
        total_combos *= len(ph)
    if total_combos > 500:
        return False
    if board_to_deal > 2:
        return False
    return True


def calculate_equity(
    players: list[dict],
    board: Optional[list[str]] = None,
    iterations: int = 20_000,
    format: str = "nlhe",
) -> dict:
    """Calculate equity for given players (hands or ranges).

    Parameters
    ----------
    players: list of dicts with 'hand' or 'range' keys
    board: optional list of board card strings
    iterations: Monte Carlo iterations (ignored for exact)
    format: 'nlhe' or 'plo'

    Returns
    -------
    dict with players (equity/wins/ties/losses), total_boards, method, iterations, elapsed_ms
    """
    start = time.perf_counter()

    board_strs = board or []
    board_ints = parse_board(board_strs)
    cards_to_deal = 5 - len(board_ints)

    player_hands, dead_cards = _resolve_players(players, board_ints)

    # Use exact enumeration only for specific hands with ≤2 cards to deal
    # (flop/turn/river). Preflop (5 cards to deal) = 1.7M combos = too slow.
    all_specific = all(len(ph) == 1 for ph in player_hands)
    use_exact = all_specific and cards_to_deal <= 2 and len(players) <= 2

    if use_exact:
        result = _enumerate_exact(player_hands, board_ints, dead_cards, cards_to_deal)
        method = "exact"
    else:
        result = _monte_carlo(player_hands, board_ints, dead_cards, cards_to_deal, iterations)
        method = "montecarlo"

    elapsed = (time.perf_counter() - start) * 1000

    num_players = len(players)
    player_results = []
    total = result["total"]
    for i in range(num_players):
        wins = result["wins"][i]
        ties = result["ties"][i]
        losses = total - wins - ties
        equity = (wins + ties * 0.5) / total * 100 if total > 0 else 0
        player_results.append({
            "equity": round(equity, 2),
            "wins": wins,
            "ties": ties,
            "losses": losses,
        })

    return {
        "players": player_results,
        "total_boards": total,
        "method": method,
        "iterations": result["total"],
        "elapsed_ms": round(elapsed, 2),
    }


def _enumerate_exact(
    player_hands: list[list[list[int]]],
    board_ints: list[int],
    dead_cards: list[int],
    cards_to_deal: int,
) -> dict:
    """Full enumeration for specific hands."""
    num_players = len(player_hands)
    wins = [0] * num_players
    ties = [0] * num_players
    total = 0

    # Each player has exactly 1 hand (specific cards)
    hands = [ph[0] for ph in player_hands]
    all_known = list(board_ints)
    for h in hands:
        all_known.extend(h)

    deck = get_available_deck(all_known)

    if cards_to_deal == 0:
        # Board is complete
        winner_idxs = get_winner_indices(hands, board_ints)
        total = 1
        if len(winner_idxs) == 1:
            wins[winner_idxs[0]] += 1
        else:
            for idx in winner_idxs:
                ties[idx] += 1
    else:
        for combo in combinations(deck, cards_to_deal):
            full_board = board_ints + list(combo)
            winner_idxs = get_winner_indices(hands, full_board)
            total += 1
            if len(winner_idxs) == 1:
                wins[winner_idxs[0]] += 1
            else:
                for idx in winner_idxs:
                    ties[idx] += 1

    return {"wins": wins, "ties": ties, "total": total}


def _monte_carlo(
    player_hands: list[list[list[int]]],
    board_ints: list[int],
    dead_cards: list[int],
    cards_to_deal: int,
    iterations: int,
) -> dict:
    """Monte Carlo simulation for ranges and multi-player scenarios."""
    num_players = len(player_hands)
    wins = [0] * num_players
    ties = [0] * num_players
    total = 0
    rng = random.Random(42)  # Deterministic seed for reproducibility

    for _ in range(iterations):
        # Pick a specific hand for each range player
        chosen_hands: list[list[int]] = []
        used_cards: set[int] = set(board_ints)
        valid = True

        for ph in player_hands:
            # Filter to hands that don't conflict with used cards
            available = [
                h for h in ph
                if h[0] not in used_cards and h[1] not in used_cards
            ]
            if not available:
                valid = False
                break
            hand = rng.choice(available)
            chosen_hands.append(hand)
            used_cards.add(hand[0])
            used_cards.add(hand[1])

        if not valid:
            continue

        # Deal remaining board cards
        if cards_to_deal > 0:
            deck = [c for c in get_available_deck(list(used_cards))]
            if len(deck) < cards_to_deal:
                continue
            rng.shuffle(deck)
            full_board = board_ints + deck[:cards_to_deal]
        else:
            full_board = board_ints

        winner_idxs = get_winner_indices(chosen_hands, full_board)
        total += 1
        if len(winner_idxs) == 1:
            wins[winner_idxs[0]] += 1
        else:
            for idx in winner_idxs:
                ties[idx] += 1

    return {"wins": wins, "ties": ties, "total": total}
