import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_RECIPIES_DIR = path.join('/Users/Shinj/naengbu_crawler/data/final_recipes');
const SOURCE_IMAGES_DIR = path.join('/Users/Shinj/naengbu_crawler/data/recipe_images');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/recipe_images');
const OUTPUT_JSON_PATH = path.join(__dirname, '../src/data/recipes.json');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(OUTPUT_JSON_PATH))) {
  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
}

function parseMarkdownRecipe(fileName, markdown) {
  const lines = markdown.split('\n');
  let currentSection = '';
  
  const recipeData = {
    id: fileName.replace('_final_highres.md', ''),
    guest: '',
    theme: '',
    chefs: []
  };
  
  let currentChef = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('# 📺 대결 정보')) {
      currentSection = 'info';
      continue;
    }
    
    if (line.startsWith('## 👨‍🍳')) {
      currentSection = 'chef';
      if (currentChef) {
        recipeData.chefs.push(currentChef);
      }
      currentChef = {
        chef_name: line.replace('## 👨‍🍳', '').replace(/\d+\./, '').trim(),
        dish_name: '',
        ingredients: '',
        steps: [],
        images: []
      };
      continue;
    }
    
    if (currentSection === 'info') {
      if (line.startsWith('- **게스트 이름:**')) {
        recipeData.guest = line.replace('- **게스트 이름:**', '').trim();
      } else if (line.startsWith('- **대결 주제:**')) {
        recipeData.theme = line.replace('- **대결 주제:**', '').trim();
      }
    } else if (currentSection === 'chef' && currentChef) {
      if (line.startsWith('- **요리 제목:**')) {
        currentChef.dish_name = line.replace('- **요리 제목:**', '').trim();
      } else if (line.startsWith('- **사용 재료:**')) {
        currentChef.ingredients = line.replace('- **사용 재료:**', '').trim();
      } else if (line.startsWith('- **조리 과정 (레시피):**')) {
        // next lines are steps
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith('- **완성 요리 시퀀스') && !lines[j].startsWith('---') && !lines[j].startsWith('## 👨‍🍳')) {
          const stepLine = lines[j].trim();
          if (stepLine && /^\d+\./.test(stepLine)) {
             currentChef.steps.push(stepLine.replace(/^\d+\.\s*/, '').trim());
          }
          j++;
        }
        i = j - 1; // skip processed lines
      } else if (line.startsWith('- **완성 요리 시퀀스)')) {
          // It's handled below
      } else if (line.includes('📸 `![](')) {
          // e.g. 📸 `![](/Users/Shinj/naengbu_crawler/data/recipe_images/0w78sKSucUE_chef1_dish_highres_1.jpg)`
          const match = line.match(/\((.*?)\)/);
           if (match && match[1]) {
              const imagePath = match[1];
              const imageName = path.basename(imagePath);
              currentChef.images.push(imageName);
              
              // Copy image to public directory if it exists
              // We'll copy images separately or just copy what we find. 
              // Note: the markdown might have _dish_highres_1.jpg instead of _shot_XX
           }
      }
    }
  }
  
  if (currentChef) {
    recipeData.chefs.push(currentChef);
  }
  
  return recipeData;
}

function main() {
  const files = fs.readdirSync(SOURCE_RECIPIES_DIR).filter(f => f.endsWith('.md') && !f.includes('_sampled'));
  const allRecipes = [];
  
  // Actually, we should just copy all JPGs from SOURCE_IMAGES_DIR to PUBLIC_IMAGES_DIR
  console.log('Copying images...');
  const allImages = fs.readdirSync(SOURCE_IMAGES_DIR).filter(f => f.toLowerCase().endsWith('.jpg'));
  for(const img of allImages) {
      fs.copyFileSync(path.join(SOURCE_IMAGES_DIR, img), path.join(PUBLIC_IMAGES_DIR, img));
  }
  
  console.log(`Parsing ${files.length} markdown files...`);
  for (const file of files) {
    const rawContent = fs.readFileSync(path.join(SOURCE_RECIPIES_DIR, file), 'utf8');
    const recipe = parseMarkdownRecipe(file, rawContent);
    // Since markdown images might have different names, let's also attach all matching images from the folder to the chef.
    const baseId = recipe.id;
    for (let i = 0; i < recipe.chefs.length; i++) {
        const chefIndex = i + 1; // 1-indexed
        // Find all images matching baseId_chefX_shot_
        const matchingImages = allImages.filter(img => img.startsWith(`${baseId}_chef${chefIndex}_`));
        if(matchingImages.length > 0) {
            // override the parsed images since they might be missing or wrongly named in MD
            // We want to sort them so shot_1 comes before shot_10 etc.
            recipe.chefs[i].images = matchingImages.sort((a,b) => {
                const aMatch = a.match(/_shot_(\d+)/);
                const bMatch = b.match(/_shot_(\d+)/);
                if(aMatch && bMatch) {
                    return parseInt(aMatch[1]) - parseInt(bMatch[1]);
                }
                return 0;
            });
        }
    }
    allRecipes.push(recipe);
  }
  
  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(allRecipes, null, 2));
  console.log(`Successfully wrote recipes.json with ${allRecipes.length} recipes.`);
}

main();
