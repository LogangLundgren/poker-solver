"""Tests for the range parser service."""

import pytest

from app.services.range_parser import (
    TOTAL_COMBOS,
    get_combo_count,
    get_range_percentage,
    parse_range,
)


class TestPairCombos:
    """Pocket pair notation."""

    def test_single_pair(self) -> None:
        combos = parse_range("AA")
        assert len(combos) == 6

    def test_pair_combos_are_unique(self) -> None:
        combos = parse_range("KK")
        assert len(combos) == len(set(combos))

    def test_pair_cards_share_rank(self) -> None:
        for c1, c2 in parse_range("QQ"):
            assert c1[0] == "Q"
            assert c2[0] == "Q"
            assert c1[1] != c2[1]  # different suits


class TestSuitedCombos:
    """Suited hand notation."""

    def test_suited_count(self) -> None:
        assert get_combo_count("AKs") == 4

    def test_suited_same_suit(self) -> None:
        for c1, c2 in parse_range("KQs"):
            assert c1[1] == c2[1]  # same suit

    def test_suited_different_ranks(self) -> None:
        for c1, c2 in parse_range("ATs"):
            assert c1[0] == "A"
            assert c2[0] == "T"


class TestOffsuitCombos:
    """Offsuit hand notation."""

    def test_offsuit_count(self) -> None:
        assert get_combo_count("AKo") == 12

    def test_offsuit_different_suits(self) -> None:
        for c1, c2 in parse_range("AKo"):
            assert c1[1] != c2[1]


class TestUnspecifiedCombos:
    """No s/o qualifier -- all 16 combos."""

    def test_unspecified_count(self) -> None:
        assert get_combo_count("AK") == 16

    def test_unspecified_is_suited_plus_offsuit(self) -> None:
        suited = set(parse_range("AKs"))
        offsuit = set(parse_range("AKo"))
        all_combos = set(parse_range("AK"))
        assert all_combos == suited | offsuit


class TestPlusNotation:
    """Plus (+) range expansion."""

    def test_pair_plus(self) -> None:
        # JJ+ = JJ, QQ, KK, AA = 4 * 6 = 24
        assert get_combo_count("JJ+") == 24

    def test_aa_plus_is_just_aa(self) -> None:
        assert get_combo_count("AA+") == 6

    def test_suited_plus(self) -> None:
        # ATs+ = ATs, AJs, AQs, AKs = 4 * 4 = 16
        assert get_combo_count("ATs+") == 16

    def test_offsuit_plus(self) -> None:
        # ATo+ = ATo, AJo, AQo, AKo = 4 * 12 = 48
        assert get_combo_count("ATo+") == 48

    def test_unspecified_plus(self) -> None:
        # AJ+ = AJ, AQ, AK = 3 * 16 = 48
        assert get_combo_count("AJ+") == 48


class TestDashRange:
    """Dash (-) range notation."""

    def test_pair_range(self) -> None:
        # JJ-99 = JJ, TT, 99 = 3 * 6 = 18
        assert get_combo_count("JJ-99") == 18

    def test_pair_range_reversed(self) -> None:
        # 99-JJ should work the same as JJ-99
        assert get_combo_count("99-JJ") == 18

    def test_suited_range(self) -> None:
        # KTs-K8s = KTs, K9s, K8s = 3 * 4 = 12
        assert get_combo_count("KTs-K8s") == 12

    def test_offsuit_range(self) -> None:
        # KTo-K8o = KTo, K9o, K8o = 3 * 12 = 36
        assert get_combo_count("KTo-K8o") == 36

    def test_single_step_range(self) -> None:
        # AA-AA = just AA = 6
        assert get_combo_count("AA-AA") == 6


class TestCommaSeparated:
    """Comma-separated union of ranges."""

    def test_multiple_tokens(self) -> None:
        # AA(6) + KK(6) + AKs(4) = 16
        assert get_combo_count("AA,KK,AKs") == 16

    def test_deduplication(self) -> None:
        # AA,AA should still be 6
        assert get_combo_count("AA,AA") == 6

    def test_complex_range(self) -> None:
        # JJ+(24) + AKs(4) = 28
        assert get_combo_count("JJ+,AKs") == 28

    def test_whitespace_handling(self) -> None:
        assert get_combo_count(" AA , KK ") == 12


class TestEdgeCases:
    """Edge cases and error handling."""

    def test_empty_string(self) -> None:
        assert parse_range("") == []

    def test_whitespace_only(self) -> None:
        assert parse_range("   ") == []

    def test_invalid_token_skipped(self) -> None:
        # Invalid tokens are skipped; valid ones still parsed
        combos = parse_range("AA,INVALID,KK")
        assert len(combos) == 12  # 6 + 6

    def test_total_combos_constant(self) -> None:
        assert TOTAL_COMBOS == 1326


class TestHelperFunctions:
    """get_combo_count and get_range_percentage."""

    def test_combo_count(self) -> None:
        assert get_combo_count("AA") == 6

    def test_range_percentage(self) -> None:
        pct = get_range_percentage("AA")
        expected = round(6 / 1326 * 100, 2)
        assert pct == expected

    def test_percentage_empty(self) -> None:
        assert get_range_percentage("") == 0.0


class TestComboIntegrity:
    """Verify that produced combos are valid card representations."""

    def test_cards_are_valid(self) -> None:
        valid_ranks = set("23456789TJQKA")
        valid_suits = set("hdcs")
        for c1, c2 in parse_range("AA,AKs,AKo,JJ-99,ATs+"):
            assert c1[0] in valid_ranks
            assert c1[1] in valid_suits
            assert c2[0] in valid_ranks
            assert c2[1] in valid_suits

    def test_no_duplicate_cards_in_combo(self) -> None:
        for c1, c2 in parse_range("AA,AKs,AKo,JJ-99,ATs+"):
            assert c1 != c2, f"Duplicate card in combo: {c1}, {c2}"
