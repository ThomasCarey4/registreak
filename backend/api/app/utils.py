import pyotp
import hashlib
import base64
from datetime import datetime, timedelta
from threading import Lock

# In-memory cache for codes: {code: (lecture_id, timestamp)}
_code_cache = {}
_cache_lock = Lock()


def generate_lecture_code(lecture_id: int, seed: str) -> str:
    """
    Generate a time-based one-time password for a lecture.

    Args:
        lecture_id: The unique lecture identifier
        seed: The secret seed to use for generation

    Returns:
        A 4-digit time-based code that rotates every 30 seconds
    """
    # Create a unique secret by combining seed with lecture_id
    combined_secret = f"{seed}_{lecture_id}"
    # Hash to get a valid base32 secret
    hashed = hashlib.sha256(combined_secret.encode()).digest()
    secret = base64.b32encode(hashed).decode('utf-8')

    # Create TOTP with 30-second interval and 4 digits
    totp = pyotp.TOTP(secret, interval=30, digits=4)
    code = totp.now()

    # Store code in cache with timestamp
    with _cache_lock:
        _code_cache[code] = (lecture_id, datetime.utcnow())
        _clean_old_codes()

    return code


def _clean_old_codes():
    """Remove codes older than 2 minutes from cache. Must be called with lock held."""
    cutoff = datetime.utcnow() - timedelta(minutes=2)
    expired = [code for code, (_, timestamp) in _code_cache.items() if timestamp < cutoff]
    for code in expired:
        del _code_cache[code]


def find_lecture_by_code(code: str) -> int:
    """
    Find a lecture_id by its code from the recent cache.

    Args:
        code: The 4-digit code to look up

    Returns:
        The lecture_id if found, None otherwise
    """
    with _cache_lock:
        _clean_old_codes()
        if code in _code_cache:
            return _code_cache[code][0]
    return None


def verify_lecture_code(lecture_id: int, code: str, seed: str, tolerance: int = 1) -> bool:
    """
    Verify a time-based one-time password for a lecture.

    Args:
        lecture_id: The unique lecture identifier
        code: The code to verify
        seed: The secret seed used for generation
        tolerance: Number of intervals to check before/after current time (default 1)
                  tolerance=1 gives a 90-second window (30s before, current 30s, 30s after)

    Returns:
        True if the code is valid within the time window, False otherwise
    """
    # Create the same unique secret
    combined_secret = f"{seed}_{lecture_id}"
    hashed = hashlib.sha256(combined_secret.encode()).digest()
    secret = base64.b32encode(hashed).decode('utf-8')

    # Create TOTP with 30-second interval and 4 digits
    totp = pyotp.TOTP(secret, interval=30, digits=4)

    # Verify with tolerance (±1 interval = ±30 seconds)
    return totp.verify(code, valid_window=tolerance)



