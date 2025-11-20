import { supabase } from './supabase';
import type { Usuario } from '../types';

export const authService = {
  // Registrar nuevo usuario
  register: async (email: string, password: string, nombre: string): Promise<Usuario> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      nombre,
      createdAt: data.user.created_at,
    };
  },

  // Iniciar sesión
  login: async (email: string, password: string): Promise<Usuario> => {
    console.log('authService.login - Iniciando sesión...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('authService.login - Error de Supabase:', error);
      throw new Error(error.message);
    }

    if (!data.user) {
      console.error('authService.login - No se obtuvo usuario en la respuesta');
      throw new Error('No se pudo iniciar sesión');
    }

    console.log('authService.login - Sesión iniciada correctamente:', {
      id: data.user.id,
      email: data.user.email,
    });

    return {
      id: data.user.id,
      email: data.user.email!,
      nombre: data.user.user_metadata?.nombre,
      createdAt: data.user.created_at,
    };
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  // Obtener usuario actual
  getCurrentUser: async (): Promise<Usuario | null> => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      nombre: data.user.user_metadata?.nombre,
      createdAt: data.user.created_at,
    };
  },

  // Listener para cambios en la autenticación
  onAuthStateChange: (callback: (usuario: Usuario | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          nombre: session.user.user_metadata?.nombre,
          createdAt: session.user.created_at,
        });
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },
};
