import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// ===================================================================
// Autenticação via Supabase Auth.
//
// Reutiliza o MESMO cliente Supabase que já existe no projeto
// (src/lib/supabaseClient.js) — nenhum cliente novo é criado.
//
// A sessão é persistida automaticamente pelo próprio Supabase Auth
// (localStorage), por isso o F5 mantém o usuário logado. Nenhuma
// credencial fica no código: e-mail e senha são validados pelo
// servidor do Supabase.
// ===================================================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // Enquanto `carregando` for true não sabemos ainda se existe sessão
  // salva — é o que evita um "flash" da tela de login em um F5 com
  // usuário já autenticado.
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    // Sessão já existente (ex.: após F5).
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) console.error('Erro ao recuperar sessão:', error);
        if (!ativo) return;
        setSession(data?.session ?? null);
        setCarregando(false);
      })
      .catch((error) => {
        console.error('Erro inesperado ao recuperar sessão:', error);
        if (ativo) setCarregando(false);
      });

    // Mantém o estado sincronizado em login, logout, refresh de token
    // e alterações feitas em outra aba.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      if (!ativo) return;
      setSession(novaSessao);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Retorna { success: true } ou { success: false, error } para que a
  // tela de login mostre a mensagem sem precisar conhecer o Supabase.
  const entrar = async (email, senha) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        console.error('Falha no login:', error);
        // Mensagem genérica de propósito: não revela se o e-mail
        // existe ou se apenas a senha está errada.
        return { success: false, error: 'E-mail ou senha inválidos.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      return { success: false, error: 'Não foi possível entrar agora. Tente novamente.' };
    }
  };

  const sair = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Erro ao sair:', error);
    } catch (error) {
      console.error('Erro inesperado ao sair:', error);
    }
  };

  const value = useMemo(
    () => ({ session, usuario: session?.user ?? null, carregando, entrar, sair }),
    [session, carregando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
