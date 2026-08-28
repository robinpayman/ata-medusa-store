#!/usr/bin/env python3
"""Generate a photorealistic hotel card pocket with proper lighting and organic texture."""

from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import random

WIDTH = 1400
HEIGHT = 1800

# Create base image
img = Image.new('RGB', (WIDTH, HEIGHT), color=(200, 190, 175))

# Create numpy array for easier manipulation
img_array = np.array(img, dtype=np.float32)

# Generate Perlin-like noise for realistic paper texture
def generate_perlin_noise(width, height, scale=50):
    """Generate more realistic noise texture."""
    noise = np.zeros((height, width))
    for y in range(height):
        for x in range(width):
            value = 0
            amplitude = 1
            frequency = 1
            max_value = 0
            
            for _ in range(4):
                nx = x * frequency / scale
                ny = y * frequency / scale
                
                # Simple hash-based pseudo-random
                value += amplitude * (np.sin(nx) * np.sin(ny))
                max_value += amplitude
                amplitude *= 0.5
                frequency *= 2
            
            noise[y, x] = (value / max_value) * 25
    return noise

# Apply realistic paper noise
print("Generating paper texture...")
noise = generate_perlin_noise(WIDTH, HEIGHT, scale=60)

for i in range(3):
    img_array[:,:,i] += noise

# Add color variation (kraft paper has natural brownish tones)
color_variation = np.random.normal(0, 8, (HEIGHT, WIDTH, 3))
img_array += color_variation

# Clamp values
img_array = np.clip(img_array, 0, 255)

# Create pocket shape with gradients and shadows
print("Drawing pocket...")
img_from_array = Image.fromarray(img_array.astype(np.uint8))
draw = ImageDraw.Draw(img_from_array, 'RGBA')

# Pocket dimensions
pocket_margin = 80
pocket_left = pocket_margin
pocket_right = WIDTH - pocket_margin
pocket_top = 200
pocket_bottom = HEIGHT - 150

pocket_width = pocket_right - pocket_left
pocket_height = pocket_bottom - pocket_top

# Draw shadow/depth
shadow_color = (60, 55, 50, 120)
for offset in range(12, 0, -1):
    alpha = int(120 * (offset / 12) * 0.3)
    draw.rectangle(
        [(pocket_left + offset, pocket_top + offset),
         (pocket_right + offset, pocket_bottom + offset)],
        fill=(0, 0, 0, alpha)
    )

# Draw main pocket envelope with thumb notch
pocket_points = [
    (pocket_left, pocket_top + 50),
    (pocket_left + pocket_width * 0.3, pocket_top - 10),
    (pocket_left + pocket_width * 0.35, pocket_top - 35),
    (pocket_left + pocket_width * 0.5, pocket_top - 45),  # Peak of thumb notch
    (pocket_left + pocket_width * 0.65, pocket_top - 35),
    (pocket_left + pocket_width * 0.7, pocket_top - 10),
    (pocket_right, pocket_top + 50),
    (pocket_right, pocket_bottom),
    (pocket_left, pocket_bottom),
]

# Main pocket fill
draw.polygon(pocket_points, fill=(235, 225, 210, 255))

# Add edge highlight for realism
draw.line(
    [(pocket_left, pocket_top + 50), (pocket_right, pocket_top + 50)],
    fill=(255, 250, 240, 180),
    width=3
)

# Draw realistic fold lines (creases from folding)
crease_color = (180, 170, 155, 100)

# Left crease
draw.line(
    [(pocket_left + 60, pocket_top + 70), (pocket_left + 60, pocket_bottom - 60)],
    fill=crease_color,
    width=2
)

# Right crease
draw.line(
    [(pocket_right - 60, pocket_top + 70), (pocket_right - 60, pocket_bottom - 60)],
    fill=crease_color,
    width=2
)

# Center vertical fold
draw.line(
    [(pocket_left + pocket_width // 2, pocket_top + 100), 
     (pocket_left + pocket_width // 2, pocket_bottom - 80)],
    fill=(190, 180, 165, 80),
    width=1
)

# Horizontal fold/flap line
flap_y = pocket_top + 180
draw.line(
    [(pocket_left + 40, flap_y), (pocket_right - 40, flap_y)],
    fill=(175, 165, 150, 120),
    width=3
)

# Add subtle wear marks and creases
wear_marks = [
    # (x, y, width, opacity)
    (pocket_left + 120, pocket_top + 250, 40, 50),
    (pocket_right - 150, pocket_top + 400, 50, 40),
    (pocket_left + 200, pocket_bottom - 180, 35, 45),
    (pocket_right - 100, pocket_bottom - 120, 45, 35),
]

for x, y, size, opacity in wear_marks:
    for offset in range(size, 0, -2):
        alpha = int(opacity * (1 - offset / size) * 0.6)
        draw.ellipse(
            [(x - offset, y - offset), (x + offset, y + offset)],
            fill=(170, 160, 145, alpha)
        )

# Add corner wear (natural aging)
corner_wear = [
    (pocket_left + 20, pocket_top + 60, 30),
    (pocket_right - 20, pocket_top + 60, 30),
    (pocket_left + 20, pocket_bottom - 20, 35),
    (pocket_right - 20, pocket_bottom - 20, 35),
]

for cx, cy, radius in corner_wear:
    for r in range(radius, 0, -2):
        alpha = int(60 * (1 - r / radius) * 0.5)
        draw.ellipse(
            [(cx - r, cy - r), (cx + r, cy + r)],
            fill=(160, 150, 135, alpha)
        )

# Add subtle texture scratches
for _ in range(8):
    x1 = random.randint(pocket_left + 50, pocket_right - 50)
    y1 = random.randint(pocket_top + 100, pocket_bottom - 100)
    x2 = x1 + random.randint(30, 100)
    y2 = y1 + random.randint(-20, 20)
    draw.line([(x1, y1), (x2, y2)], fill=(170, 160, 145, 40), width=1)

# Apply final gaussian blur for smoothness
img_from_array = img_from_array.filter(ImageFilter.GaussianBlur(radius=1.2))

# Add final fine grain texture
print("Adding fine grain texture...")
final_array = np.array(img_from_array, dtype=np.float32)
grain = np.random.normal(0, 3, (HEIGHT, WIDTH, 3))
final_array += grain
final_array = np.clip(final_array, 0, 255)

final_img = Image.fromarray(final_array.astype(np.uint8))

# Save with high quality
output_path = '/Users/rp/ata-medusa-store/hotel-pocket.png'
final_img.save(output_path, 'PNG', quality=95)

print(f"✓ Photorealistic hotel pocket generated: {output_path}")
print(f"  Dimensions: {WIDTH}x{HEIGHT}px")
print(f"  Format: PNG (high-quality, web-ready)")
