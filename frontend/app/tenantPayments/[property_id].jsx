import React, { useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import axiosInstance from "../../Interceptor/interceptor";
const PropertyPaymentsPage = () => {
  const { property_id } = useLocalSearchParams();
  const [payments, setPayments] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch property info
  const fetchPropertyInfo = async () => {
    try {
      const response = await axiosInstance.get(`/properties/${property_id}`);
      setPropertyInfo(response.data.property || {});
    } catch (error) {
      console.error(error);
      alert("Error fetching property information.");
    }
  };

  // Fetch payments for the property
  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get(`/payments/${property_id}`);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error(error);
      alert("Error fetching payments.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (property_id) {
      fetchPropertyInfo();
      fetchPayments();
    }
  }, [property_id]);

  // Refresh payments
  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  // Render payment card
  const renderPayment = ({ item }) => (
    <View style={styles.paymentCard}>
      <Text style={styles.paymentText}>
        Rent: ₹{item.rent}, Water Tax: ₹{item.water_tax}, Electricity Bill: ₹
        {item.electricity_bill}
      </Text>
      <Text style={styles.paymentText}>
        Month: {new Date(item.payment_month).toLocaleDateString()}
      </Text>
      <Text style={styles.paymentText}>
        Date Paid:{" "}
        {item.date_paid ? new Date(item.date_paid).toLocaleDateString() : "N/A"}
      </Text>
      <Text style={styles.paymentText}>
        Status: {item.is_paid ? "Paid" : "Pending"}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading property details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {propertyInfo && (
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyHeader}>Property Information</Text>
          <Text style={styles.propertyText}>
            {propertyInfo.property_no} - {propertyInfo.street},{" "}
            {propertyInfo.city}, {propertyInfo.state} {propertyInfo.zip_code}
          </Text>
          <Text style={styles.propertyText}>
            Landlord: {propertyInfo.landlord_name} (
            {propertyInfo.landlord_email})
          </Text>
        </View>
      )}

      <FlatList
        data={payments}
        keyExtractor={(item) => item.payment_id.toString()}
        renderItem={renderPayment}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 16,
  },
  propertyInfo: {
    marginBottom: 16,
  },
  propertyHeader: {
    fontSize: 24,
    color: "yellow",
    fontWeight: "bold",
  },
  propertyText: {
    fontSize: 16,
    color: "yellow",
  },
  list: {
    flexGrow: 1,
  },
  paymentCard: {
    backgroundColor: "#333",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 14,
    color: "yellow",
  },
  loadingText: {
    fontSize: 16,
    color: "yellow",
    textAlign: "center",
    marginTop: 20,
  },
});

export default PropertyPaymentsPage;
