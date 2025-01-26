import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker"; // Import Picker for role selection
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../Interceptor/interceptor"; // Import your axios instance for API calls
import { signup } from "../../Constants/apiRoutes"; // Make sure the correct API route is used

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tenant"); // Default role is "Tenant"
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !phoneNo || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/signup", {
        name,
        email,
        phone_no: phoneNo,
        password,
        role,
      });

      setIsLoading(false);
      Alert.alert("Success", "Signed up successfully!");
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        Alert.alert("Error", error.response.data.message || "Sign-up failed!");
      } else {
        console.log(error);
        Alert.alert("Error", "Unable to sign up. Please try again later.");
      }
    } finally {
      setName("");
      setEmail("");
      setPhoneNo("");
      setPassword("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />

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
              placeholder="Phone Number"
              value={phoneNo}
              onChangeText={setPhoneNo}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Role</Text>
            <Picker
              selectedValue={role}
              style={styles.picker}
              onValueChange={(itemValue) => setRole(itemValue)}
            >
              <Picker.Item label="Tenant" value="Tenant" />
              <Picker.Item label="Landlord" value="Landlord" />
            </Picker>

            <CustomButton
              title={isLoading ? "Signing Up..." : "Sign Up"}
              handlePress={handleSignUp}
              containerStyles={[
                styles.button,
                isLoading && styles.buttonDisabled,
              ]}
              textStyles={styles.buttonText}
              isLoading={isLoading}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  formContainer: {
    width: 350,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    margin: "auto",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "black",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
  picker: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "yellow",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#d3d3d3", // Grey out the button when loading
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SignUp;
