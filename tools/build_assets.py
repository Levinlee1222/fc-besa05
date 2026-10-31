"""Erzeugt optimierte Web-Assets: Wappen-Varianten, Icons, Bildgrößen, WOFF2-Subsets."""
import os
from PIL import Image, ImageFilter
from fontTools import subset

A = '/assets'
OUT = '/out'
os.makedirs(OUT, exist_ok=True)

# --- Wappen -------------------------------------------------------------
src = Image.open(f'{A}/logo.png').convert('RGBA')

def upscale(img, size):
    return img.resize((size, size), Image.LANCZOS)

def with_outline(img, stroke):
    """Weiße Kontur entlang der Wappenform, damit Schwarz/Rot auf dunklen und roten Flächen lesbar bleibt."""
    pad = stroke * 2
    w, h = img.size
    canvas = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad), img)
    alpha = canvas.getchannel('A').point(lambda a: 255 if a > 24 else 0)
    grown = alpha.filter(ImageFilter.MaxFilter(stroke * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
    outline = Image.new('RGBA', canvas.size, (255, 255, 255, 255))
    outline.putalpha(grown)
    outline.alpha_composite(canvas)
    bbox = outline.getbbox()
    return outline.crop(bbox)

big = upscale(src, 600)
for size in (128, 320):
    img = upscale(src, size)
    img.save(f'{OUT}/logo-{size}.png', optimize=True)
    img.save(f'{OUT}/logo-{size}.webp', quality=92, method=6)

badge = with_outline(big, 14)
for size in (128, 320):
    b = badge.resize((size, round(size * badge.height / badge.width)), Image.LANCZOS)
    b.save(f'{OUT}/logo-badge-{size}.png', optimize=True)
    b.save(f'{OUT}/logo-badge-{size}.webp', quality=92, method=6)

def icon(size, bg, inset):
    canvas = Image.new('RGBA', (size, size), bg)
    inner = round(size * (1 - inset * 2))
    logo = big.resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    canvas.alpha_composite(logo, (off, off))
    return canvas

icon(32, (0, 0, 0, 0), 0).save(f'{OUT}/favicon-32.png', optimize=True)
icon(180, (255, 255, 255, 255), .08).convert('RGB').save(f'{OUT}/apple-touch-icon.png', optimize=True)
icon(192, (255, 255, 255, 255), .08).save(f'{OUT}/icon-192.png', optimize=True)
icon(512, (255, 255, 255, 255), .12).save(f'{OUT}/icon-512.png', optimize=True)
fav = icon(48, (0, 0, 0, 0), 0)
fav.save(f'{OUT}/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])

# Vorschaubild für Social Media (1200x630): Flutlichtfoto, abgedunkelt, Wappen mittig.
og = Image.open(f'{A}/match-night.jpg').convert('RGB')
ratio = 1200 / og.width
og = og.resize((1200, round(og.height * ratio)), Image.LANCZOS)
top = (og.height - 630) // 2
og = og.crop((0, top, 1200, top + 630)).convert('RGBA')
og.alpha_composite(Image.new('RGBA', og.size, (0, 0, 0, 120)))
ob = badge.resize((300, round(300 * badge.height / badge.width)), Image.LANCZOS)
og.alpha_composite(ob, ((1200 - ob.width) // 2, (630 - ob.height) // 2))
og.convert('RGB').save(f'{OUT}/og-image.jpg', quality=82, optimize=True, progressive=True)

# --- Fotos: responsive Größen als WebP + JPEG-Fallback --------------------
for name in ('match-night', 'stadium'):
    img = Image.open(f'{A}/{name}.jpg').convert('RGB')
    for width in (960, 1920):
        r = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS) if img.width > width else img
        r.save(f'{OUT}/{name}-{width}.webp', quality=74, method=6)
        r.save(f'{OUT}/{name}-{width}.jpg', quality=78, optimize=True, progressive=True)

# --- Schriften: WOFF2, auf westeuropäische Zeichen reduziert --------------
unicodes = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2193,U+2212,U+2215'
for font in ('manrope-400', 'manrope-600', 'manrope-700', 'barlow-condensed-700'):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    f = subset.load_font(f'{A}/{font}.ttf', opts)
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(unicodes))
    s.subset(f)
    subset.save_font(f, f'{OUT}/{font}.woff2', opts)

for f in sorted(os.listdir(OUT)):
    print(f'{f:32} {os.path.getsize(os.path.join(OUT, f)):>8}')
