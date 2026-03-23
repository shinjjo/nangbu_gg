import recipesData from '../data/recipes.json';

export function findRecipeId(chefName: string | undefined, dishName: string | undefined): string | null {
    if (!chefName || !dishName) return null;
    
    const normalizedChef = chefName.replace(/\s*셰프\s*$/, '').trim().toLowerCase();
    const normalizedDish = dishName.trim().toLowerCase();

    for (const recipe of recipesData as any[]) {
        for (const chef of recipe.chefs) {
            const normalizedChefInData = chef.chef_name.replace(/\s*셰프\s*$/, '').trim().toLowerCase();
            const normalizedDishInData = chef.dish_name.trim().toLowerCase();
            
            if (normalizedChefInData === normalizedChef && normalizedDishInData === normalizedDish) {
                return recipe.id;
            }
        }
    }
    
    // Fallback: If no exact match, try matching by dish name only (if unique enough)
    for (const recipe of recipesData as any[]) {
        for (const chef of recipe.chefs) {
            if (chef.dish_name.trim().toLowerCase() === normalizedDish) {
                return recipe.id;
            }
        }
    }

    console.warn(`findRecipeId: No match found for chef="${chefName}", dish="${dishName}"`);
    return null;
}
