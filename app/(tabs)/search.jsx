import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { MealAPI } from "../../services/mealAPI";
import { useDebounce } from "../../hooks/useDebounce";
import { searchStyles } from "../../assets/styles/search.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import RecipieCard from "../../components/RecipeCard";
import LoadingSpinner from "../../components/LoadingSpinner";

const SearchScreen = () => {
  const [searchQuery, setsearchQuery] = useState("");
  const [recipes, setrecipes] = useState([]);
  const [loading, setloading] = useState(false);
  const [initialLoading, setinitialLoading] = useState(true);

  const debounceSearchQuery = useDebounce(searchQuery, 300);

  const performSearch = async (query) => {
    // if no search query
    if (!query.trim()) {
      //if the query is empty
      const randomMeals = await MealAPI.getRandomMeals(12);
      return randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter(
          (meal) => meal !== null,
          (meal) => meal !== "beef"
        );
    }

    // search by name first, then by ingredient if no results
    const nameResults = await MealAPI.searchMealsByName(query);
    let results = nameResults;

    if (results.length === 0) {
      const ingridientResults = await MealAPI.filterByIngredent(query);
      results = ingridientResults;
    }
    return results
      .slice(0, 12)
      .map((meal) => MealAPI.transformMealData(meal))
      .filter(meal => meal !== null, meal=> meal !=="beef"); // to get only 12 meal data not like 50k! and filter is used to remove the empty or null values
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const results = await performSearch("");
        setrecipes(results);
      } catch (error) {
        console.error("Error landing initial data: ", error);
      } finally {
        setinitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    const handleSearch = async () => {
      setloading(true);

      try {
        const results = await performSearch(debounceSearchQuery);
        setrecipes(results);
      } catch (error) {
        console.error("Unable to search: ", error);
        setrecipes([]);
      } finally {
        setloading(false);
      }
    };
    handleSearch();
  }, [debounceSearchQuery, initialLoading]);
     if (initialLoading) return <LoadingSpinner message="Loading search page..." />;

  return (
    <View style={searchStyles.container}>
      <View style={searchStyles.searchSection}>
        <View style={searchStyles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textLight}
            style={searchStyles.searchIcon}
          />
          <TextInput
            placeholder="Search recipes, ingredients"
            style={searchStyles.searchInput}
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setsearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setsearchQuery("")}
              style={searchStyles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={searchStyles.resultsSection}>
        <View style={searchStyles.resultsHeader}>
          <Text style={searchStyles.resultsTitle}>
            {searchQuery ? `Results for "${searchQuery}"` : "Popular Recipes"}
          </Text>
          <Text style={searchStyles.resultsCount}>{recipes.length} found</Text>
        </View>
        {loading ? (
          <View style={searchStyles.loadingContainer}>
            <LoadingSpinner message="Searching..." size="small"/>
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={({ item }) => <RecipieCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={searchStyles.row}
            contentContainerStyle={searchStyles.recipesGrid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NoResultsFound />}
          />
        )}
      </View>
    </View>
  );
};
export default SearchScreen;

function NoResultsFound() {
  return (
    <View style={searchStyles.emptyState}>
      <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
      <Text style={searchStyles.emptyTitle}>No recipes found</Text>
      <Text style={searchStyles.emptyDescription}>
        Try adjusting your search or try different keywords
      </Text>
    </View>
  );
}
