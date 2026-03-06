"""Equity calculator supporting NLHE and PLO (4/5/6 card) formats."""

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
from app.services.plo_evaluator import get_plo_winner_indices
from app.services.range_parser import parse_range

# Map format to number of hole cards
FORMAT_HOLE_CARDS = {
    "nlhe": 2,
    "plo4": 4,
    "plo5": 5,
    "plo6": 6,
}


def _resolve_players(
    players: list[dict],
    board_ints: list[int],
    num_hole_cards: int,
) -> tuple[list[list[list[int]]], list[int]]:
    """Resolve each player to a list of possible hands (as treys ints)."""
    dead_cards: list[int] = list(board_ints)
    player_hands: list[list[list[int]]] = []

    for p in players:
        hand_str = p.get("hand")
        range_str = p.get("range")

        if hand_str:
            hand_ints = parse_hand(hand_str, num_cards=num_hole_cards)
            player_hands.append([hand_ints])
            dead_cards.extend(hand_ints)
        elif range_str:
            if num_hole_cards != 2:
                raise ValueError("Range notation is only supported for NLHE")
            combos = parse_range(range_str)
            hands = []
            for c1, c2 in combos:
                hands.append([card_str_to_int(c1), card_str_to_int(c2)])
            player_hands.append(hands)
        else:
            raise ValueError("Each player must have either 'hand' or 'range'")

    return player_hands, dead_cards


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
    format: 'nlhe', 'plo4', 'plo5', or 'plo6'
    """
    start = time.perf_counter()

    num_hole_cards = FORMAT_HOLE_CARDS.get(format, 2)
    is_plo = format in ("plo4", "plo5", "plo6")

    board_strs = board or []
    board_ints = parse_board(board_strs)
    cards_to_deal = 5 - len(board_ints)

    player_hands, dead_cards = _resolve_players(players, board_ints, num_hole_cards)

    # Choose winner function based on format
    winner_fn = get_plo_winner_indices if is_plo else get_winner_indices

    # PLO always uses Monte Carlo. NLHE uses exact when feasible.
    all_specific = all(len(ph) == 1 for ph in player_hands)
    use_exact = (
        not is_plo
        and all_specific
        and cards_to_deal <= 2
        and len(players) <= 2
    )

    if use_exact:
        result = _enumerate_exact(player_hands, board_ints, cards_to_deal, winner_fn)
        method = "exact"
    else:
        result = _monte_carlo(
            player_hands, board_ints, cards_to_deal, iterations, winner_fn
        )
        method = "montecarlo"

    elapsed = (time.perf_counter() - start) * 1000

    player_results = []
    total = result["total"]
    for i in range(len(players)):
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
    cards_to_deal: int,
    winner_fn: callable,
) -> dict:
    """Full enumeration for specific hands."""
    num_players = len(player_hands)
    wins = [0] * num_players
    ties = [0] * num_players
    total = 0

    hands = [ph[0] for ph in player_hands]
    all_known = list(board_ints)
    for h in hands:
        all_known.extend(h)

    deck = get_available_deck(all_known)

    if cards_to_deal == 0:
        winner_idxs = winner_fn(hands, board_ints)
        total = 1
        if len(winner_idxs) == 1:
            wins[winner_idxs[0]] += 1
        else:
            for idx in winner_idxs:
                ties[idx] += 1
    else:
        for combo in combinations(deck, cards_to_deal):
            full_board = board_ints + list(combo)
            winner_idxs = winner_fn(hands, full_board)
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
    cards_to_deal: int,
    iterations: int,
    winner_fn: callable,
) -> dict:
    """Monte Carlo simulation for ranges, PLO, and multi-player scenarios."""
    num_players = len(player_hands)
    wins = [0] * num_players
    ties = [0] * num_players
    total = 0
    rng = random.Random(42)

    for _ in range(iterations):
        chosen_hands: list[list[int]] = []
        used_cards: set[int] = set(board_ints)
        valid = True

        for ph in player_hands:
            # Filter hands that don't conflict with used cards
            available = [
                h for h in ph
                if all(c not in used_cards for c in h)
            ]
            if not available:
                valid = False
                break
            hand = rng.choice(available)
            chosen_hands.append(hand)
            for c in hand:
                used_cards.add(c)

        if not valid:
            continue

        if cards_to_deal > 0:
            deck = get_available_deck(list(used_cards))
            if len(deck) < cards_to_deal:
                continue
            rng.shuffle(deck)
            full_board = board_ints + deck[:cards_to_deal]
        else:
            full_board = board_ints

        winner_idxs = winner_fn(chosen_hands, full_board)
        total += 1
        if len(winner_idxs) == 1:
            wins[winner_idxs[0]] += 1
        else:
            for idx in winner_idxs:
                ties[idx] += 1

    return {"wins": wins, "ties": ties, "total": total}
