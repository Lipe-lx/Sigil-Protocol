# Sigil Protocol - Guia de Testes Local ♠️⚡

Este guia contém os comandos necessários para rodar e testar o Sigil Protocol localmente.

## Pré-requisitos
- Node.js >= 20.0.0
- Wallet Phantom (ou compatível) configurada para **Devnet**.

## Diretório do Projeto
`02-SIGIL-USDC-MOLTBOOK/sigil-protocol`

## 1. Frontend (Interface Swiss Minimalist)
Para rodar a interface e interagir com os smart contracts:

```bash
cd 02-SIGIL-USDC-MOLTBOOK/sigil-protocol/frontend
npm install
npm run dev
```
Acesse: `http://localhost:3000`

## 2. O que testar?
1. **Conectar Carteira**: Clique no botão superior direito e conecte via Phantom (Devnet).
2. **Navegar no Marketplace**: Vá em `/skills` para ver as skills registradas na rede.
3. **Mintar Skill**: Use o botão "Mint New Sigil" no final da página para registrar sua própria skill na blockchain.
4. **Executar Sigil**: Clique em "Execute Sigil" em qualquer card para simular uma chamada de agente e assinar a transação.
5. **Logs ao Vivo**: Confira o feed de logs na home (`/`) que atualiza automaticamente conforme novas execuções ocorrem na rede.

## 3. Estrutura de Arquivos Relevantes
- `frontend/app/page.tsx`: Landing e Feed de Logs.
- `frontend/app/skills/page.tsx`: Marketplace real-time.
- `frontend/hooks/useSigil.ts`: Lógica de conexão com Anchor.
- `frontend/lib/idl.json`: Interface do contrato (copiada do build).

---
*Sigil Protocol - Verifiable Intelligence.*
