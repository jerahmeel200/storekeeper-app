import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DatabaseProvider } from "../contexts/DatabaseContext";
import "./global.css";

function LogoTitle() {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ 
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5
      }}>
        StoreKeeper
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <DatabaseProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            paddingBottom: Platform.select({
              android: insets.bottom > 0 ? insets.bottom : 8,
              ios: 8
            }),
            paddingTop: 8,
            height: Platform.select({
              android: insets.bottom > 0 ? 60 + insets.bottom : 60,
              ios: 60
            }),
          },
          headerStyle: {
            backgroundColor: "#3B82F6",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitle: () => <LogoTitle />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Products",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add-product"
          options={{
            title: "Add Product",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="edit-product"
          options={{
            title: "Edit Product",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pencil-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </DatabaseProvider>
  );
}
