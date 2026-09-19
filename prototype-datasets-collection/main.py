from __future__ import annotations

import argparse
import json

from scripts.catalog import load_catalog
from scripts.download import download_group, download_one
from scripts.normalize import normalize_available
from scripts.validate import validate_normalized


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Collect and normalize open datasets for DYAD metro feasibility"
    )
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("catalog", help="validate and summarize the dataset catalog")

    download = commands.add_parser("download", help="download a catalog group")
    download.add_argument(
        "--group", choices=("default", "large", "restricted", "all"), default="default"
    )
    download.add_argument("--dataset", help="download one catalog dataset by id")
    download.add_argument("--force", action="store_true")
    download.add_argument("--accept-restricted-license", action="store_true")

    commands.add_parser("normalize", help="normalize all downloaded inputs")
    commands.add_parser("validate", help="write validation/report.json")
    commands.add_parser("experiment", help="run the four-agent corridor experiment")
    return parser


def main() -> int:
    arguments = build_parser().parse_args()
    if arguments.command == "catalog":
        catalog = load_catalog()
        summary = {
            "schema_version": catalog["schema_version"],
            "dataset_count": len(catalog["datasets"]),
            "groups": {
                group: sum(
                    dataset["group"] == group for dataset in catalog["datasets"]
                )
                for group in ("default", "large", "restricted")
            },
        }
        print(json.dumps(summary, indent=2))
    elif arguments.command == "download":
        if arguments.dataset:
            download_one(
                arguments.dataset,
                force=arguments.force,
                accept_restricted_license=arguments.accept_restricted_license,
            )
        else:
            download_group(
                arguments.group,
                force=arguments.force,
                accept_restricted_license=arguments.accept_restricted_license,
            )
    elif arguments.command == "normalize":
        print(json.dumps(normalize_available(), indent=2))
    elif arguments.command == "validate":
        print(json.dumps(validate_normalized(), indent=2))
    elif arguments.command == "experiment":
        from experiments.run_corridor_experiment import main as run_experiment

        return run_experiment()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
