import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';

// Modals / Details / Forms screens
import AddWardrobeScreen from '../screens/wardrobe/AddWardrobeScreen';
import WardrobeDetailScreen from '../screens/wardrobe/WardrobeDetailScreen';
import EditWardrobeScreen from '../screens/wardrobe/EditWardrobeScreen';
import OutfitStudioScreen from '../screens/outfits/OutfitStudioScreen';
import OutfitDetailScreen from '../screens/outfits/OutfitDetailScreen';
import ScheduleOutfitScreen from '../screens/planner/ScheduleOutfitScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="AddWardrobe" component={AddWardrobeScreen} />
      <Stack.Screen name="WardrobeDetail" component={WardrobeDetailScreen} />
      <Stack.Screen name="EditWardrobe" component={EditWardrobeScreen} />
      <Stack.Screen name="OutfitStudio" component={OutfitStudioScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      <Stack.Screen name="ScheduleOutfit" component={ScheduleOutfitScreen} />
    </Stack.Navigator>
  );
}
