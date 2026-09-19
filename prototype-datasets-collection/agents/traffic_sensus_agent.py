"""Compatibility import for the original ``traffic_sensus_agent`` name.

New integrations should prefer :mod:`agents.traffic_census_agent`.
"""

from .traffic_census_agent import run_traffic_census_agent

run_traffic_sensus_agent = run_traffic_census_agent

__all__ = ["run_traffic_census_agent", "run_traffic_sensus_agent"]
