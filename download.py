import urllib.request
import time
import os

os.makedirs('assets/projects', exist_ok=True)
urls = [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1531206715517-5c0ba140e2b8?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1559027615-cd4487df136b?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1526976775928-f17f1b158609?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504159506876-f8338247a14a?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1469571486040-7a3084ecd1d5?w=400&h=500&fit=crop'
]

# Configure request headers to mimic a browser to avoid HTTP 403 Forbidden
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
}

for i, url in enumerate(urls):
    dest = f'assets/projects/proj-{i}.png'
    print(f"Downloading image {i} from Unsplash...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(dest, 'wb') as f:
                f.write(response.read())
        print(f"Successfully saved {dest}")
        time.sleep(0.5)
    except Exception as e:
        print(f"Failed to download image {i}: {e}")
print("Finished download script.")
