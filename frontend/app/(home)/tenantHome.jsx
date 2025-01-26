import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../../Interceptor/interceptor";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { router } from "expo-router";

const TenantHome = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // To track the refreshing state

  // Fetch properties function
  const fetchProperties = async () => {
    try {
      const tenantId = await AsyncStorage.getItem("userId"); // Retrieve tenant ID
      if (!tenantId) {
        Alert.alert("Error", "Tenant ID not found.");
        return;
      }

      const response = await axiosInstance.get(
        `/properties/tenant/${tenantId}`
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
    fetchProperties();
  };

  const renderProperty = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/tenantPayments/${item.property_id}`)}
    >
      <View style={styles.propertyCard}>
        <Text style={styles.propertyTitle}>
          Property No: {item.property_no}
        </Text>
        <Text style={styles.propertyAddress}>
          {item.street}, {item.city}, {item.state}, {item.zip_code}
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
      <Text style={styles.header}>Rented Properties</Text>

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

export default TenantHome;

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
  noProperties: {
    fontSize: 18,
    color: "yellow",
    textAlign: "center",
    marginTop: 20,
  },
});
