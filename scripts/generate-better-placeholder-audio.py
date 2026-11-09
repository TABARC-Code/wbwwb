#!/usr/bin/env python3
"""
Generate higher-quality placeholder audio for testing.
These are still synthetic/placeholder—replace with real CC0/CC-BY Freesound recordings before shipping.
"""

import os
import sys
import wave
import struct
import math
import random

SAMPLE_RATE = 44100
SOUNDS_DIR = "sounds"

def create_wav_file(filename, samples, sample_rate=SAMPLE_RATE):
    """Write samples to a WAV file."""
    filepath = os.path.join(SOUNDS_DIR, filename)
    with wave.open(filepath, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', int(sample * 32767)))
    print(f"✓ Generated {filename}")

def sine_wave(frequency, duration, amplitude=0.3, sample_rate=SAMPLE_RATE):
    """Generate a sine wave."""
    samples = []
    num_samples = int(sample_rate * duration)
    for i in range(num_samples):
        t = i / sample_rate
        sample = amplitude * math.sin(2 * math.pi * frequency * t)
        samples.append(sample)
    return samples

def frequency_sweep(start_freq, end_freq, duration, amplitude=0.3, sample_rate=SAMPLE_RATE):
    """Generate a frequency sweep (chirp)."""
    samples = []
    num_samples = int(sample_rate * duration)
    for i in range(num_samples):
        t = i / sample_rate
        # Linear frequency sweep
        freq = start_freq + (end_freq - start_freq) * (t / duration)
        sample = amplitude * math.sin(2 * math.pi * freq * t)
        samples.append(sample)
    return samples

def oscillating_sweep(freq1, freq2, duration, amplitude=0.3, sample_rate=SAMPLE_RATE):
    """Generate oscillating frequency sweep (like a siren)."""
    samples = []
    num_samples = int(sample_rate * duration)
    for i in range(num_samples):
        t = i / sample_rate
        # Oscillate between frequencies
        swing = math.sin(2 * math.pi * 2 * t)  # 2 Hz oscillation
        freq = freq1 + (freq2 - freq1) * (swing + 1) / 2
        sample = amplitude * math.sin(2 * math.pi * freq * t)
        samples.append(sample)
    return samples

def white_noise(duration, amplitude=0.15, sample_rate=SAMPLE_RATE):
    """Generate white noise."""
    samples = []
    num_samples = int(sample_rate * duration)
    for i in range(num_samples):
        sample = amplitude * (2 * random.random() - 1)
        samples.append(sample)
    return samples

def layered_siren(low_freq, high_freq, duration, amplitude=0.3, num_layers=3):
    """Generate a multi-layer siren sound."""
    samples = [0] * int(SAMPLE_RATE * duration)
    for layer in range(num_layers):
        layer_freq_low = low_freq + (layer * 100)
        layer_freq_high = high_freq + (layer * 100)
        layer_samples = oscillating_sweep(layer_freq_low, layer_freq_high, duration, amplitude / num_layers)
        for i, sample in enumerate(layer_samples):
            samples[i] += sample
    return samples

def crowd_sound(duration, amplitude=0.2):
    """Generate crowd-like sound (noise + low freq rumble)."""
    noise_samples = white_noise(duration, amplitude * 0.6)
    rumble_samples = sine_wave(80, duration, amplitude * 0.4)
    samples = [n + r for n, r in zip(noise_samples, rumble_samples)]
    return samples

def broadcast_noise(duration, amplitude=0.15):
    """Generate broadcast-like interference."""
    base_noise = white_noise(duration, amplitude * 0.4)
    interference = sine_wave(60, duration, amplitude * 0.3)  # 60 Hz hum
    # Add some modulation
    modulated = []
    for i, (n, interf) in enumerate(zip(base_noise, interference)):
        t = i / SAMPLE_RATE
        mod = 1 + 0.5 * math.sin(2 * math.pi * 3 * t)
        modulated.append((n + interf) * mod * 0.5)
    return modulated

def cheer_sound(duration, amplitude=0.25):
    """Generate crowd cheer (layered noise with pitch variation)."""
    samples = white_noise(duration, amplitude * 0.4)
    # Add multiple pitch layers
    for freq in [150, 200, 250, 300]:
        freq_samples = sine_wave(freq, duration, amplitude * 0.15)
        samples = [s + f for s, f in zip(samples, freq_samples)]
    return samples

def gasp_sound(duration=0.8, amplitude=0.4):
    """Generate a collective gasp."""
    # Quick attack, quick decay
    samples = []
    num_samples = int(SAMPLE_RATE * duration)
    attack = int(num_samples * 0.1)
    decay = int(num_samples * 0.9)

    for i in range(num_samples):
        if i < attack:
            env = i / attack
        elif i < decay:
            env = 1.0
        else:
            env = (num_samples - i) / (num_samples - decay)

        t = i / SAMPLE_RATE
        # Whoosh-like sound
        freq = 300 + (800 * math.sin(2 * math.pi * 2 * t))
        sample = amplitude * env * math.sin(2 * math.pi * freq * t)
        samples.append(sample)
    return samples

def main():
    """Generate all placeholder audio files."""
    if not os.path.exists(SOUNDS_DIR):
        os.makedirs(SOUNDS_DIR)

    print("🎵 Generating Higher-Quality Placeholder Audio")
    print("=" * 50)
    print("Note: These are still synthetic placeholders.")
    print("Replace with real CC0/CC-BY Freesound recordings before shipping.")
    print("=" * 50)
    print()

    # Emergency Sirens
    print("Emergency Sirens:")
    create_wav_file("police_siren.wav", layered_siren(800, 1200, 1.5, 0.35))
    create_wav_file("ambulance_siren.wav", layered_siren(600, 900, 1.8, 0.35))
    create_wav_file("fire_siren.wav", layered_siren(500, 700, 2.0, 0.35))
    print()

    # Crowd Sounds
    print("Crowd Sounds:")
    create_wav_file("crowd_gasp.wav", gasp_sound(1.2, 0.4))
    create_wav_file("crowd_murmur.wav", crowd_sound(15, 0.2))
    create_wav_file("crowd_panic.wav", crowd_sound(12, 0.35))
    print()

    # Media Sounds
    print("Media & Broadcast Sounds:")
    create_wav_file("news_voice.wav", broadcast_noise(1.5, 0.25))
    create_wav_file("tv_static.wav", white_noise(0.5, 0.3))
    create_wav_file("radio_static.wav", broadcast_noise(1.5, 0.2))
    print()

    # Sports Sounds
    print("Sports Sounds:")
    create_wav_file("goal_horn.wav", frequency_sweep(400, 800, 1.5, 0.35))
    create_wav_file("crowd_cheer.wav", cheer_sound(2.5, 0.3))
    create_wav_file("sports_commentary.wav", broadcast_noise(1.5, 0.25))
    print()

    # Seasonal Ads
    print("Seasonal Jingles:")
    create_wav_file("ad_winter.wav", frequency_sweep(600, 1000, 1.5, 0.3))
    create_wav_file("ad_spring.wav", frequency_sweep(400, 1000, 1.5, 0.3))
    create_wav_file("ad_summer.wav", frequency_sweep(800, 1200, 1.5, 0.3))
    create_wav_file("ad_autumn.wav", frequency_sweep(500, 800, 1.5, 0.3))
    print()

    print("=" * 50)
    print("✅ Placeholder audio generated (WAV format)")
    print("Next: Convert to MP3, M4A, Opus with convert-audio-formats.sh")
    print("=" * 50)

if __name__ == "__main__":
    main()
