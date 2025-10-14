import { View, Text, Alert, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import { recipeDetailStyles } from "../../assets/styles/recipe-detail.styles";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { WebView } from "react-native-webview";

const RecipeDetailScreen = () => {
  const { id: recipeId } = useLocalSearchParams();

  const [recipe, setrecipe] = useState(null); // to store recipe
  const [loading, setloading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
 
  // to check if the recipe is already saved
  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${userId}`);
        const favorites = await response.json();

        const isRecipeSaved = favorites.some(
          (fav) => fav.recipeId === parseInt(recipeId)
        );

        setIsSaved(isRecipeSaved);
      } catch (error) {
        console.error("Error checking if recipe is saved: ", error);
      }
    };

    const loadRecipeDetail = async () => {
      setloading(true);
      try {
        const mealData = await MealAPI.getMealById(recipeId);

        console.log(recipeId);
        if (mealData) {
          const transformRecipe = MealAPI.transformMealData(mealData);

          const recipeWithVideo = {
            ...transformRecipe,
            youtubeUrl: mealData.strYoutube || null,
          };

          setrecipe(recipeWithVideo);
        }
      } catch (error) {
        console.error("Error loading recipe details: ", error);
      } finally {
        setloading(false);
      }
    };

    checkIfSaved();
    loadRecipeDetail();
  }, [recipeId, userId]);

  const getYoutubeURL = (url) => {
    //example url: https:www.youtube.com/watch?v=youtubeID
    const videoId = url.split("v=")[1]; // this will give the second part: youtubeID
    return `https://youtube.com/embed/${videoId}`;
  };
  console.log("User Id: ", userId, "\nRecipe Id: ", recipeId);
  // console.log(" Cook Time: ", recipe.cookTime);
  const handleToogleSave = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        // remove from favorites
        const response = await fetch(
          // `${API_URL}/favorites/user_33F6c0HxjjlOZEbWaSGuKYMXDJx/52955`,
          `${API_URL}/favorites/${userId}/${recipeId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove recipe");
        }
        setIsSaved(false);
      } else {
        // add to favorites
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_Id: userId,
            recipe_Id: parseInt(recipeId),
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
          }),
        });

        if (!response.ok) throw new Error("Failed to save recipe");
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling recipe save: ", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return <LoadingSpinner message="Loading the recipe details..." />;
 console.log("Recipe is: ",recipe);
  return (
    <View style={recipeDetailStyles.container}>
      <ScrollView showsVerticalScrollIndicator={true}>
        {/* HEADER */}
        <View style={recipeDetailStyles.headerContainer}>
          <View style={recipeDetailStyles.imageContainer}>
            <Image
              source={{ uri: recipe.image }}
              style={recipeDetailStyles.headerImage}
              contentFit="cover"
            />
          </View>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0, 0.5)", "rgba(0,0,0, 0.8)"]}
            style={recipeDetailStyles.gradientOverlay}
          />
          <View style={recipeDetailStyles.floatingButtons}>
            <TouchableOpacity
              style={recipeDetailStyles.floatingButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                recipeDetailStyles.floatingButton,
                { backgroundColor: isSaving ? COLORS.grey : COLORS.primary },
              ]}
              onPress={handleToogleSave}
              disabled={isSaving}
            >
              <Ionicons
                name={
                  isSaving
                    ? "hourglass"
                    : isSaved
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={recipeDetailStyles.titleSection}>
            <View style={recipeDetailStyles.categoryBadge}>
              <Text style={recipeDetailStyles.categoryText}>
                {recipe.category}
              </Text>
            </View>
            <Text style={recipeDetailStyles.recipeTitle}>{recipe.title}</Text>
            {recipe.area && (
              <View style={recipeDetailStyles.locationRow}>
                <Ionicons name="location" size={16} color={COLORS.white} />
                <Text style={recipeDetailStyles.locationText}>
                  {recipe.area} Cuisine
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* Content section */}
        <View style={recipeDetailStyles.contentSection}>
          {/* //^ QUICK STATS */}
          <View style={recipeDetailStyles.statsContainer}>
            <View style={recipeDetailStyles.statCard}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="time" size={20} color={COLORS.white} />
              </LinearGradient>

              <Text style={recipeDetailStyles.statValue}>
                {recipe.cookTime}
              </Text>

              <Text style={recipeDetailStyles.statLabel}>Prep time</Text>
            </View>

            <View style={recipeDetailStyles.statCard}>
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="people" size={20} color={COLORS.white} />
              </LinearGradient>

              <Text style={recipeDetailStyles.statValue}>
                {recipe.servings}
              </Text>

              <Text style={recipeDetailStyles.statLabel}>Servings</Text>
            </View>
          </View>

          {recipe.youtubeUrl && (
            <View style={recipeDetailStyles.sectionContainer}>
              <View style={recipeDetailStyles.sectionTitleRow}>
                <LinearGradient
                  colors={["#FF0000", "#CC0000"]}
                  style={recipeDetailStyles.sectionIcon}
                >
                  <Ionicons name="play" size={16} color={COLORS.white} />
                </LinearGradient>
                <Text style={recipeDetailStyles.sectionTitle}>
                  Video Tutorial
                </Text>
              </View>
              {/* //^Youtube Video */}
              <View style={recipeDetailStyles.videoCard}>
                <WebView
                  style={recipeDetailStyles.webview}
                  source={{ uri: getYoutubeURL(recipe.youtubeUrl) }}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            </View>
          )}
          {/* INGREDIENTS SECTION */}
          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "80"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="list" size={16} color={COLORS.white} />
              </LinearGradient>

              <Text style={recipeDetailStyles.sectionTitle}>Ingredients</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>
                  {recipe.ingredients.length}
                </Text>
              </View>
            </View>

            <View style={recipeDetailStyles.ingredientsGrid}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={recipeDetailStyles.ingredientCard}>
                  <View style={recipeDetailStyles.ingredientNumber}>
                    <Text style={recipeDetailStyles.ingredientNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={recipeDetailStyles.ingredientText}>
                    {ingredient}
                  </Text>
                  <View style={recipeDetailStyles.ingredientCheck}>
                    <Ionicons
                      name={"checkmark-circle-outline"}
                      size={20}
                      color={COLORS.textLight}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* INSTRUCTIONS SECTION */}
          <View style={recipeDetailStyles.sectionContainer}>
            {/* HEADER TITLE */}
            <View style={recipeDetailStyles.sectionTitleRow}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "80"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="book" size={16} color={COLORS.white} />
              </LinearGradient>

              <Text style={recipeDetailStyles.sectionTitle}>Instructions</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>
                  {recipe.ingredients.length}
                </Text>
              </View>
            </View>

            <View style={recipeDetailStyles.instructionsContainer}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={recipeDetailStyles.instructionCard}>
                  <LinearGradient
                    style={recipeDetailStyles.stepIndicator}
                    colors={[COLORS.primary, COLORS.primary + "CC"]}
                  >
                    <Text style={recipeDetailStyles.stepNumber}>
                      {index + 1}
                    </Text>
                  </LinearGradient>

                  <View style={recipeDetailStyles.instructionContent}>
                    <Text style={recipeDetailStyles.instructionText}>
                      {instruction}
                    </Text>
                    <View style={recipeDetailStyles.instructionFooter}>
                      <Text style={recipeDetailStyles.stepLabel}>
                        Step {index + 1}
                      </Text>
                      <TouchableOpacity
                        style={recipeDetailStyles.completeButton}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={recipeDetailStyles.primaryButton}
            onPress={handleToogleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + "CC"]}
              style={recipeDetailStyles.buttonGradient}
            >
              <Ionicons name="heart" size={20} color={COLORS.white} />
              <Text style={recipeDetailStyles.buttonText}>
                {isSaved ? "Remove from favorites" : "Add to favorites"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;
