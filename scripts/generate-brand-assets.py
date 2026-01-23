#!/usr/bin/env python3
"""
Generate production-ready brand assets from GasMeUp logo.

This script generates:
- favicon.ico (16x16 and 32x32)
- icon.png (512x512, for app icon and metadata)
- logo.png (optimized for navbar and general UI use, transparent background if possible)

Usage:
    python scripts/generate-brand-assets.py <path_to_logo.jpg>
"""

import sys
import os
from pathlib import Path
from PIL import Image, ImageOps

def create_favicon(source_image, output_dir):
    """Create favicon.ico with 16x16 and 32x32 sizes."""
    sizes = [(16, 16), (32, 32)]
    images = []
    
    for size in sizes:
        # Resize and create square version
        img = source_image.copy()
        img.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Create square canvas
        square = Image.new('RGBA', size, (0, 0, 0, 0))
        
        # Center the image
        if img.size[0] < size[0] or img.size[1] < size[1]:
            offset = ((size[0] - img.size[0]) // 2, (size[1] - img.size[1]) // 2)
            square.paste(img, offset)
        else:
            square.paste(img, (0, 0))
        
        images.append(square)
    
    # Save as ICO
    ico_path = output_dir / 'favicon.ico'
    images[0].save(ico_path, format='ICO', sizes=[(16, 16), (32, 32)])
    print(f"✓ Created {ico_path}")

def create_icon(source_image, output_dir):
    """Create icon.png at 512x512."""
    img = source_image.copy()
    img = img.resize((512, 512), Image.Resampling.LANCZOS)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    icon_path = output_dir / 'icon.png'
    img.save(icon_path, format='PNG', optimize=True)
    print(f"✓ Created {icon_path}")

def create_logo(source_image, output_dir):
    """Create logo.png optimized for navbar use (transparent background)."""
    # For navbar, we want a reasonable size - let's use height of 40px
    # but maintain aspect ratio, so width will be calculated
    target_height = 40
    aspect_ratio = source_image.width / source_image.height
    target_width = int(target_height * aspect_ratio)
    
    img = source_image.copy()
    img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Convert to RGBA if not already (for transparency support)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # If the source has a dark background, try to make it transparent
    # This is a simple approach - for better results, use image processing tools
    # For now, we'll keep the image as-is but ensure it's RGBA
    
    logo_path = output_dir / 'logo.png'
    img.save(logo_path, format='PNG', optimize=True)
    print(f"✓ Created {logo_path} (size: {target_width}x{target_height})")

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate-brand-assets.py <path_to_logo.jpg>")
        sys.exit(1)
    
    logo_path = Path(sys.argv[1])
    
    if not logo_path.exists():
        print(f"Error: Logo file not found: {logo_path}")
        sys.exit(1)
    
    # Load source image
    try:
        source_image = Image.open(logo_path)
        print(f"Loaded source image: {source_image.size} ({source_image.mode})")
    except Exception as e:
        print(f"Error loading image: {e}")
        sys.exit(1)
    
    # Determine output directories
    project_root = Path(__file__).parent.parent
    public_dir = project_root / 'public'
    app_dir = project_root / 'app'
    
    # Create directories if they don't exist
    public_dir.mkdir(exist_ok=True)
    app_dir.mkdir(exist_ok=True)
    
    # Generate assets
    print("\nGenerating brand assets...")
    print("-" * 50)
    
    # Favicon goes in app directory (Next.js convention)
    create_favicon(source_image, app_dir)
    
    # Icon and logo go in public directory
    create_icon(source_image, public_dir)
    create_logo(source_image, public_dir)
    
    print("-" * 50)
    print("\n✓ All brand assets generated successfully!")
    print(f"\nFiles created:")
    print(f"  - {app_dir / 'favicon.ico'}")
    print(f"  - {public_dir / 'icon.png'}")
    print(f"  - {public_dir / 'logo.png'}")

if __name__ == '__main__':
    main()


