import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { session, carregando, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  // Página para onde voltar depois do login (quando o usuário tentou
  // abrir uma rota interna direto pela URL).
  const destino = location.state?.from?.pathname || '/';

  if (carregando) {
    return <div className="auth-checking">Verificando acesso...</div>;
  }

  // Já autenticado: não faz sentido mostrar o login.
  if (session) {
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.');
      return;
    }

    setEntrando(true);
    setErro('');
    const resultado = await entrar(email, senha);
    setEntrando(false);

    if (resultado.success) {
      navigate(destino, { replace: true });
    } else {
      setErro(resultado.error);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__brand-mark" aria-hidden="true" />
          <span className="login-card__brand-name">
            Inteligência<span className="login-card__brand-name--muted"> de Ofertas</span>
          </span>
        </div>

        <h1 className="login-card__title">Acesso ao sistema</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErro('');
              }}
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro('');
              }}
              required
            />
          </label>

          {erro && <p className="login-form__error">{erro}</p>}

          <button type="submit" className="btn btn--primary login-form__submit" disabled={entrando}>
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
