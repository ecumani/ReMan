import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axiosInstance from "../../Interceptor/interceptor";
import CustomButton from "../../components/CustomButton";
import { Picker } from "@react-native-picker/picker"; // Import Picker component

const PaymentsPage = () => {
  const { property_id } = useLocalSearchParams();
  const [payments, setPayments] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tenant selection
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState("");

  // Property edit state
  const [isEditingProperty, setIsEditingProperty] = useState(false);

  // New Payment form state
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    month: "",
    rent: "",
    water_tax: "",
    electricity_bill: "",
  });

  // View Payment modal state
  const [isViewingPayment, setIsViewingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch property info, payments, and tenants
  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get(`/payments/${property_id}`);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch payments.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPropertyInfo = async () => {
    try {
      const response = await axiosInstance.get(`/properties/${property_id}`);
      setPropertyInfo(response.data.property || {});
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch property information.");
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await axiosInstance.get("/tenant");
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch tenants.");
    }
  };

  useEffect(() => {
    if (property_id) {
      fetchPayments();
      fetchPropertyInfo();
      fetchTenants();
    }
  }, [property_id]);

  const handleEditProperty = () => {
    if (propertyInfo) {
      setSelectedTenant(propertyInfo.tenant_id || ""); // Set the initial tenant value
      setIsEditingProperty(true);
    }
  };

  const handleUpdatePayment = async () => {
    const { is_paid, date_paid } = selectedPayment;

    try {
      // Validate date format (if date_paid is provided)
      if (date_paid && !/^\d{4}-\d{2}-\d{2}$/.test(date_paid)) {
        Alert.alert("Error", "Date Paid must be in YYYY-MM-DD format.");
        return;
      }

      // If the status is "Pending," set date_paid to null
      const payload = {
        is_paid,
        date_paid: is_paid === "false" ? null : date_paid,
      };

      // Make the API request
      await axiosInstance.put(
        `/payments/${selectedPayment.payment_id}`,
        payload
      );

      Alert.alert("Success", "Payment updated successfully!");
      fetchPayments(); // Refresh the payments list
      setIsViewingPayment(false); // Close the modal
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update payment.");
    }
  };

  const handleSaveProperty = async () => {
    if (!selectedTenant) {
      Alert.alert("Error", "Please select a tenant.");
      return;
    }

    try {
      const payload = { tenant_id: selectedTenant };
      await axiosInstance.put(`/properties/${property_id}`, payload);
      Alert.alert("Success", "Tenant updated successfully!");
      fetchPropertyInfo();
      setIsEditingProperty(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update tenant.");
    }
  };

  const handleAddPayment = async () => {
    const { month, rent, water_tax, electricity_bill } = newPayment;

    if (!month || !rent || !water_tax || !electricity_bill) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    try {
      const payload = {
        property_id,
        month,
        rent,
        water_tax,
        electricity_bill,
      };
      await axiosInstance.post("/payments", payload);
      Alert.alert("Success", "Payment added successfully!");
      fetchPayments(); // Refresh payments list after adding a new payment
      setIsAddingPayment(false); // Close the modal
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add payment.");
    }
  };

  const renderPayment = ({ item }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => {
        setSelectedPayment(item); // Set the selected payment
        setIsViewingPayment(true); // Open the "view payment" modal
      }}
    >
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
    </TouchableOpacity>
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading payments...</Text>
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
            {propertyInfo.city}, {propertyInfo.state}, {propertyInfo.zip_code}
          </Text>
          {propertyInfo.tenant_id && (
            <Text style={styles.propertyText}>
              Tenant: {propertyInfo.tenant_name} - {propertyInfo.tenant_email}
            </Text>
          )}
          <CustomButton
            title="Update Tenant"
            handlePress={handleEditProperty}
            containerStyles={styles.addButton}
          />
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

      {/* Property Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditingProperty}
        onRequestClose={() => setIsEditingProperty(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Update Tenant</Text>
            <Text style={styles.modalHeader}>Assign Tenant</Text>
            <Picker
              selectedValue={selectedTenant}
              onValueChange={(itemValue) => setSelectedTenant(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Tenant" value="" />
              {tenants.map((tenant) => (
                <Picker.Item
                  key={tenant.user_id}
                  label={`${tenant.name} - ${tenant.email}`}
                  value={tenant.user_id}
                />
              ))}
            </Picker>
            <CustomButton
              title="Save"
              handlePress={handleSaveProperty}
              containerStyles={styles.saveButton}
            />
            <CustomButton
              title="Cancel"
              handlePress={() => setIsEditingProperty(false)}
              containerStyles={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddingPayment}
        onRequestClose={() => setIsAddingPayment(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Add Payment</Text>
            <TextInput
              placeholder="Month (YYYY-MM)"
              value={newPayment.month}
              onChangeText={(text) =>
                setNewPayment({ ...newPayment, month: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Rent"
              keyboardType="numeric"
              value={newPayment.rent}
              onChangeText={(text) =>
                setNewPayment({ ...newPayment, rent: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Water Tax"
              keyboardType="numeric"
              value={newPayment.water_tax}
              onChangeText={(text) =>
                setNewPayment({ ...newPayment, water_tax: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Electricity Bill"
              keyboardType="numeric"
              value={newPayment.electricity_bill}
              onChangeText={(text) =>
                setNewPayment({ ...newPayment, electricity_bill: text })
              }
              style={styles.input}
            />
            <CustomButton
              title="Save"
              handlePress={handleAddPayment}
              containerStyles={styles.saveButton}
            />
            <CustomButton
              title="Cancel"
              handlePress={() => setIsAddingPayment(false)}
              containerStyles={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Update Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isViewingPayment}
        onRequestClose={() => setIsViewingPayment(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Update Payment</Text>

            {/* Displaying existing payment details */}
            {selectedPayment && (
              <>
                <Text style={styles.modalText}>
                  Rent: ₹{selectedPayment.rent}, Water Tax: ₹
                  {selectedPayment.water_tax}, Electricity Bill: ₹
                  {selectedPayment.electricity_bill}
                </Text>
                <Text style={styles.modalText}>
                  Payment Month:{" "}
                  {new Date(selectedPayment.payment_month).toLocaleDateString(
                    "en-GB",
                    { year: "numeric", month: "short" }
                  )}
                </Text>

                {/* Editable field for date_paid */}
                <TextInput
                  style={styles.input}
                  placeholder="Date Paid (YYYY-MM-DD)"
                  value={selectedPayment.date_paid}
                  onChangeText={(text) =>
                    setSelectedPayment({ ...selectedPayment, date_paid: text })
                  }
                />

                {/* Picker for Payment Status */}
                <Picker
                  selectedValue={selectedPayment.is_paid}
                  onValueChange={(itemValue) =>
                    setSelectedPayment({
                      ...selectedPayment,
                      is_paid: itemValue,
                    })
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select Payment Status" value="" />
                  <Picker.Item label="Paid" value={"true"} />
                  <Picker.Item label="Pending" value={"false"} />
                </Picker>
              </>
            )}

            {/* Save Changes */}
            <CustomButton
              title="Save"
              handlePress={handleUpdatePayment}
              containerStyles={styles.saveButton}
            />

            {/* Cancel */}
            <CustomButton
              title="Cancel"
              handlePress={() => setIsViewingPayment(false)}
              containerStyles={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Add New Payment Button */}
      <View style={styles.addPaymentButtonContainer}>
        <CustomButton
          title="Add Payment"
          handlePress={() => setIsAddingPayment(true)}
          containerStyles={styles.addPaymentButton}
        />
      </View>
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
  addButton: {
    padding: 12,
    marginVertical: 16,
    borderRadius: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    backgroundColor: "#444",
    padding: 20,
    width: "80%",
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "yellow",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: "yellow",
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    marginBottom: 12,
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  picker: {
    height: 65,
    width: "100%",
    backgroundColor: "#333",
    color: "yellow",
    borderRadius: 5,
  },
  input: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  addPaymentButtonContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  addPaymentButton: {
    backgroundColor: "yellow",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PaymentsPage;
