"""
Pydantic schemas defining the typed data contracts for DYAD's multi-agent spatial evaluation system.
"""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class TelemetryEvent(BaseModel):
    """Real-time progress telemetry emitted via SSE during agent reasoning and tool execution."""
    type: Literal["telemetry"] = "telemetry"
    timestamp: float = Field(..., description="Unix epoch timestamp in seconds")
    agent: str = Field(..., description="Name of the reporting agent, e.g. orchestrator, demographics_specialist")
    status: Literal["planning", "tool_executing", "evaluating", "synthesizing", "completed", "error"] = Field(
        ..., description="Current operational state of the agent"
    )
    action: Optional[str] = Field(None, description="Specific tool or step being executed")
    message: str = Field(..., description="Human-readable status description for UI activity logs")
    progress_pct: Optional[int] = Field(None, ge=0, le=100, description="Overall task completion percentage")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary context for the event")


class StationProposal(BaseModel):
    """Proposed station node along the evaluated transit corridor."""
    name: str = Field(..., description="Proposed station name based on local landmarks/wards")
    latitude: float = Field(..., description="WGS84 Latitude")
    longitude: float = Field(..., description="WGS84 Longitude")
    rationale: str = Field(..., description="Reasoning for station placement (e.g. junction, tech park, hospital)")
    expected_daily_footfall: int = Field(..., ge=0, description="Estimated daily boardings and alightings")
    interchange_potential: bool = Field(False, description="Whether this station connects to BMTC bus terminals or existing metro lines")


class DemographicsPillarMetrics(BaseModel):
    """Pillar 1: Census demographics, population catchment, and spatial equity."""
    catchment_population_500m: int = Field(..., ge=0, description="Total resident population within 500m walking radius")
    catchment_population_1500m: int = Field(..., ge=0, description="Total resident population within 1500m feeder catchment")
    equity_score: float = Field(..., ge=0.0, le=100.0, description="Spatial equity rating from 0 (lowest) to 100 (highest)")
    underserved_demographic_ratio: float = Field(..., ge=0.0, le=1.0, description="Share of transit-dependent or underserved residents")
    dense_ward_names: List[str] = Field(default_factory=list, description="Names of BBMP wards intersected by the corridor")
    analysis_summary: str = Field(..., description="Executive demographic overview written by the Demographics specialist")


class EconomicPillarMetrics(BaseModel):
    """Pillar 2: Commercial hubs, tech corridors, and direct/indirect economic return."""
    tech_parks_within_1km: int = Field(..., ge=0, description="Number of IT/tech campuses within 1km")
    hospitals_within_1km: int = Field(..., ge=0, description="Major healthcare facilities within 1km")
    commercial_centers_within_1km: int = Field(..., ge=0, description="Key commercial/retail centers within 1km")
    projected_annual_farebox_inr_cr: float = Field(..., ge=0.0, description="Projected annual farebox revenue in Crores INR")
    economic_multiplier_index: float = Field(..., description="Economic multiplier factor on city GDP per rupee invested")
    analysis_summary: str = Field(..., description="Executive economic review written by the Economic specialist")


class MobilityPillarMetrics(BaseModel):
    """Pillar 3: Congestion mitigation, travel time savings, and multimodal feeder connectivity."""
    peak_hour_travel_time_saved_mins: float = Field(..., ge=0.0, description="Average minutes saved per commuter during peak hours")
    arterial_congestion_reduction_pct: float = Field(..., ge=0.0, le=100.0, description="Estimated percentage drop in arterial road congestion")
    feeder_route_coverage_score: float = Field(..., ge=0.0, le=100.0, description="Rating of first/last mile feeder bus integration")
    first_last_mile_gap_detected: bool = Field(False, description="Flag indicating whether significant connectivity gaps remain")
    analysis_summary: str = Field(..., description="Executive mobility review written by the Mobility specialist")


class EcologicalPillarMetrics(BaseModel):
    """Pillar 4: Environmental risk, lake catchment buffers, and flood vulnerability."""
    lake_buffer_infringements: int = Field(..., ge=0, description="Count of breaches into statutory 30m lake conservation buffer zones")
    rajakaluve_buffer_infringements: int = Field(..., ge=0, description="Count of breaches into 50m primary stormwater drain buffers")
    ktfd_compliance_status: Literal["COMPLIANT", "FLAGGED", "CRITICAL_BREACH"] = Field(
        ..., description="Karnataka Tank Conservation and Development Authority compliance rating"
    )
    flood_vulnerability_grade: Literal["LOW", "MODERATE", "HIGH"] = Field(
        ..., description="Flood vulnerability classification of the corridor alignment"
    )
    mitigation_strategies: List[str] = Field(default_factory=list, description="Recommended engineering mitigation techniques")
    analysis_summary: str = Field(..., description="Executive environmental review written by the Ecological specialist")


class RiskWarning(BaseModel):
    """Actionable alert flagging municipal, technical, or environmental risks."""
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(..., description="Severity tier of the risk")
    pillar: Literal["demographics", "economic", "mobility", "ecological"] = Field(..., description="Associated domain pillar")
    title: str = Field(..., description="Concise headline of the risk")
    description: str = Field(..., description="Detailed context explaining why this risk is flagged")
    action_required: str = Field(..., description="Mandatory recommendation or mitigation measure")


class AuthorityDossier(BaseModel):
    """
    The comprehensive, synthesis dossier generated by DYAD's Master Orchestrator.
    Combines all 4 domain pillars, risk compliance audits, and station recommendations.
    """
    corridor_id: str = Field(..., description="Unique identifier for the corridor")
    corridor_name: str = Field(..., description="Human-readable corridor designation, e.g. 'Outer Ring Road East Metro'")
    total_length_km: float = Field(..., gt=0.0, description="Calculated total length of the alignment in kilometers")
    estimated_ridership_daily: int = Field(..., ge=0, description="Total estimated daily boardings across the corridor")
    overall_viability_score: float = Field(..., ge=0.0, le=100.0, description="Composite index from 0 to 100 rating total feasibility")

    demographics_pillar: DemographicsPillarMetrics
    economic_pillar: EconomicPillarMetrics
    mobility_pillar: MobilityPillarMetrics
    ecological_pillar: EcologicalPillarMetrics

    risk_warnings: List[RiskWarning] = Field(default_factory=list, description="All prioritized risk warnings")
    policy_recommendations: List[str] = Field(default_factory=list, description="Key policy and operational recommendations")
    suggested_station_locations: List[StationProposal] = Field(default_factory=list, description="Recommended station stops")


class CorridorRequest(BaseModel):
    """Inbound request payload submitted by the UI map canvas to analyze a corridor."""
    corridor_id: str = Field(..., description="Unique client-generated ID")
    corridor_name: str = Field(..., description="User label for the corridor")
    coordinates: List[List[float]] = Field(
        ..., min_length=2, description="Array of [lng, lat] coordinate points defining the corridor geometry"
    )
    budget_cap_inr_cr: Optional[float] = Field(None, description="Optional capital expenditure ceiling in Crores INR")
    target_completion_year: Optional[int] = Field(None, description="Target commissioning year")
