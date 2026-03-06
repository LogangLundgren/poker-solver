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


def parse_hand(hand_str: str) -> list[int]:
    """Parse a hand string like 'AhKs' into a list of treys card ints.

    The input should be exactly 4 characters: two 2-char card tokens.
    """
    if len(hand_str) != 4:
        raise ValueError(f"Hand string must be exactly 4 characters, got '{hand_str}'")
    return [
        card_str_to_int(hand_str[0:2]),
        card_str_to_int(hand_str[2:4]),
    ]


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
