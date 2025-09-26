import { useSignUp } from "@clerk/clerk-expo";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { authStyles } from "../../assets/styles/auth.styles";
import { useState } from "react";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import { goBack } from "expo-router/build/global-state/routing";

const VerifyEmail = ({ email, onBack }) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!code) {
      Alert.alert("Error!", "Please enter the code!");
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        Alert.alert("Error!", "Verification failed. Please try again.");
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      Alert.alert("Error!", "Verification failed. Please try again.");
      console.error(JSON.stringify(signUpAttempt, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        enabled
        style={authStyles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 64}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            {/* Image and Text */}
            <Image
              source={require("../../assets/images/i3.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>
          <Text style={authStyles.title}>Verify Your Email</Text>
          <Text style={authStyles.subtitle}>
            We&apos;ve sent a verification code to {email}
          </Text>

          {/* //^ FORM CONTAINER */}
          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter verification code..."
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                autoCapitalize="none"
                value={code}
                onChangeText={setCode}
              />
            </View>
            {/* //^ Verify Button */}
            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleVerification}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Verifying email..." : "Verify Email"}
              </Text>
            </TouchableOpacity>

            {/* //^ Back to Sign Up */}
            <TouchableOpacity style={authStyles.linkContainer} onPress={goBack}>
              <Text style={authStyles.linkText}>Back to Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmail;
