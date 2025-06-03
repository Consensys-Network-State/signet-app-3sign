# Signet 3Sign

Signet 3Sign is a modern document signing platform that leverages blockchain technology for secure and verifiable document management. Built with React and Vite, it provides a seamless web experience for document management and signing.

## Features

- **Document Management**
  - Create and manage agreements
  - Draft system for documents in progress
  - Published agreements ready for signing
  - Status tracking (draft vs signed)

- **Web3 Integration**
  - Wallet-based authentication
  - Blockchain-verified signatures
  - Address-based user identification

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Wagmi for Web3 integration
- @consensys/ds3 components

## Prerequisites

- Node.js
- pnpm
- Backend service running (see Backend section)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## Backend

This application requires the Signet Execution Prototype backend to be running. You can find it here:
https://github.com/Consensys-Network-State/signet-execution-prototype

To start the backend:
```bash
git clone https://github.com/Consensys-Network-State/signet-execution-prototype.git
cd signet-execution-prototype
pnpm install
pnpm start
```

## Development

The project uses Vite for development. Key features of the development setup:

- Hot Module Replacement (HMR)
- TypeScript support
- ESLint configuration
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Apache-2.0 license
