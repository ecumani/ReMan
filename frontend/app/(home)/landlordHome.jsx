import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../../Interceptor/interceptor";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import CustomButton from "../../components/CustomButton"; // Import the custom button
import { router } from "expo-router";

const LandlordHome = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false); // To toggle the form visibility
  const [newProperty, setNewProperty] = useState({
    property_no: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // To track form submission status
  const [refreshing, setRefreshing] = useState(false); // To track the refreshing state

  // Fetch properties function
  const fetchProperties = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); // Retrieve user ID (should be used for landlord)
      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        return;
      }

      const response = await axiosInstance.get(
        `/properties/landlord/${userId}` // Use userId instead of landlordId
      );
      setProperties(response.data.properties || []); // Safely handle empty response
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch properties.");
    } finally {
      setIsLoading(false);
      setRefreshing(false); // End the refreshing state
    }
  };

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Function to handle refreshing
  const handleRefresh = () => {
    setRefreshing(true);
    // Re-fetch properties
    fetchProperties();
  };

  const handleAddProperty = async () => {
    if (
      !newProperty.property_no ||
      !newProperty.street ||
      !newProperty.city ||
      !newProperty.state ||
      !newProperty.zip_code
    ) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        return;
      }

      // Make API request to add property
      const response = await axiosInstance.post("/properties", {
        ...newProperty,
        landlord_id: userId,
      });

      Alert.alert("Success", "Property added successfully!");
      setNewProperty({
        property_no: "",
        street: "",
        city: "",
        state: "",
        zip_code: "",
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add property.");
    } finally {
      setIsSubmitting(false);
      setIsAdding(false); // Close the modal after submission
    }
  };

  const renderProperty = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/landlordPayments/${item.property_id}`)}
    >
      <View style={styles.propertyCard}>
        <Text style={styles.propertyTitle}>
          Property No: {item.property_no}
        </Text>
        <Text style={styles.propertyAddress}>
          {item.street}, {item.city}, {item.state}, {item.zip_code}
        </Text>
        <Text style={styles.propertyTenant}>
          {item.tenant_id ? "Occupied" : "Not Occupied"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="yellow" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Properties Owned</Text>

      <CustomButton
        title="Add Property"
        handlePress={() => setIsAdding(true)} // Open the modal when clicked
        isLoading={isSubmitting}
        containerStyles={styles.addProp}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAdding}
        onRequestClose={() => setIsAdding(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Add New Property</Text>
            <TextInput
              style={styles.input}
              placeholder="Property No"
              value={newProperty.property_no}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, property_no: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Street"
              value={newProperty.street}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, street: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={newProperty.city}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, city: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={newProperty.state}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, state: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Zip Code"
              value={newProperty.zip_code}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, zip_code: text })
              }
            />

            <CustomButton
              title={isSubmitting ? "Submitting..." : "Submit"}
              handlePress={handleAddProperty}
              isLoading={isSubmitting}
            />

            <CustomButton
              title="Cancel"
              handlePress={() => setIsAdding(false)} // Close the modal
              isLoading={false}
              containerStyles={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {properties.length > 0 ? (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.property_id.toString()} // Use property_id as the key
          renderItem={renderProperty}
          contentContainerStyle={styles.list}
          refreshing={refreshing} // Bind the refreshing state
          onRefresh={handleRefresh} // Call handleRefresh when user pulls down
        />
      ) : (
        <Text style={styles.noProperties}>No properties found.</Text>
      )}
    </SafeAreaView>
  );
};

export default LandlordHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 16,
    justifyContent: "flex-start", // Ensure content is at the top
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "yellow",
    textAlign: "center",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
    flexGrow: 1, // Make the list fill up remaining space
  },
  propertyCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 16,
    color: "gray",
    marginBottom: 4,
  },
  propertyTenant: {
    fontSize: 16,
    color: "black",
    fontStyle: "italic",
  },
  noProperties: {
    fontSize: 18,
    color: "yellow",
    textAlign: "center",
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background covering the whole screen
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%", // Prevent the modal from being too large
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    width: "100%", // Ensure inputs take full width
  },
  cancelButton: {
    backgroundColor: "#d3d3d3",
    marginTop: 10,
  },
  addProp: {
    marginBottom: 30,
    marginTop: 10,
  },
});
