from PIL import Image
import sys

def remove_bg(input_path, output_path, target_color=(255, 255, 255), tolerance=60):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Calculate distance from target color
            dist = sum([abs(item[i] - target_color[i]) for i in range(3)])
            
            if dist < tolerance:
                newData.append((255, 255, 255, 0)) # Make Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input> <output> [r,g,b]")
    else:
        # Default to green screen if not specified, or parse args
        target = (0, 255, 0) # Default Green
        if len(sys.argv) > 3:
            try:
                rgb = sys.argv[3].split(',')
                target = (int(rgb[0]), int(rgb[1]), int(rgb[2]))
            except:
                pass
        
        remove_bg(sys.argv[1], sys.argv[2], target_color=target)
