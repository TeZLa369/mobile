const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const MealAPI = {
    //^ SEARCH MEAL BY NAME

    searchMealsByName: async (query) => {
        try {
            //^ the encodeURIComponenet will replace the spaces with '%20' like: Butter Chicken => Butter%20Chicken
            const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
            const data = await response.json();
            return data.meals || []; //^ If it gets the detail then returns it otherwise returns a blank array
        } catch (error) {
            console.error("Error searching meals by name: ", error);
            return [];
        }
    },


    //^ LOOKUP full meal details by ID
    getMealById: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/lookup.php?=${id}`);
            const data = await response.json();
            return data.meals ? data.meals[0] : null;
        } catch (error) {
            console.error("Error getting meal by id: ", error);
            return null;
        }
    },

    //^ Single random meal
    getRandomMeal: async () => {
        try {
            const response = await fetch(`${BASE_URL}/random.php`);
            const data = await response.json();
            return data.meals ? data.meals[0] : null;
        } catch (error) {
            console.error("Error getting random meal: ", error);
            return null;
        }
    },

    //^ Multiple random meals
    getRandomMeals: async (count = 6) => {
        try {
            const promises = Array(count).fill().map(() => MealAPI.getRandomMeal());
            const meals = await Promise.all(promises);
            return meals.filter((meal) => meal != null);
        } catch (error) {
            console.error("Error getting random meal: ", error);
            return null;
        }
    },

    //^ list all meal categories
    getCategories: async () => {
        try {
            const response = await fetch(`${BASE_URL}/categories.php`);
            const data = await response.json();
            return data.categories || null;
        } catch (error) {
            console.error("Error getting random meal: ", error);
            return null;

        }
    },

    //^ filter by main ingredent
    filterByIngredent: async (ingredent) => {
        try {
            const response = await fetch(`${BASE_URL}/filter.php?=${encodeURIComponent(ingredent)}`);
            const data = await response.json();
            return data.meals || null;
        } catch (error) {
            console.error("Error filtering by ingredents: ", error);
            return [];

        }
    },
    //^ filter by category
    filterByIngredent: async (category) => {
        try {
            const response = await fetch(`${BASE_URL}/filter.php?=${encodeURIComponent(category)}`);
            const data = await response.json();
            return data.meals || null;
        } catch (error) {
            console.error("Error filtering by categories: ", error);
            return [];
        }
    },

    // ^ Transform TheMealDB meal data to our app format
    transformMealData: (meal) => {
        if (!meal) return null;

        // ^ extract ingredients from the meal object
        const ingredents = [];
        for (let i = 1; i < 20; i++) {
            const ingredent = meal[`strIngredients${i}`];
            const measure = meal[`strMeasures${i}`];

            if (!ingredent && ingredent.trim()) {
                const measureTxt = measure && measure.trim() ? `${measure.trim()}` : "";
                ingredents.push(`${measureTxt}${ingredent.trim()}`);
            }
        }

        //^ extract instructions
        const instructions = meal.strInstructions ? meal.strInstructions.split(/\r?\n/).filter((step) => step.trim()) : [];

        return {
            id: meal.idMeal,
            title: meal.strMeal,
            description: meal.strInstructions ? meal.strInstructions.substring(0, 120) + "..." : "Delicious meal from TheMealDB",
            image: meal.strMealThumb,
            cookTime: "30 minutes",
            servings: 4,
            category: meal.strCategory || "Main Course",
            area: meal.strArea,
            ingredents,
            instructions,
            originalData: meal,
        };
    }
}