"""
Vanta Socials — Test Configuration
Shared fixtures for Playwright browser tests.
"""

import os
import pytest
from pathlib import Path

# Project root (one level up from tests/)
PROJECT_ROOT = Path(__file__).parent.parent.resolve()


@pytest.fixture(scope="session")
def base_url():
    """Return the file:// URL for the main index.html."""
    index_path = PROJECT_ROOT / "index.html"
    return f"file:///{index_path.as_posix()}"


@pytest.fixture(scope="session")
def questionnaire_url():
    """Return the file:// URL for questionnaire.html."""
    q_path = PROJECT_ROOT / "questionnaire.html"
    return f"file:///{q_path.as_posix()}"


@pytest.fixture(scope="session")
def boba_demo_url():
    """Return the file:// URL for the boba shop demo."""
    demo_path = PROJECT_ROOT / "gallery-demo" / "boba-shop.html"
    return f"file:///{demo_path.as_posix()}"


@pytest.fixture(scope="session")
def ugc_url():
    """Return the file:// URL for ugc-apply.html."""
    ugc_path = PROJECT_ROOT / "ugc-apply.html"
    return f"file:///{ugc_path.as_posix()}"


@pytest.fixture(scope="session")
def browser_context_args():
    """Browser context configuration."""
    return {
        "viewport": {"width": 1280, "height": 800},
        "ignore_https_errors": True,
    }
