"""Compatibility import for the original ``mobility_traffic_aggent`` name.

New integrations should prefer :mod:`agents.mobility_traffic_agent`.
"""

from .mobility_traffic_agent import run_mobility_traffic_agent

run_mobility_traffic_aggent = run_mobility_traffic_agent

__all__ = ["run_mobility_traffic_agent", "run_mobility_traffic_aggent"]
