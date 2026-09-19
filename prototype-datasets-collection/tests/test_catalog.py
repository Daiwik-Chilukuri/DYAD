from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.catalog import datasets_for_group, load_catalog  # noqa: E402


class CatalogTests(unittest.TestCase):
    def setUp(self) -> None:
        self.catalog = load_catalog()

    def test_catalog_has_unique_dataset_ids(self) -> None:
        identifiers = [dataset["id"] for dataset in self.catalog["datasets"]]
        self.assertEqual(len(identifiers), len(set(identifiers)))

    def test_default_group_has_no_noncommercial_license(self) -> None:
        for dataset in datasets_for_group(self.catalog, "default"):
            self.assertNotIn("NC", dataset["license"])

    def test_restricted_group_is_explicit(self) -> None:
        restricted = datasets_for_group(self.catalog, "restricted")
        self.assertTrue(restricted)
        self.assertTrue(all("NC" in dataset["license"] for dataset in restricted))

    def test_targets_are_unique(self) -> None:
        targets = [dataset["target"] for dataset in self.catalog["datasets"]]
        self.assertEqual(len(targets), len(set(targets)))


if __name__ == "__main__":
    unittest.main()

