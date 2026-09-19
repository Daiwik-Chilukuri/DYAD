"""
DYAD: Modal Cloud Sandboxed Subagents & Math/Stats Verification.
Runs in Modal's remote cloud environment using the 'openai-secret' secret.
Tests:
  1. Python math/statistical simulation sandbox (Gravity model, Monte Carlo ridership, OLS regression).
  2. Multi-agent spatial reasoning with 'gpt-5.6-terra' in the cloud.
"""

import json
import os
import time
import modal

# 1. Define Modal App & Image
app = modal.App("dyad-subagent-sandbox-test")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "openai>=1.65.0",
        "pydantic>=2.10.0",
        "numpy>=1.26.0",
        "scipy>=1.13.0",
        "shapely>=2.0.0",
    )
)

openai_secret = modal.Secret.from_name("openai-secret")


# 2. Remote Cloud Function running in Modal
@app.function(image=image, secrets=[openai_secret], timeout=120)
def run_sandboxed_math_and_subagents():
    """
    Executes entirely in Modal's remote cloud container.
    """
    import numpy as np
    from scipy import stats
    from openai import OpenAI

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        # Search for alternative casing or values starting with sk-
        for k, v in os.environ.items():
            if isinstance(v, str) and v.startswith("sk-"):
                api_key = v
                break
            if "OPENAI" in k.upper():
                api_key = v
                break

    if not api_key:
        custom_env_keys = [
            k for k in os.environ.keys()
            if not k.startswith("MODAL_") and k not in ("PATH", "HOSTNAME", "HOME", "LANG", "PWD", "SHLVL")
        ]
        return {
            "status": "error",
            "message": f"OPENAI_API_KEY not found in Modal secret 'openai-secret'. Visible keys in container: {custom_env_keys}",
        }

    masked_key = api_key[:7] + "..." + api_key[-4:]
    print(f"[Modal Cloud] Initialized container with secret: {masked_key}")

    # -------------------------------------------------------------
    # Test 1: Mathematical Gravity Model for Transit Catchment
    # T_ij = k * (P_i * P_j) / (d_ij ^ gamma)
    # -------------------------------------------------------------
    print("\n[Modal Cloud] Running Math Sandbox: Spatial Gravity Model...")
    silk_board_pop = 85000     # Zone i (Residential hub)
    ecoworld_jobs = 135000     # Zone j (Employment hub)
    distance_km = 6.44         # Distance along Outer Ring Road
    friction_gamma = 1.65      # Road congestion impedance
    k_factor = 0.00012         # Calibration constant

    gravity_flow = k_factor * ((silk_board_pop * ecoworld_jobs) / (distance_km ** friction_gamma))
    gravity_trips = int(round(gravity_flow))

    # -------------------------------------------------------------
    # Test 2: Monte Carlo Ridership Uncertainty (1,000 iterations)
    # -------------------------------------------------------------
    print("[Modal Cloud] Running Stats Sandbox: Monte Carlo Simulation (N=1,000)...")
    np.random.seed(42)
    # Model daily boardings with log-normal distribution
    simulated_ridership = np.random.lognormal(mean=11.6, sigma=0.22, size=1000)
    mean_ridership = int(np.mean(simulated_ridership))
    p10 = int(np.percentile(simulated_ridership, 10))
    p90 = int(np.percentile(simulated_ridership, 90))
    std_ridership = int(np.std(simulated_ridership))

    # -------------------------------------------------------------
    # Test 3: OLS Statistical Regression on Arterial Congestion
    # -------------------------------------------------------------
    print("[Modal Cloud] Running Stats Sandbox: OLS Regression...")
    # Corridor length vs arterial delay reduction across 6 benchmark corridors
    lengths_x = np.array([4.2, 6.44, 8.5, 11.2, 14.0, 18.5])
    delay_reduction_y = np.array([12.5, 19.9, 24.0, 29.5, 33.0, 38.2])

    slope, intercept, r_value, p_value, std_err = stats.linregress(lengths_x, delay_reduction_y)
    r_squared = round(r_value ** 2, 4)

    math_stats_results = {
        "gravity_model": {
            "origin": "Central Silk Board (P_i = 85,000)",
            "destination": "Bellandur RMZ Ecoworld (E_j = 135,000)",
            "distance_km": distance_km,
            "friction_exponent": friction_gamma,
            "projected_daily_trips": gravity_trips,
        },
        "monte_carlo_ridership": {
            "iterations": 1000,
            "mean_daily_passengers": mean_ridership,
            "p10_conservative_estimate": p10,
            "p90_optimistic_estimate": p90,
            "standard_deviation": std_ridership,
        },
        "ols_congestion_regression": {
            "slope_pct_per_km": round(slope, 3),
            "intercept": round(intercept, 3),
            "r_squared": r_squared,
            "p_value": round(p_value, 6),
        },
    }

    # -------------------------------------------------------------
    # Test 4: Cloud Subagent Reasoning with gpt-5.6-terra
    # -------------------------------------------------------------
    print("[Modal Cloud] Querying Subagent 'gpt-5.6-terra' with math/stats telemetry...")
    client = OpenAI(api_key=api_key)

    subagent_prompt = f"""
You are the DYAD Mobility & Economic Quantitative Subagent running inside a sandboxed Modal cloud container.
Review the following empirical math and statistical models executed on the Bangalore Outer Ring Road transit corridor:

1. SPATIAL GRAVITY MODEL (Silk Board -> Bellandur):
   - Projected Daily Commuter Trips: {gravity_trips:,} trips/day
   - Distance: {distance_km} km (Friction exponent: {friction_gamma})

2. MONTE CARLO SIMULATION (N=1,000 runs):
   - Mean Expected Ridership: {mean_ridership:,} daily passengers
   - 90% Confidence Interval: [{p10:,} to {p90:,}] daily passengers
   - Std Dev: {std_ridership:,}

3. OLS REGRESSION (Corridor Length vs Road Delay Reduction):
   - R^2: {r_squared} (p-value: {p_value:.6f})
   - Sensitivity: +{slope:.2f}% congestion relief per km of grade-separated metro

Provide a concise, 3-bullet quantitative assessment interpreting these findings for transit planners.
"""

    t0 = time.time()
    response = client.chat.completions.create(
        model="gpt-5.6-terra",
        messages=[
            {
                "role": "system",
                "content": "You are a senior quantitative transit econometrician. Provide crisp, data-backed bullet points.",
            },
            {"role": "user", "content": subagent_prompt},
        ],
        max_completion_tokens=1000,
    )
    inference_latency_ms = int((time.time() - t0) * 1000)
    msg = response.choices[0].message
    subagent_assessment = msg.content.strip() if msg.content else f"[Empty content - finish_reason: {response.choices[0].finish_reason}]"

    return {
        "status": "success",
        "cloud_environment": "Modal Serverless Linux Container (Debian 3.11)",
        "secret_authenticated": True,
        "subagent_model": "gpt-5.6-terra",
        "subagent_latency_ms": inference_latency_ms,
        "math_stats_telemetry": math_stats_results,
        "subagent_assessment": subagent_assessment,
    }


# 3. Local CLI entrypoint when running `modal run test_modal_subagents.py`
@app.local_entrypoint()
def main():
    print("=" * 72)
    print("   DYAD: Dispatching Sandboxed Subagents to Modal AI Cloud")
    print("=" * 72)
    print("[1] Connecting to Modal Cloud and starting container...")
    
    t_start = time.time()
    result = run_sandboxed_math_and_subagents.remote()
    total_elapsed = round(time.time() - t_start, 2)

    if result.get("status") != "success":
        print(f"\n[x] Error in Cloud Container: {result.get('message')}")
        return

    print(f"\n[OK] Cloud Execution Successful! (Total round-trip: {total_elapsed}s)")
    print(f"    Environment:   {result['cloud_environment']}")
    print(f"    Secret Auth:   {result['secret_authenticated']}")
    print(f"    AI Model:      {result['subagent_model']} (Cloud inference: {result['subagent_latency_ms']}ms)")

    print("\n" + "-" * 72)
    print("📊 1. Sandboxed Math & Statistics Results (computed in cloud):")
    print("-" * 72)
    grav = result["math_stats_telemetry"]["gravity_model"]
    print(f"  • Gravity Model: {grav['origin']} ➔ {grav['destination']}")
    print(f"    Projected Daily Trips: {grav['projected_daily_trips']:,} commuters")

    mc = result["math_stats_telemetry"]["monte_carlo_ridership"]
    print(f"\n  • Monte Carlo (N={mc['iterations']}):")
    print(f"    Mean Daily Ridership:  {mc['mean_daily_passengers']:,} passengers")
    print(f"    80% Core Band (P10-P90): [{mc['p10_conservative_estimate']:,} – {mc['p90_optimistic_estimate']:,}] passengers")

    reg = result["math_stats_telemetry"]["ols_congestion_regression"]
    print(f"\n  • OLS Regression Fit (R² = {reg['r_squared']}):")
    print(f"    Congestion Relief Rate: +{reg['slope_pct_per_km']}% delay drop per km of metro")

    print("\n" + "-" * 72)
    print(f"🧠 2. Cloud Subagent Assessment ('{result['subagent_model']}'):")
    print("-" * 72)
    print(result["subagent_assessment"])
    print("\n" + "=" * 72)
