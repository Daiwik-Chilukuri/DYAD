"""
Sandboxed Python Code Interpreter tool for DYAD subagents to run custom math, statistical regressions,
and demographic models within a controlled namespace.
"""

from __future__ import annotations

import io
import math
import sys
import traceback
from typing import Any, Dict


def run_python_code(code_string: str, timeout_seconds: int = 10) -> Dict[str, Any]:
    """
    Executes a Python code block in a sandboxed execution namespace with math, numpy-like primitives.
    Captures stdout and exported variables.
    """
    stdout_capture = io.StringIO()
    old_stdout = sys.stdout

    # Safe builtins subset
    safe_builtins = {
        "abs": abs,
        "round": round,
        "min": min,
        "max": max,
        "sum": sum,
        "len": len,
        "range": range,
        "enumerate": enumerate,
        "zip": zip,
        "float": float,
        "int": int,
        "str": str,
        "list": list,
        "dict": dict,
        "set": set,
        "tuple": tuple,
        "bool": bool,
        "print": print,
    }

    local_vars: Dict[str, Any] = {
        "math": math,
    }

    global_namespace = {
        "__builtins__": safe_builtins,
    }

    try:
        sys.stdout = stdout_capture
        # Execute code in isolated namespace
        exec(code_string, global_namespace, local_vars)
        sys.stdout = old_stdout

        output_text = stdout_capture.getvalue()
        
        # Filter out builtins/modules from exported result
        clean_results = {
            k: v for k, v in local_vars.items()
            if not k.startswith("_") and not hasattr(v, "__call__") and not str(type(v)).startswith("<class 'module")
        }

        return {
            "success": True,
            "stdout": output_text.strip(),
            "variables": clean_results,
            "error": None,
        }

    except Exception as e:
        sys.stdout = old_stdout
        return {
            "success": False,
            "stdout": stdout_capture.getvalue().strip(),
            "variables": {},
            "error": f"{type(e).__name__}: {str(e)}",
            "traceback": traceback.format_exc(),
        }
