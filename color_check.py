import sys
from PIL import Image

for file in sys.argv[1:]:
    img = Image.open(file)
    img = img.resize((1, 1))
    color = img.getpixel((0, 0))
    print(f"{file}: {color}")
