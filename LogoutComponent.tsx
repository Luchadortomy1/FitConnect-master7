import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

const LogoutComponent = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      console.log('Cerrando sesión automáticamente...');
      try {
        await logout();
        console.log('Sesión cerrada exitosamente');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    performLogout();
  }, [logout]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <ActivityIndicator size="large" color="#0066cc" />
      <Text style={{ marginTop: 20, fontSize: 16 }}>Cerrando sesión...</Text>
    </View>
  );
};

export default LogoutComponent;