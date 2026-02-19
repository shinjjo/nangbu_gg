
import random

chefs = [
    {"id": "1", "name": "Lee Yeon-bok", "image": "https://placehold.co/400?text=Lee"},
    {"id": "2", "name": "Kim Poong", "image": "https://placehold.co/400?text=Kim"},
    {"id": "3", "name": "Sam Kim", "image": "https://placehold.co/400?text=Sam"},
    {"id": "4", "name": "Choi Hyun-seok", "image": "https://placehold.co/400?text=Choi"}
]

topics = [
    "Spicy Challenge", "Late Night Snack", "Budget Meal", "Fine Dining", "Pasta", 
    "Korean Fusion", "Seafood", "Dessert", "Healthy Food", "Party Food",
    "Breakfast", "Hangover Cure", "Anniversary", "Quick Meal", "Vegetarian"
]

matches = []

for i in range(13, 113):
    # Pick two random different chefs
    chef1 = random.choice(chefs)
    chef2 = random.choice(chefs)
    while chef1["id"] == chef2["id"]:
        chef2 = random.choice(chefs)
    
    # Pick a winner (or draw)
    result = random.random()
    winner_id = "null"
    if result < 0.45:
        winner_id = f'"{chef1["id"]}"'
    elif result < 0.90:
        winner_id = f'"{chef2["id"]}"'
    
    # Date
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    date = f"2024-{month:02d}-{day:02d}"
    
    topic = random.choice(topics)

    match_str = f"""  {{ 
    id: "m{i}", 
    date: "{date}", 
    topic: "{topic}", 
    winner_id: {winner_id}, 
    chef_1_id: "{chef1['id']}", 
    chef_2_id: "{chef2['id']}",
    chef_1: {{ name: "{chef1['name']}", image_url: "{chef1['image']}" }},
    chef_2: {{ name: "{chef2['name']}", image_url: "{chef2['image']}" }}
  }}"""
    matches.append(match_str)

print(",\n".join(matches))
