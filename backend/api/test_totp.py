#!/usr/bin/env python3
"""
Test script for the attendance verification API.
This demonstrates the TOTP code generation and verification.
"""

import sys
import time
from app.utils import generate_lecture_code, verify_lecture_code


def test_totp_generation():
    """Test TOTP code generation and verification."""
    print("=" * 60)
    print("TOTP Attendance Code Generation Test")
    print("=" * 60)

    seed = "test-seed-demo"
    lecture_id = 1

    print(f"\nSeed: {seed}")
    print(f"Lecture ID: {lecture_id}")
    print("\nGenerating codes (updates every 30 seconds)...")
    print("-" * 60)

    # Generate and verify codes
    for i in range(3):
        code = generate_lecture_code(lecture_id, seed)
        print(f"\n[{i+1}] Generated Code: {code}")

        # Verify the code immediately
        is_valid = verify_lecture_code(lecture_id, code, seed, tolerance=1)
        print(f"    Verification: {'✓ VALID' if is_valid else '✗ INVALID'}")

        # Test with wrong lecture ID
        wrong_valid = verify_lecture_code(999, code, seed, tolerance=1)
        print(f"    Wrong Lecture ID: {'✗ VALID (ERROR!)' if wrong_valid else '✓ INVALID (correct)'}")

        if i < 2:
            print(f"\nWaiting 30 seconds for next code...")
            time.sleep(30)

    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)


def test_tolerance_window():
    """Test the tolerance window for code validation."""
    print("\n" + "=" * 60)
    print("Testing Time Window Tolerance (±1 interval = 90 seconds)")
    print("=" * 60)

    seed = "test-seed-demo"
    lecture_id = 2

    code = generate_lecture_code(lecture_id, seed)
    print(f"\nGenerated Code: {code}")
    print(f"This code should be valid for ~90 seconds total")
    print("(30 seconds before, current 30 seconds, 30 seconds after)")

    # Test immediate verification
    is_valid = verify_lecture_code(lecture_id, code, seed, tolerance=1)
    print(f"\nImmediate verification: {'✓ VALID' if is_valid else '✗ INVALID'}")

    # Test with no tolerance
    is_valid_strict = verify_lecture_code(lecture_id, code, seed, tolerance=0)
    print(f"Strict verification (tolerance=0): {'✓ VALID' if is_valid_strict else '✗ INVALID'}")

    print("\n" + "=" * 60)


def test_different_lectures():
    """Test that different lectures generate different codes."""
    print("\n" + "=" * 60)
    print("Testing Unique Codes for Different Lectures")
    print("=" * 60)

    seed = "test-seed-demo"

    print("\nGenerating codes for different lectures at the same time:")
    codes = {}
    for lecture_id in [1, 2, 3, 4, 5]:
        code = generate_lecture_code(lecture_id, seed)
        codes[lecture_id] = code
        print(f"  Lecture {lecture_id}: {code}")

    # Verify all codes are different
    unique_codes = len(set(codes.values()))
    print(f"\nUnique codes generated: {unique_codes}/{len(codes)}")
    if unique_codes == len(codes):
        print("✓ All lectures have unique codes!")
    else:
        print("✗ WARNING: Some lectures have duplicate codes!")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    print("\n🎓 Lucky Cat Attendance Verification System")
    print("TOTP Code Generation Test Suite\n")

    try:
        # Run all tests
        test_different_lectures()
        test_tolerance_window()

        # Ask if user wants to run the time-based test
        print("\n" + "=" * 60)
        response = input("\nRun real-time code generation test? (takes 60s) [y/N]: ")
        if response.lower() == 'y':
            test_totp_generation()
        else:
            print("\nSkipping real-time test.")

        print("\n✓ All tests completed successfully!\n")

    except KeyboardInterrupt:
        print("\n\n✗ Test interrupted by user.\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n✗ Error: {e}\n")
        sys.exit(1)

