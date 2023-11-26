import base64

# Replace 'path_to_your_image.jpg' with the path to your image file
with open(r"C:\Users\Hamza\Desktop\Adinteractive\frame.jpg", 'rb') as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    
print(encoded_string)
