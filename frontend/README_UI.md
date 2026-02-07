# Sigil Protocol - Frontend Architecture ♠️⚡

## Estética: Swiss Minimalist & High-Performance
O frontend do Sigil Protocol foi reconstruído para refletir a precisão e o minimalismo da tipografia suíça (Akzidenz-Grotesk vibes, utilizando Inter e Instrument Serif), focado em grids perfeitos, contrastes absolutos (Pure Black/Pure White) e micro-interações fluidas.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Pure CSS tokens)
- **UI Components**: Shadcn-inspired custom Swiss components.
- **Web3**: Solana Wallet Adapter + Anchor SDK.
- **Icons**: Lucide React.
- **Typography**: Inter (Sans) + Instrument Serif (Display/Italic).

## Estrutura de Páginas
1. **Landing (`/`)**: Hero display com foco no valor de "Verifiable Intelligence".
2. **Marketplace (`/skills`)**: Grid de skills auditadas com filtros e busca.
3. **Auditors (`/auditors`)**: Lista de entidades verificadoras da rede.
4. **Skills Detail (WIP)**: Painel de execução com integração direta de carteira.

## Design Patterns
- **Grid Layout**: Bordas de 1px zinc-900 definindo a estrutura.
- **Typography-First**: Hierarquia visual clara sem distrações de cores vibrantes desnecessárias.
- **Glassmorphism**: Backdrop blur sutil para profundidade em navegação e modais.
- **Atomic Scaling**: Efeitos de scale síncronos ao clique para feedback tátil.

## Como Rodar
```bash
cd 02-SIGIL-USDC-MOLTBOOK/sigil-protocol/frontend
npm run dev
```

---
*Atualizado em 05 de Fev, 2026 por Ace.*
