
import random
import datetime

chefs = [
    { "id": "1", "name": "Lee Yeon-bok", "image": "https://placehold.co/400?text=Lee" },
    { "id": "2", "name": "Kim Poong", "image": "https://placehold.co/400?text=Kim" },
    { "id": "3", "name": "Sam Kim", "image": "https://placehold.co/400?text=Sam" },
    { "id": "4", "name": "Choi Hyun-seok", "image": "https://placehold.co/400?text=Choi" },
    { "id": "5", "name": "Michael", "image": "https://placehold.co/400?text=Michael" },
    { "id": "6", "name": "Hong Seok-cheon", "image": "https://placehold.co/400?text=Hong" },
    { "id": "7", "name": "Jung Ho-young", "image": "https://placehold.co/400?text=Jung" },
    { "id": "8", "name": "Yoo Hyun-soo", "image": "https://placehold.co/400?text=Yoo" },
    { "id": "9", "name": "Oh Se-deuk", "image": "https://placehold.co/400?text=Oh" },
    { "id": "10", "name": "Raymon Kim", "image": "https://placehold.co/400?text=Raymon" },
    { "id": "11", "name": "Gordon Ramsay", "image": "https://placehold.co/400?text=Gordon" },
    { "id": "12", "name": "Jamie Oliver", "image": "https://placehold.co/400?text=Jamie" },
    { "id": "13", "name": "Edward Lee", "image": "https://placehold.co/400?text=Edward" },
    { "id": "14", "name": "Baek Jong-won", "image": "https://placehold.co/400?text=Baek" },
    { "id": "15", "name": "Park Jun-woo", "image": "https://placehold.co/400?text=Park" },
    { "id": "16", "name": "Lee Won-il", "image": "https://placehold.co/400?text=Wonil" },
    { "id": "17", "name": "Song Hoon", "image": "https://placehold.co/400?text=Song" },
    { "id": "18", "name": "Kim Seung-min", "image": "https://placehold.co/400?text=Seung" },
    { "id": "19", "name": "Yeo Kyung-rae", "image": "https://placehold.co/400?text=Yeo" },
    { "id": "20", "name": "Fabrizio", "image": "https://placehold.co/400?text=Fabri" },
    { "id": "21", "name": "Matthew", "image": "https://placehold.co/400?text=Matthew" },
    { "id": "22", "name": "Mikael", "image": "https://placehold.co/400?text=Mikael" },
    { "id": "23", "name": "Tony An", "image": "https://placehold.co/400?text=Tony" },
    { "id": "24", "name": "Austin Kang", "image": "https://placehold.co/400?text=Austin" },
    { "id": "25", "name": "Kwon Hyuk-soo", "image": "https://placehold.co/400?text=Kwon" },
    { "id": "26", "name": "Don Spike", "image": "https://placehold.co/400?text=Don" },
    { "id": "27", "name": "Defconn", "image": "https://placehold.co/400?text=Defconn" },
    { "id": "28", "name": "Kim Dong-wan", "image": "https://placehold.co/400?text=Dongwan" },
    { "id": "29", "name": "Tablo", "image": "https://placehold.co/400?text=Tablo" },
    { "id": "30", "name": "G-Dragon", "image": "https://placehold.co/400?text=GD" }
]

topics = [
    "Spicy Challenge", "Late Night Snack", "Budget Meal", "Fine Dining", "Pasta", 
    "Korean Fusion", "Seafood", "Dessert", "Healthy Food", "Party Food",
    "Breakfast", "Hangover Cure", "Anniversary", "Quick Meal", "Vegetarian",
    "Chicken Dish", "Beef Battle", "Pork Feast", "Noodle War", "Tofu Special"
]

match_entries = []

# Generate 150 matches
for i in range(1, 151):
    # Pick two random different chefs
    chef1 = random.choice(chefs)
    chef2 = random.choice(chefs)
    while chef1["id"] == chef2["id"]:
        chef2 = random.choice(chefs)
    
    # Pick a winner (or draw)
    # 45% chef1 wins, 45% chef2 wins, 10% draw
    result = random.random()
    winner_id = "null"
    if result < 0.45:
        winner_id = f'"{chef1["id"]}"'
    elif result < 0.90:
        winner_id = f'"{chef2["id"]}"'
    
    # Date (random date in 2024 or 2025)
    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date(2025, 12, 31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + datetime.timedelta(days=random_number_of_days)
    date_str = random_date.strftime("%Y-%m-%d")
    
    topic = random.choice(topics)

    match_str = f"""  {{ 
    id: "m{i}", 
    date: "{date_str}", 
    topic: "{topic}", 
    winner_id: {winner_id}, 
    chef_1_id: "{chef1['id']}", 
    chef_2_id: "{chef2['id']}",
    chef_1: {{ name: "{chef1['name']}", image_url: "{chef1['image']}" }},
    chef_2: {{ name: "{chef2['name']}", image_url: "{chef2['image']}" }}
  }}"""
    match_entries.append(match_str)

# Construct the full file content
matches_string = ",\n".join(match_entries)
file_content = f"""import {{ Match }} from '../types';

export const MOCK_MATCHES: Match[] = [
{matches_string}
];
"""

print(file_content)
