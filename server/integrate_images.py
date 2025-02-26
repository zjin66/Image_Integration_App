import sys
import json
from PIL import Image
import requests
from io import BytesIO
import os
import time

# Input Parameters
environment_image_url = sys.argv[1]
images_data = json.loads(sys.argv[2])

# Helper function to download an image from a URL
def download_image(url):
    response = requests.get(url)
    return Image.open(BytesIO(response.content))

# Load the background (environment) image and ensure it's RGBA
background = download_image(environment_image_url)
if background.mode != 'RGBA':
    background = background.convert('RGBA')  # Convert to RGBA to preserve transparency

# Process each target image and position
for image_data in images_data:
    target_image_url = image_data['imageUrl']
    position = image_data['position']
    width = image_data['width']
    height = image_data['height']
    
    # Load the target image
    target_image = download_image(target_image_url)
    
    # Resize the target image
    target_image = target_image.resize((width, height))
    
    # Debugging: Print out target image size and position
    print(f"Target Image Size: {target_image.size}, Position: {position}")

    # Check if the target image has an alpha channel (transparency)
    if target_image.mode == 'RGBA':
        # Extract the alpha channel as the mask
        alpha = target_image.split()[3]
        background.paste(target_image, (position['x'], position['y']), alpha)
    else:
        # Paste without transparency mask (no alpha channel)
        background.paste(target_image, (position['x'], position['y']))

# Save the final integrated image
output_filename = str(int(time.time())) + "_integrated.png"  # Save as PNG to keep transparency
output_path = os.path.join('uploads', output_filename)
background.save(output_path)

# Output the file name for the server to send to the frontend
print(output_filename)