import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../Interceptor/interceptor";
import { signin } from "../../Constants/apiRoutes";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Correct import

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post(signin, {
        email,
        password,
      });

      setIsLoading(false);
      const { user } = response.data;

      // Save the user ID and role in AsyncStorage
      await AsyncStorage.setItem("userId", user.id.toString());
      await AsyncStorage.setItem("userRole", user.role);

      // Navigate based on the role
      if (user.role === "Landlord") {
        router.push("landlordHome");
      } else if (user.role === "Tenant") {
        router.push("tenantHome");
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        Alert.alert("Error", error.response.data.message || "Sign-in failed!");
      } else {
        console.log(error);
        Alert.alert("Error", "Unable to sign in. Please try again later.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <CustomButton
          title={isLoading ? "Signing In..." : "Sign In"}
          handlePress={handleSignIn}
          containerStyles={[styles.button, isLoading && styles.buttonDisabled]}
          textStyles={styles.buttonText}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 16,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "black",
  },
  input: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "yellow",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#d3d3d3",
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SignIn;
