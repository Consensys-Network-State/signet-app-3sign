Official requirements (but worked with node 20.17.0 and pnpm 10.0.0 for me):
- pnpm v9.14.3
- node v22.11.0

To install pnpm (from https://pnpm.io/installation):
`curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=10.0.0 sh -`

Start by checking out the design system repo:

```
git clone https://github.com/ConsenSysMesh/ds3
pnpm i
cd apps
git submodule add -f https://github.com/ConsenSysMesh/apoc.git apoc
cd ..
pnpm i
pnpm build:deps
pnpm apoc:dev
```

Should be up and running at http://localhost:5173