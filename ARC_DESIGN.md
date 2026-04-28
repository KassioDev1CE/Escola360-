# Estrutura Sugerida para EduQuest SGE

Esta estrutura foca em escalabilidade e separação de domínios, adaptada para o ambiente React + Express (Server Actions style).

```text
/src
  /assets          # Imagens, vetores e fontes estáticas
  /components
    /ui            # Shadcn/UI (Atomic components)
    /shared        # Componentes compartilhados (Layouts, Modais)
  /features        # Módulos de Domínio (Organização Vertical)
    /academic
      /components  # UI específica (Formulário de Aluno, Lista de Notas)
      /services    # Funções de interação com API do módulo
      /types       # Tipagens TS específicas
    /finance
    /auth
  /hooks           # Hooks genéricos (useDebounce, useAuth)
  /lib             # Clientes (PrismaClient, axios, utils.ts)
  /services        # API de comunicação global
  /store           # Gerenciamento de estado (Zustand)
  App.tsx          # Router e Provedores globais
  main.tsx

/server            # Backend Express
  /actions         # Lógica de Negócio (Server Actions equivalentes)
    /academic      # Chamadas de BD validadas com Zod
    /finance
  /middleware      # Auth, Multi-tenancy (Inject schoolId)
  /routes          # Endpoints da API
  server.ts        # Entry point do servidor
```

## Por que esta estrutura?
1. **Vertical Slicing (Features):** Facilita encontrar tudo relacionado a "Financeiro" em um só lugar.
2. **Server Actions Pattern:** No Express, as `actions` isolam o acesso ao banco. O `server.ts` apenas roteia a requisição para a `action` correta.
3. **Multi-tenancy:** O middleware garante que `req.schoolId` esteja sempre disponível para as actions.
```
