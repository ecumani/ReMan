import { Text, View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";

const App = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.text}>Reman</Text>
        <View style={styles.buttons}>
          <CustomButton
            title="Sign-in"
            handlePress={() => router.push("sign-in")}
          />
          <CustomButton
            title="Sign-Up"
            handlePress={() => router.push("sign-up")}
          />
        </View>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "yellow",
    textAlign: "center",
    fontSize: 40,
  },
  buttons: {
    paddingTop: 100,
    gap: 40,
  },
});
