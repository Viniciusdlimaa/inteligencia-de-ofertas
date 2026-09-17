import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege as rotas internas do sistema. Enquanto a sessão está sendo
 * verificada não redireciona nem renderiza o conteúdo — evita mandar
 * para /login um usuário que na verdade já tem sessão salva.
 *
 * O caminho solicitado é guardado em `state.from` para que, após o
 * login, o usuário volte exatamente para onde tentou ir.
 */
export default function ProtectedRoute({ children }) {
  const { session, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <div className="auth-checking">Verificando acesso...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
