# Lavandaria das Corujas

Sistema de reservas de lavandaria compartilhada para a Vila das Corujas. Permite que moradores reservem horários para uso da máquina de lavar e secadora do condomínio.

## Sobre o Projeto

Este sistema foi desenvolvido para gerenciar o uso compartilhado de equipamentos de lavandaria em um condomínio residencial. Os moradores podem visualizar disponibilidade, fazer reservas e receber confirmações por email, garantindo organização e evitando conflitos de horários.

### Funcionalidades Principais

- 🔐 **Autenticação segura** via Supabase Auth
- 📅 **Calendário interativo** para seleção de datas
- ⏰ **Reservas por horário** (blocos de 1 hora)
- 📧 **Confirmação por email** para todas as reservas
- ✅ **Gestão de reservas** (criação e cancelamento)
- ♿ **Acessibilidade** (ARIA, navegação por teclado, leitores de tela)
- 🌓 **Modo escuro/claro** com persistência
- 📱 **Design responsivo** para mobile e desktop

## Tecnologias Utilizadas

### Core
- **[Next.js 15.5.4](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca de interface
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática

### Backend & Banco de Dados
- **[Supabase](https://supabase.com/)** - PostgreSQL + autenticação + real-time
- **[Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)** - Autenticação server-side

### Gerenciamento de Estado
- **[TanStack Query](https://tanstack.com/query/latest)** - Cache e sincronização de dados
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas

### UI/UX
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Estilização
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Lucide React](https://lucide.dev/)** - Ícones
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificações toast
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Tema escuro/claro

### Email
- **[Resend](https://resend.com/)** - Serviço de envio de emails
- **[React Email](https://react.email/)** - Templates de email em React

### Testes
- **[Vitest](https://vitest.dev/)** - Framework de testes
- **[React Testing Library](https://testing-library.com/react)** - Testes de componentes
- **[@testing-library/user-event](https://testing-library.com/docs/user-event/intro)** - Simulação de interações

### Utilitários
- **[date-fns](https://date-fns.org/)** - Manipulação de datas
- **[date-fns-tz](https://github.com/marnusw/date-fns-tz)** - Suporte a fusos horários

## Requisitos

- **Node.js** 20 ou superior
- **npm** ou **yarn** ou **pnpm** ou **bun**
- Conta no **Supabase** (para banco de dados e autenticação)
- Conta no **Resend** (para envio de emails)

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd lava-seca-corujas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Resend (Email)
RESEND_FROM="Nome do Remetente <noreply@seudominio.com.br>"
RESEND_API_KEY=sua_chave_resend
```

#### Como obter as credenciais:

**Supabase:**
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em Settings → API
3. Copie a URL e as keys necessárias

**Resend:**
1. Crie uma conta em [resend.com](https://resend.com)
2. Obtenha sua API key no dashboard
3. Configure um domínio verificado para envio de emails

### 4. Configure o banco de dados

No Supabase, execute os seguintes comandos SQL no Editor de SQL para criar as tabelas e habilitar a Segurança a Nível de Linha (RLS - Row Level Security):

**Tabela `apartments`:**
```sql
CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
```

**Tabela `users_app`:**
```sql
CREATE TABLE users_app (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    apartment_id UUID REFERENCES apartments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users_app ENABLE ROW LEVEL SECURITY;
```

**Tabela `machines`:**
```sql
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('washer', 'dryer')),
    label TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
```

**Tabela `reservations`:**
```sql
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users_app(id),
    apartment_id UUID NOT NULL REFERENCES apartments(id),
    equipment TEXT NOT NULL CHECK (equipment IN ('washer', 'dryer')),
    machine_id UUID NOT NULL REFERENCES machines(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(equipment, start_time, machine_id)
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
```

**View `v_users_with_apartment`:**
```sql
CREATE OR REPLACE VIEW v_users_with_apartment 
WITH (security_invoker = true) AS
SELECT 
    u.id, 
    u.email, 
    u.name, 
    u.apartment_id, 
    a.number AS apartment_number, 
    u.is_admin
FROM users_app u
LEFT JOIN apartments a ON u.apartment_id = a.id;
```


### 5. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (porta 3000)

# Build
npm run build            # Cria build de produção
npm start               # Inicia servidor de produção

# Qualidade de código
npm run lint            # Executa ESLint

# Testes
npm test                # Executa testes com Vitest
npm run test:watch      # Executa testes em modo watch
npm run test:coverage   # Gera relatório de cobertura
```

## Estrutura do Projeto

```
src/
├── app/                          # App Router (Next.js 15)
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação (login/logout)
│   │   ├── reservations/         # CRUD de reservas
│   │   └── user/                 # Informações do usuário
│   ├── login/                    # Página de login
│   ├── reservar/                 # Páginas de reserva
│   │   └── [machine]/            # Reserva por equipamento
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Página inicial (redireciona para login)
│   └── providers.tsx             # Provider do React Query
├── components/                   # Componentes React
│   ├── ui/                       # Componentes de UI (Radix + Tailwind)
│   ├── ConfirmDialog/            # Dialog de confirmação de reserva
│   ├── CookieConsentDialog/      # Dialog de consentimento de cookies
│   ├── Header/                   # Cabeçalho da aplicação
│   ├── LoginForm/                # Formulário de login
│   ├── Show/                     # Componente de renderização condicional
│   ├── ThemeSwitch/              # Alternador de tema
│   └── UsageMode/                # Modo de uso dos equipamentos
├── contexts/                     # Contexts do React
│   ├── GlobalLiveRegion.tsx      # Context para anúncios de acessibilidade
│   ├── ThemeContext.tsx          # Context do tema (escuro/claro)
│   └── UserContext.tsx           # Context de dados do usuário
├── emails/                       # Templates de email (React Email)
│   └── ReservationConfirmed.tsx  # Email de confirmação de reserva
├── lib/                          # Utilitários e funções auxiliares
│   ├── email/                    # Funções de envio de email
│   ├── reservations/             # Lógica de negócio de reservas
│   ├── user/                     # Funções relacionadas a usuários
│   ├── supabaseClient.ts         # Cliente Supabase (browser)
│   ├── supabaseServer.ts         # Cliente Supabase (server)
│   ├── resend.ts                 # Cliente Resend
│   └── utils.ts                  # Funções utilitárias
├── types/                        # Tipos TypeScript e schemas Zod
│   └── index.ts                  # Definições de tipos e validações
└── middleware.ts                 # Middleware de autenticação

```

## Fluxo de Autenticação

1. Usuário acessa qualquer rota protegida
2. Middleware verifica sessão no Supabase
3. Se não autenticado → redireciona para `/login`
4. Após login bem-sucedido → acesso liberado
5. `UserContext` carrega dados do usuário logado

## Fuso Horário

O sistema opera no fuso horário **America/Sao_Paulo** (GMT-3):
- Servidor de desenvolvimento roda com `TZ=America/Sao_Paulo`
- Conversões de timezone usando `date-fns-tz`
- Datas armazenadas em UTC no banco de dados
- Interface exibe horários locais (São Paulo)

## Acessibilidade

Este projeto foi desenvolvido com foco em acessibilidade:

- ✅ Navegação completa por teclado
- ✅ ARIA labels e roles apropriados
- ✅ Live regions para anúncios dinâmicos
- ✅ Skip to content link
- ✅ Alto contraste e fontes legíveis
- ✅ Componentes semânticos
- ✅ Suporte a leitores de tela

## Testes

O projeto utiliza Vitest + React Testing Library:

```bash
# Executar todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

Exemplos de testes incluídos:
- Testes de componentes (ConfirmDialog, LoginForm, etc.)
- Testes de utilitários (formatação, validação)
- Testes de schemas Zod
- Testes de integração com mocks

## Deploy

### Vercel (Recomendado)

1. Faça push do código para um repositório Git
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js 15:
- Netlify
- Railway
- Render
- AWS Amplify

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Licença

Este projeto é privado e destinado ao uso exclusivo da Vila das Corujas.

## Suporte

Para questões ou suporte, entre em contato com o administrador do sistema.

---

Desenvolvido com ❤️ para a comunidade Vila das Corujas
