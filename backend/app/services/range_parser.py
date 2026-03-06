"""Range notation parser for poker hand ranges.

Parses standard poker range notation strings into lists of specific
two-card combos. Supports pairs, suited/offsuit hands, plus notation,
dash ranges, and comma-separated unions.
"""

from itertools import combinations
from typing import Optional

from app.core.cards import RANKS, SUITS

TOTAL_COMBOS: int = 1326


def _rank_index(rank: str) -> int:
    """Return the numeric index of a rank character within RANKS."""
    idx = RANKS.find(rank)
    if idx == -1:
        raise ValueError(f"Invalid rank: '{rank}'")
    return idx


def _validate_rank(rank: str) -> None:
    """Raise ValueError if *rank* is not a valid single rank character."""
    if len(rank) != 1 or rank not in RANKS:
        raise ValueError(f"Invalid rank: '{rank}'")


def _pair_combos(rank: str) -> list[tuple[str, str]]:
    """Return all 6 combos for a pocket pair of the given rank."""
    cards = [f"{rank}{s}" for s in SUITS]
    return list(combinations(cards, 2))


def _suited_combos(rank_hi: str, rank_lo: str) -> list[tuple[str, str]]:
    """Return the 4 suited combos for two distinct ranks."""
    return [(f"{rank_hi}{s}", f"{rank_lo}{s}") for s in SUITS]


def _offsuit_combos(rank_hi: str, rank_lo: str) -> list[tuple[str, str]]:
    """Return the 12 offsuit combos for two distinct ranks."""
    combos: list[tuple[str, str]] = []
    for s1 in SUITS:
        for s2 in SUITS:
            if s1 != s2:
                combos.append((f"{rank_hi}{s1}", f"{rank_lo}{s2}"))
    return combos


def _all_combos(rank_hi: str, rank_lo: str) -> list[tuple[str, str]]:
    """Return all 16 combos (4 suited + 12 offsuit) for two distinct ranks."""
    return _suited_combos(rank_hi, rank_lo) + _offsuit_combos(rank_hi, rank_lo)


def _ensure_ordered(rank_a: str, rank_b: str) -> tuple[str, str]:
    """Return (higher_rank, lower_rank) based on index in RANKS."""
    if _rank_index(rank_a) >= _rank_index(rank_b):
        return rank_a, rank_b
    return rank_b, rank_a


def _parse_token(token: str) -> list[tuple[str, str]]:
    """Parse a single range token (no commas) into a list of combos.

    Supported formats:
        AA          pair
        AA+         pair-plus
        JJ-99       pair range
        AKs         suited
        ATs+        suited-plus
        KTs-K8s     suited range
        ATo         offsuit
        ATo+        offsuit-plus
        KTo-K8o     offsuit range
        AK          unspecified (all 16 combos)
        AK+         unspecified-plus
        ATs-A8s     suited range (with dash)
    """
    token = token.strip()
    if not token:
        return []

    # --- Dash ranges (e.g. JJ-99, KTs-K8s, KTo-K8o) ---
    if "-" in token:
        parts = token.split("-", 1)
        left, right = parts[0].strip(), parts[1].strip()
        return _parse_dash_range(left, right)

    # --- Plus notation ---
    if token.endswith("+"):
        return _parse_plus(token[:-1])

    # --- Single hand specifiers ---
    if len(token) == 2:
        r1, r2 = token[0], token[1]
        _validate_rank(r1)
        _validate_rank(r2)
        if r1 == r2:
            return _pair_combos(r1)
        hi, lo = _ensure_ordered(r1, r2)
        return _all_combos(hi, lo)

    if len(token) == 3:
        r1, r2, qualifier = token[0], token[1], token[2]
        _validate_rank(r1)
        _validate_rank(r2)
        hi, lo = _ensure_ordered(r1, r2)
        if qualifier == "s":
            return _suited_combos(hi, lo)
        if qualifier == "o":
            return _offsuit_combos(hi, lo)
        raise ValueError(f"Invalid qualifier '{qualifier}' in token '{token}'")

    raise ValueError(f"Unrecognised range token: '{token}'")


def _parse_plus(base: str) -> list[tuple[str, str]]:
    """Handle plus notation: AA+, ATs+, ATo+, AK+."""
    if len(base) == 2:
        r1, r2 = base[0], base[1]
        _validate_rank(r1)
        _validate_rank(r2)
        if r1 == r2:
            # Pair plus: JJ+ -> JJ, QQ, KK, AA
            start_idx = _rank_index(r1)
            combos: list[tuple[str, str]] = []
            for i in range(start_idx, len(RANKS)):
                combos.extend(_pair_combos(RANKS[i]))
            return combos
        # Unspecified plus: AJ+ -> AJ, AQ, AK (move lower rank up)
        hi, lo = _ensure_ordered(r1, r2)
        return _expand_plus_range(hi, lo, None)

    if len(base) == 3:
        r1, r2, qualifier = base[0], base[1], base[2]
        _validate_rank(r1)
        _validate_rank(r2)
        hi, lo = _ensure_ordered(r1, r2)
        if qualifier in ("s", "o"):
            return _expand_plus_range(hi, lo, qualifier)
        raise ValueError(f"Invalid qualifier '{qualifier}' in plus notation '{base}+'")

    raise ValueError(f"Unrecognised plus notation: '{base}+'")


def _expand_plus_range(
    hi: str, lo: str, qualifier: Optional[str]
) -> list[tuple[str, str]]:
    """Expand a plus range by moving the lower rank upward.

    ATs+ -> ATs, AJs, AQs, AKs
    The lower rank walks from its position up to one below *hi*.
    """
    hi_idx = _rank_index(hi)
    lo_idx = _rank_index(lo)
    combos: list[tuple[str, str]] = []
    for i in range(lo_idx, hi_idx):
        current_lo = RANKS[i]
        if qualifier == "s":
            combos.extend(_suited_combos(hi, current_lo))
        elif qualifier == "o":
            combos.extend(_offsuit_combos(hi, current_lo))
        else:
            combos.extend(_all_combos(hi, current_lo))
    return combos


def _parse_dash_range(left: str, right: str) -> list[tuple[str, str]]:
    """Handle dash-range notation: JJ-99, KTs-K8s, KTo-K8o."""
    # --- Pair range: JJ-99 ---
    if len(left) == 2 and left[0] == left[1] and len(right) == 2 and right[0] == right[1]:
        _validate_rank(left[0])
        _validate_rank(right[0])
        hi_idx = _rank_index(left[0])
        lo_idx = _rank_index(right[0])
        if hi_idx < lo_idx:
            hi_idx, lo_idx = lo_idx, hi_idx
        combos: list[tuple[str, str]] = []
        for i in range(lo_idx, hi_idx + 1):
            combos.extend(_pair_combos(RANKS[i]))
        return combos

    # --- Suited/offsuit range: KTs-K8s, KTo-K8o ---
    left_q = left[-1] if len(left) == 3 and left[-1] in ("s", "o") else None
    right_q = right[-1] if len(right) == 3 and right[-1] in ("s", "o") else None

    # Determine ranks
    if left_q:
        l_r1, l_r2 = left[0], left[1]
    elif len(left) == 2:
        l_r1, l_r2 = left[0], left[1]
    else:
        raise ValueError(f"Invalid left side of range: '{left}'")

    if right_q:
        r_r1, r_r2 = right[0], right[1]
    elif len(right) == 2:
        r_r1, r_r2 = right[0], right[1]
    else:
        raise ValueError(f"Invalid right side of range: '{right}'")

    _validate_rank(l_r1)
    _validate_rank(l_r2)
    _validate_rank(r_r1)
    _validate_rank(r_r2)

    # The high card must match on both sides
    l_hi, l_lo = _ensure_ordered(l_r1, l_r2)
    r_hi, r_lo = _ensure_ordered(r_r1, r_r2)

    if l_hi != r_hi:
        raise ValueError(
            f"High card must match in range notation: '{left}-{right}'"
        )

    # Qualifier must match (or both absent)
    qualifier = left_q or right_q
    if left_q and right_q and left_q != right_q:
        raise ValueError(
            f"Qualifier mismatch in range: '{left}-{right}'"
        )

    hi = l_hi
    top_lo_idx = max(_rank_index(l_lo), _rank_index(r_lo))
    bot_lo_idx = min(_rank_index(l_lo), _rank_index(r_lo))

    combos = []
    for i in range(bot_lo_idx, top_lo_idx + 1):
        current_lo = RANKS[i]
        if qualifier == "s":
            combos.extend(_suited_combos(hi, current_lo))
        elif qualifier == "o":
            combos.extend(_offsuit_combos(hi, current_lo))
        else:
            combos.extend(_all_combos(hi, current_lo))
    return combos


def parse_range(range_str: str) -> list[tuple[str, str]]:
    """Parse a comma-separated range string into a deduplicated list of combos.

    Parameters
    ----------
    range_str:
        A poker range string such as ``"AA,KQs,ATo,JJ-99,ATs+"``.

    Returns
    -------
    list[tuple[str, str]]:
        Deduplicated list of two-card tuples, e.g.
        ``[("Ah", "Ad"), ("Kh", "Qh"), ...]``.
    """
    if not range_str or not range_str.strip():
        return []

    tokens = range_str.split(",")
    seen: set[tuple[str, str]] = set()
    result: list[tuple[str, str]] = []

    for token in tokens:
        try:
            combos = _parse_token(token)
        except ValueError:
            # Skip invalid tokens gracefully
            continue
        for combo in combos:
            if combo not in seen:
                seen.add(combo)
                result.append(combo)

    return result


def get_combo_count(range_str: str) -> int:
    """Return the number of unique combos in a range string."""
    return len(parse_range(range_str))


def get_range_percentage(range_str: str) -> float:
    """Return the range as a percentage of all 1326 possible combos."""
    count = get_combo_count(range_str)
    return round(count / TOTAL_COMBOS * 100, 2)
