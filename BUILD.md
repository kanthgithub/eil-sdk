# EIL SDK - Build Instructions

This guide provides step-by-step instructions to build the EIL SDK from scratch.

## Prerequisites

### Required Software

1. **Node.js** - Version 18.17+ or **22.12.0+ (recommended)**
   - Download from [nodejs.org](https://nodejs.org/) or use nvm:
   ```bash
   # Using nvm (recommended)
   nvm install 22.12.0
   nvm use 22.12.0
   
   # Verify installation
   node --version  # Should show v22.12.0 or higher
   ```

2. **Yarn** - Package manager (v1.22+)
   ```bash
   npm install -g yarn
   
   # Verify installation
   yarn --version  # Should show 1.22.22 or higher
   ```

3. **Git** - For cloning the repository
   ```bash
   git --version
   ```

## Step-by-Step Build Instructions

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/eth-infinitism/eil-sdk.git

# Navigate to the project directory
cd eil-sdk
```

### 2. Clean Install Dependencies

```bash
# Remove any existing node_modules and lock files (if doing a fresh build)
rm -rf node_modules yarn.lock package-lock.json

# Install all workspace dependencies
yarn install
```

Expected output:
```
✨  Done in X.XXs.
```

### 3. Build the SDK

```bash
# Build all packages (sdk and accounts)
yarn build
```

This command will:
- Build `@eil-protocol/sdk` package
- Build `@eil-protocol/accounts` package

Expected output:
```
$ yarn build-sdk && yarn build-accounts
$ yarn workspace @eil-protocol/sdk build
$ tsc
$ yarn workspace @eil-protocol/accounts build
$ tsc
✨  Done in X.XXs.
```

### 4. Verify the Build

Check that the build artifacts were created:

```bash
# Check SDK build output
ls -la packages/sdk/dist/

# Check accounts build output
ls -la packages/accounts/dist/
```

You should see:
- `packages/sdk/dist/` - Contains: abitypes, assets, contractTypes, deployments, sdk, utils folders
- `packages/accounts/dist/` - Contains: index.js, index.d.ts, ambire, bcnmy folders

### 5. Test the Build (Optional)

Verify the packages can be imported:

```bash
# Test SDK package
cd packages/sdk
node --eval "import('./dist/sdk/index.js').then(m => console.log('✅ SDK imports successfully! Exports:', Object.keys(m).length, 'items')).catch(e => console.error('❌ Error:', e.message))"

# Test accounts package
cd ../accounts
node --eval "import('./dist/index.js').then(m => console.log('✅ Accounts imports successfully! Exports:', Object.keys(m).join(', '))).catch(e => console.error('❌ Error:', e.message))"

# Return to root
cd ../..
```

Expected output:
```
SDK imports successfully! Exports: 57 items
Accounts package imports successfully! Exports: AmbireMultiChainSmartAccount, MultiChainSmartAccount
```

## Build Scripts Reference

The following npm/yarn scripts are available:

```bash
# Build individual packages
yarn build-sdk       # Build only the SDK package
yarn build-accounts  # Build only the accounts package

# Build all packages
yarn build          # Build both SDK and accounts

# Clean build artifacts
yarn clean          # Remove dist folders from all packages
```

## Package Structure After Build

```
eil-sdk/
├── packages/
│   ├── sdk/
│   │   ├── src/           # TypeScript source files
│   │   ├── dist/          # ✅ Compiled JavaScript (generated)
│   │   │   ├── sdk/
│   │   │   │   └── index.js
│   │   │   ├── abitypes/
│   │   │   ├── contractTypes/
│   │   │   ├── deployments/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── accounts/
│   │   ├── src/           # TypeScript source files
│   │   ├── dist/          # ✅ Compiled JavaScript (generated)
│   │   │   ├── index.js
│   │   │   ├── ambire/
│   │   │   └── bcnmy/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── contracts/         # (empty - linked from another repo)
│
├── package.json
└── tsconfig.base.json
```

## Using the SDK in Other Projects

Once built, you can use the SDK in other projects using one of these methods:

### Option 1: Yarn Link (for local development)

In the **eil-sdk** repo:
```bash
# Link the SDK package
cd packages/sdk
yarn link

# Link the accounts package
cd ../accounts
yarn link
```

In your **other project**:
```bash
yarn link @eil-protocol/sdk
yarn link @eil-protocol/accounts
```

### Option 2: File Path Reference

In your other project's `package.json`:
```json
{
  "dependencies": {
    "@eil-protocol/sdk": "file:../eil-sdk/packages/sdk",
    "@eil-protocol/accounts": "file:../eil-sdk/packages/accounts"
  }
}
```

Then run `yarn install` in your project.

### Option 3: Publish to npm

```bash
# Publish SDK
cd packages/sdk
npm publish

# Publish accounts
cd ../accounts
npm publish
```

Then in your project:
```bash
yarn add @eil-protocol/sdk @eil-protocol/accounts
```

## Troubleshooting

### Issue: TypeScript compilation errors about missing modules

**Solution:** Ensure all dependencies are installed:
```bash
yarn install
```

### Issue: "Cannot find module 'viem'"

**Solution:** The viem dependency should be installed automatically. If not:
```bash
cd packages/sdk
yarn add viem @nomicfoundation/hardhat-viem

cd ../accounts
yarn add viem
```

### Issue: Node.js version compatibility

**Solution:** Use Node.js 22.12.0 or higher:
```bash
nvm install 22.12.0
nvm use 22.12.0
```

### Issue: Build succeeds but imports fail

**Solution:** Make sure you're using a Node.js version that supports ES2022 import attributes (18.17+ or 22+).

## Dependencies

### Root Dependencies
- `typescript`: ^5.9.3
- `@types/node`: ^24.10.1

### SDK Package Dependencies
- `viem`: ^2.41.2
- `@nomicfoundation/hardhat-viem`: ^3.0.1
- `@eil-protocol/contracts`: ^0.1.0 (linked from another repo)

### Accounts Package Dependencies
- `viem`: ^2.41.2
- `permissionless`: ^0.3.2

## Additional Notes

1. **Linked Contracts Package**: The `@eil-protocol/contracts` package is expected to be built and linked from another repository. Make sure it's properly linked before building the SDK.

2. **TypeScript Configuration**: The project uses:
   - Target: ES2022
   - Module: NodeNext
   - Module Resolution: NodeNext
   - Full type declarations are generated

3. **Workspace Setup**: This is a Yarn workspaces monorepo. All packages are managed through the root `package.json`.

4. **ES Modules**: All packages use ES modules (`"type": "module"`). Make sure your consuming projects are configured to handle ES modules.

## Success Criteria

Your build is successful when:

✅ `yarn install` completes without errors  
✅ `yarn build` completes without errors  
✅ `packages/sdk/dist/` and `packages/accounts/dist/` directories exist  
✅ Test imports execute successfully  
✅ No TypeScript compilation errors  

---

**Built with ❤️ by the EIL Protocol Team**
