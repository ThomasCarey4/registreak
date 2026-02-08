import pyotp
import hashlib
import base64
from datetime import datetime


def generate_lecture_code(lecture_id: int, seed: str) -> str:
    """
    Generate a time-based one-time password (TOTP) for a lecture.
    
    This function is deterministic and stateless—it generates the same code
    for the same lecture_id within a 30-second interval, regardless of which
    pod/instance calls it. This enables horizontal scaling without state.

    Args:
        lecture_id: The unique lecture identifier
        seed: The secret seed to use for generation (from ATTENDANCE_SECRET_SEED config)

    Returns:
        A 4-digit time-based code that rotates every 30 seconds
    """
    secret = _derive_secret(lecture_id, seed)
    totp = pyotp.TOTP(secret, interval=30, digits=4)
    return totp.now()


def verify_lecture_code(lecture_id: int, code: str, seed: str, tolerance: int = 1) -> bool:
    """
    Verify a time-based one-time password (TOTP) for a lecture.
    
    Stateless verification that works across any pod/instance. The code is valid
    if it matches the current or recent TOTP window for the lecture.

    Args:
        lecture_id: The unique lecture identifier
        code: The 4-digit code to verify
        seed: The secret seed used for generation (from ATTENDANCE_SECRET_SEED config)
        tolerance: Number of 30-second intervals to check before/after current time.
                  tolerance=1 checks 3 windows (past 30s, current 30s, next 30s) = 90-second window.
                  Default: 1

    Returns:
        True if the code is valid within the time window, False otherwise
    """
    secret = _derive_secret(lecture_id, seed)
    totp = pyotp.TOTP(secret, interval=30, digits=4)
    return totp.verify(code, valid_window=tolerance)


def _derive_secret(lecture_id: int, seed: str) -> str:
    """
    Derive a deterministic base32-encoded secret for TOTP from lecture_id and seed.
    
    This is an internal helper that ensures all pods derive the exact same secret
    for the same lecture_id, enabling stateless verification.

    Args:
        lecture_id: The unique lecture identifier
        seed: The secret seed

    Returns:
        A base32-encoded secret suitable for TOTP
    """
    combined_secret = f"{seed}_{lecture_id}"
    hashed = hashlib.sha256(combined_secret.encode()).digest()
    secret = base64.b32encode(hashed).decode('utf-8')
    return secret



