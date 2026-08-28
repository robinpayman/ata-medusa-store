#!/usr/bin/env python3
"""Generate a realistic, organic hotel card pocket image (natural kraft paper, no color)."""

from PIL import Image, ImageDraw, ImageFilter
import random
import math

# Image dimensions
WIDTH = 1200
HEIGHT = 1600
DPI = 300

# Create base image with organic off-white/cream background
img = Image.new('RGB', (WIDTH, HEIGHT), color=(242, 238, 232))
pixels = img.load()

# Add organic noise and texture to simulate real kraft paper
random.seed(42)
for i in range(WIDTH):
    for j in range(HEIGHT):
        # Perlin-like noise simulation with multiple octaves
        noise = (
            random.randint(-8, 8) * 0.5 +
            random.randint(-4, 4) * 0.25
        ) if random.random() > 0.7 else 0
        
        r, g, b = img.getpixel((i, j))
        r = max(0, min(255, r + int(noise)))
        g = max(0, min(255, g + int(noise * 0.95)))
        b = max(0, min(255, b + int(noise * 0.9)))
        pixels[i, j] = (r, g, b)

# Apply subtle Gaussian blur for natural texture
img = img.filter(ImageFilter.GaussianBlur(radius=1.5))

# Create a drawable context
draw = ImageDraw.Draw(img, 'RGBA')

# Draw the pocket envelope shape (top with thumb cutout)
pocket_top = 150
pocket_bottom = HEIGHT - 100
pocket_left = 120
pocket_right = WIDTH - 120
pocket_width = pocket_right - pocket_left
pocket_height = pocket_bottom - pocket_top

# Draw main pocket body with subtle shadow
shadow_offset = 8
draw.rectangle(
    [(pocket_left + shadow_offset, pocket_top + shadow_offset),
     (pocket_right + shadow_offset, pocket_bottom + shadow_offset)],
    fill=(100, 95, 88, 40)
)

# Draw pocket with organic edges
points = [
    (pocket_left, pocket_top + 40),
    (pocket_left + pocket_width * 0.35, pocket_top),
    (pocket_left + pocket_width * 0.5, pocket_top - 25),  # Thumb cutout
    (pocket_left + pocket_width * 0.65, pocket_top),
    (pocket_right, pocket_top + 40),
    (pocket_right, pocket_bottom),
    (pocket_left, pocket_bottom),
]

draw.polygon(points, fill=(245, 242, 236, 255), outline=(180, 170, 155, 200))

# Add subtle fold/crease lines
crease_x1 = pocket_left + pocket_width * 0.15
crease_x2 = pocket_right - pocket_width * 0.15

for crease_x in [crease_x1, crease_x2]:
    points_crease = [
        (crease_x, pocket_top + 50),
        (crease_x, pocket_bottom - 50),
    ]
    draw.line(points_crease, fill=(200, 190, 175, 80), width=3)

# Add horizontal fold near bottom
fold_y = pocket_bottom - 150
draw.line(
    [(pocket_left + 50, fold_y), (pocket_right - 50, fold_y)],
    fill=(200, 190, 175, 100),
    width=2
)

# Add subtle stains/aging marks (organic imperfections)
stain_positions = [
    (pocket_left + 200, pocket_top + 300, 40, (220, 210, 200, 60)),
    (pocket_right - 250, pocket_top + 500, 60, (215, 205, 195, 50)),
    (pocket_left + 400, pocket_bottom - 200, 35, (225, 218, 210, 40)),
]

for x, y, radius, color in stain_positions:
    draw.ellipse(
        [(x - radius, y - radius), (x + radius, y + radius)],
        fill=color
    )

# Add very subtle text impression (debossed effect)
text = "POCKET"
font_size = 140
text_y = pocket_top + pocket_height // 3

# Subtle debossed text (very light impression)
draw.text(
    (WIDTH // 2, text_y),
    text,
    fill=(200, 190, 175, 60),
    anchor="mm",
    font=None  # Using default font, can be replaced with custom
)

# Add fine grain texture overlay
grain_img = Image.new('RGB', (WIDTH, HEIGHT), color=(128, 128, 128))
grain_pixels = grain_img.load()

for i in range(WIDTH):
    for j in range(HEIGHT):
        grain_pixels[i, j] = (random.randint(120, 135), random.randint(120, 135), random.randint(120, 135))

grain_img = grain_img.filter(ImageFilter.GaussianBlur(radius=2))
img = Image.blend(img, grain_img, 0.15)

# Final subtle blur for organic feel
img = img.filter(ImageFilter.GaussianBlur(radius=0.8))

# Save as high-quality PNG
output_path = '/Users/rp/ata-medusa-store/hotel-pocket.png'
img.save(output_path, quality=95, dpi=(DPI, DPI))

print(f"✓ Realistic hotel pocket image generated: {output_path}")
print(f"  Dimensions: {WIDTH}x{HEIGHT}px")
print(f"  Format: PNG (high-quality)")
