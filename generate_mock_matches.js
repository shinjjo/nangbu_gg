const fs = require('fs');

const chefs = [
    { id: "1", name: "Lee Yeon-bok", image: "https://placehold.co/400?text=Lee" },
    { id: "2", name: "Kim Poong", image: "https://placehold.co/400?text=Kim" },
    { id: "3", name: "Sam Kim", image: "https://placehold.co/400?text=Sam" },
    { id: "4", name: "Choi Hyun-seok", image: "https://placehold.co/400?text=Choi" }
];

const topics = [
    "Spicy Challenge", "Late Night Snack", "Budget Meal", "Fine Dining", "Pasta",
    "Korean Fusion", "Seafood", "Dessert", "Healthy Food", "Party Food",
    "Breakfast", "Hangover Cure", "Anniversary", "Quick Meal", "Vegetarian"
];

const matches = [];

for (let i = 13; i <= 112; i++) {
    // Pick two random different chefs
    const chef1Index = Math.floor(Math.random() * chefs.length);
    let chef2Index = Math.floor(Math.random() * chefs.length);
    while (chef1Index === chef2Index) {
        chef2Index = Math.floor(Math.random() * chefs.length);
    }

    const chef1 = chefs[chef1Index];
    const chef2 = chefs[chef2Index];

    // Pick a winner (or draw)
    const result = Math.random();
    let winnerId = null;
    if (result < 0.45) winnerId = chef1.id;
    else if (result < 0.90) winnerId = chef2.id;
    // else draw

    // Date
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    const topic = topics[Math.floor(Math.random() * topics.length)];

    matches.push(`  { 
    id: "m${i}", 
    date: "${date}", 
    topic: "${topic}", 
    winner_id: ${winnerId ? `"${winnerId}"` : "null"}, 
    chef_1_id: "${chef1.id}", 
    chef_2_id: "${chef2.id}",
    chef_1: { name: "${chef1.name}", image_url: "${chef1.image}" },
    chef_2: { name: "${chef2.name}", image_url: "${chef2.image}" }
  }`);
}

console.log(matches.join(',\n'));
