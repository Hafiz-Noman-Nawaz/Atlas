from PIL import Image, ImageFilter
import numpy as np

src_path = r"C:\Users\nawaz\.gemini\antigravity-ide\brain\c672047e-f1df-4556-a61d-c52cf2d010c2\.user_uploaded\media_1787898683815.png"
img = Image.open(src_path).convert("RGBA")
arr = np.array(img, dtype=np.float32)

r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]

# 1. Outer white background mask
is_white = (r > 240) & (g > 240) & (b > 240)

# 2. Dark container box background mask
# The logo has vibrant colors: cyan (high G, high B), purple (high R, high B), blue (high B)
# Dark background has low max channel or low saturation
max_rgb = np.maximum(np.maximum(r, g), b)
min_rgb = np.minimum(np.minimum(r, g), b)
diff_rgb = max_rgb - min_rgb

# Logo pixels have either strong brightness or strong color saturation
# Outer rounded box is dark blue/black (max_rgb < 45 or (max_rgb < 65 and diff_rgb < 25))
is_dark_bg = (max_rgb < 40) | ((max_rgb < 70) & (diff_rgb < 30))

# Also identify the boundary of the inner emblem
# Calculate alpha:
alpha = np.zeros_like(r)

# For logo pixels, calculate smooth alpha based on brightness and saturation
logo_intensity = np.maximum(diff_rgb, max_rgb - 25)
alpha = np.clip((logo_intensity - 15) * 4.0, 0, 255)

# Clear white outside and dark box
alpha[is_white] = 0
alpha[is_dark_bg] = 0

# Create RGBA image
result_arr = np.dstack((r, g, b, alpha)).astype(np.uint8)
result_img = Image.fromarray(result_arr, mode="RGBA")

# Crop bounding box of non-zero alpha
bbox = result_img.getbbox()
if bbox:
    # Add a tiny 4% margin
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = int(max(w, h) * 0.05)
    
    # Square crop
    cx, cy = (bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2
    half_size = max(w, h) // 2 + pad
    
    cropped = Image.new("RGBA", (half_size * 2, half_size * 2), (0, 0, 0, 0))
    cropped.paste(result_img, (half_size - cx, half_size - cy), mask=result_img)
    result_img = cropped

# Resize nicely to standard favicon sizes
favicon_64 = result_img.resize((64, 64), Image.Resampling.LANCZOS)
favicon_128 = result_img.resize((128, 128), Image.Resampling.LANCZOS)
favicon_256 = result_img.resize((256, 256), Image.Resampling.LANCZOS)

# Save
result_img.save(r"c:\Users\nawaz\OneDrive\Desktop\Chatbot\frontend\public\logo.png", "PNG")
favicon_256.save(r"c:\Users\nawaz\OneDrive\Desktop\Chatbot\frontend\public\favicon.png", "PNG")
favicon_64.save(r"c:\Users\nawaz\OneDrive\Desktop\Chatbot\frontend\public\favicon.ico", "ICO")

print("Favicon & Logo generated successfully!")
