# Brand Assets Generation

This script generates production-ready brand assets from your GasMeUp logo.

## Prerequisites

Install Python dependencies:
```bash
pip install Pillow
```

## Usage

1. Place your GasMeUp logo file (JPG format) in the project root or provide the path
2. Run the script:
```bash
python scripts/generate-brand-assets.py path/to/GasMeUp\ logo.jpg
```

Or if the logo is in the project root:
```bash
python scripts/generate-brand-assets.py "GasMeUp logo.jpg"
```

## Generated Files

The script will create:
- `app/favicon.ico` - Favicon with 16x16 and 32x32 sizes
- `public/icon.png` - 512x512 icon for app metadata
- `public/logo.png` - Optimized logo for navbar use (40px height, transparent background)

## Notes

- The script automatically handles image resizing and format conversion
- For best results, use a high-resolution source image
- The logo.png will be optimized for navbar display with a transparent background


