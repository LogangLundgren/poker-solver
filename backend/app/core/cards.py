"""Card and Deck abstractions wrapping the treys library."""

from treys import Card, Deck


RANKS: str = "23456789TJQKA"
SUITS: str = "hdcs"


def card_str_to_int(card: str) -> int:
    """Convert a card string like 'Ah' to its treys integer representation."""
    return Card.new(card)


def card_int_to_str(card: int) -> str:
    """Convert a treys integer back to a card string like 'Ah'."""
    return Card.int_to_str(card)


def parse_hand(hand_str: str, num_cards: int = 2) -> list[int]:
    """Parse a hand string into a list of treys card ints.

    Args:
        hand_str: Card string, e.g. 'AhKs' (2 cards) or 'AhKsQdJc' (4 cards)
        num_cards: Expected number of cards (2 for NLHE, 4/5/6 for PLO)
    """
    expected_len = num_cards * 2
    if len(hand_str) != expected_len:
        raise ValueError(
            f"Hand string must be exactly {expected_len} characters for {num_cards} cards, "
            f"got '{hand_str}' ({len(hand_str)} chars)"
        )
    return [card_str_to_int(hand_str[i:i+2]) for i in range(0, expected_len, 2)]


def parse_board(board: list[str]) -> list[int]:
    """Convert a list of card strings like ['Ah', 'Kd', '2c'] to treys ints."""
    return [card_str_to_int(card) for card in board]


def get_full_deck() -> list[int]:
    """Return all 52 cards as treys integer representations."""
    return [Card.new(f"{rank}{suit}") for rank in RANKS for suit in SUITS]


def get_available_deck(exclude: list[int]) -> list[int]:
    """Return the full deck minus the excluded cards."""
    exclude_set = set(exclude)
    return [card for card in get_full_deck() if card not in exclude_set]
