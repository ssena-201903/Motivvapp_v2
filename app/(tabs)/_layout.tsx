import CalendarIcon from "@/components/icons/CalendarIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import PeopleIcon from "@/components/icons/PeopleIcon";
import { CustomText } from "@/CustomText";
import { Tabs } from "expo-router";

import { useLanguage } from "@/app/LanguageContext";

export default function TabLayout() {
  // language context
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E3A5F",
        tabBarInactiveTintColor: "#ACB3BD",
        tabBarStyle: {
          backgroundColor: "#FCFCFC",
          borderTopWidth: 0.1,
          borderTopColor: "#ACB3BD",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShadowVisible: false,
      }}
    >
      {/* Home Page   */}
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <HomeIcon size={24} color={color} variant="fill"/>
          ),
          tabBarLabel: ({ color, focused }) => (
            <CustomText
              style={{
                color,
                fontSize: 10,
                fontWeight: focused ? "600" : "400",
              }}
            >
              {t("bottomNavbar.home")}
            </CustomText>
          ),
        }}
      />
      {/* Calendar Page   */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <CalendarIcon size={24} color={color} variant="fill"/>
          ),
          tabBarLabel: ({ color, focused }) => (
            <CustomText
              style={{
                color,
                fontSize: 10,
                fontWeight: focused ? "600" : "400",
              }}
            >
              {t("bottomNavbar.calendar")}
            </CustomText>
          ),
        }}
      />
      {/* Friends Page   */}
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <PeopleIcon size={24} color={color} variant="fill"/>
          ),
          tabBarLabel: ({ color, focused }) => (
            <CustomText
              style={{
                color,
                fontSize: 10,
                fontWeight: focused ? "600" : "400",
              }}
            >
              {t("bottomNavbar.friends")}
            </CustomText>
          ),
        }}
      />
    </Tabs>
  );
}
