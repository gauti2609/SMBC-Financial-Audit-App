# Key Files Quick Reference - Financials Automation

## 📋 Documentation Files

| File | Size | Purpose |
|------|------|---------|
| `README.md` | 6.6 KB | Main project overview, features, installation, usage |
| `BUILD_FIXES_SUMMARY.md` | 7.6 KB | Critical build fixes, step-by-step build process |
| `EXE Instructions.md` | 22.4 KB | Detailed Windows .exe build guide for non-developers |
| `WINDOWS_DEPLOYMENT_CHECKLIST.md` | 7.6 KB | Complete deployment checklist with phases |
| `WINDOWS_DEPLOYMENT_TEST_REPORT.md` | 9.2 KB | Testing results and validation report |
| `LICENSE` | 1.7 KB | MIT License terms |

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, build configuration |
| `pnpm-lock.yaml` | Locked dependency versions |
| `tsconfig.json` | TypeScript compiler configuration |
| `electron-builder.config.js` | Electron build and installer configuration |
| `vinxi.config.ts` | Vinxi build system configuration |
| `vite-console-forward-plugin.ts` | Custom Vite plugin for console forwarding |
| `app.config.ts` | Application-specific configuration |
| `tsr.config.json` | TanStack Router configuration |
| `tailwind.config.mjs` | Tailwind CSS configuration |
| `postcss.config.mjs` | PostCSS configuration |
| `eslint.config.mjs` | ESLint linting rules |
| `prettier.config.mjs` | Code formatting rules |
| `.env` | Environment variables (local) |
| `config.env.template` | Environment variables template |
| `.gitignore` | Git ignore patterns |
| `.npmrc` | npm configuration |

## 🗄️ Database & Schema

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Complete database schema (18+ models) |
| `prisma/client.ts` | Prisma client wrapper |
| `docs/PRISMA_SETUP.md` | Database setup instructions |

## 🖥️ Electron Desktop App

| File | Purpose |
|------|---------|
| `electron/main.ts` | Main process (needs compilation) |
| `electron/preload.ts` | Preload scripts for renderer security |
| `electron/main.js` | Compiled main process (generated) |
| `electron/preload.js` | Compiled preload (generated) |
| `electron/assets/icon.png` | Main application icon (256x256) |
| `electron/assets/icon.ico` | Windows icon (placeholder) |
| `electron/assets/excel-icon.ico` | Excel file association (placeholder) |
| `electron/assets/csv-icon.ico` | CSV file association (placeholder) |
| `electron/assets/loading.gif` | Installer loading graphic (placeholder) |

## 🌐 Frontend Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `src/main.tsx` | React application entry |
| `src/router.tsx` | Router configuration |
| `src/styles.css` | Global styles |

## 🎯 State Management (Zustand)

| File | Purpose |
|------|---------|
| `src/stores/authStore.ts` | Authentication state (login, user, token) |
| `src/stores/companyStore.ts` | Active company state |
| `src/stores/databaseStore.ts` | Database connection state |

## 🔌 API Client (tRPC)

| File | Purpose |
|------|---------|
| `src/trpc/query-client.ts` | TanStack Query configuration |
| `src/trpc/react.tsx` | tRPC React hooks setup |

## 🗂️ Routes Directory

The `src/routes/` directory contains all application pages following TanStack Router file-based routing conventions. Key pages include:
- Dashboard
- Company management
- Trial balance
- Financial statements
- Schedules (PPE, investments, etc.)
- Settings and configuration

## ⚙️ Server Core Files

| File | Purpose |
|------|---------|
| `src/server/db.ts` | Prisma database connection |
| `src/server/env.ts` | Environment variable validation |
| `src/server/minio.ts` | MinIO file storage setup |

## 🔌 tRPC Backend

| File | Purpose |
|------|---------|
| `src/server/trpc/main.ts` | tRPC router setup and configuration |
| `src/server/trpc/handler.ts` | Request handler |
| `src/server/trpc/root.ts` | Main API router with all procedures (34 KB) |

## 📊 Critical API Procedures (Top 10 by Importance)

| File | Size | Purpose |
|------|------|---------|
| `validateScheduleIIICompliance.ts` | 53 KB | **Most Critical** - Complete Schedule III compliance validation engine |
| `exportFinancialStatements.ts` | 37 KB | Generate complete financial statements with Excel export |
| `generateCashFlow.ts` | 11 KB | Cash flow statement generation (indirect method) |
| `initializeAccountingPolicies.ts` | 11 KB | Initialize default accounting policies |
| `companyManagement.ts` | 8.3 KB | Company CRUD operations |
| `debugCompliance.ts` | 8.3 KB | Compliance debugging and diagnostics |
| `uploadDebtorsCreditorsList.ts` | 7.7 KB | Import aging schedules |
| `uploadTrialBalanceFromFile.ts` | 4.8 KB | Import trial balance from Excel/CSV |
| `generateRatioAnalysis.ts` | 4.4 KB | Financial ratio calculations |
| `license.ts` | 3.8 KB | License validation and management |

## 📁 All API Procedures (40+ Endpoints)

### Authentication & Users
- `auth.ts` - Login, logout, registration, JWT validation

### Company Management
- `companyManagement.ts` - Company CRUD operations
- `databaseConnection.ts` - Database connectivity testing

### Master Data
- `getMinorHeads.ts` - Retrieve minor head classifications

### Trial Balance
- `uploadTrialBalanceFromFile.ts` - Import from Excel/CSV
- `updateTrialBalanceEntry.ts` - Edit entries
- `deleteTrialBalanceEntry.ts` - Remove entries

### Schedules - Upload Procedures (8 files)
- `uploadPPEFile.ts` - Property, Plant & Equipment
- `uploadShareCapitalFile.ts` - Share capital details
- `uploadInvestmentFile.ts` - Investment schedules
- `uploadEmployeeBenefitsFile.ts` - Employee benefit obligations
- `uploadRelatedPartiesFile.ts` - Related party transactions
- `uploadDebtorsCreditorsList.ts` - Aging schedules
- `uploadContingentLiabilitiesFile.ts` - Contingent liabilities

### Schedules - Retrieval Procedures (9 files)
- `getPPEScheduleEntries.ts`
- `getCWIPScheduleEntries.ts`
- `getIntangibleScheduleEntries.ts`
- `getShareCapitalEntries.ts`
- `getInvestmentEntries.ts`
- `getEmployeeBenefitEntries.ts`
- `getReceivableLedgerEntries.ts`
- `getPayableLedgerEntries.ts`
- `getContingentLiabilities.ts`

### Financial Statements
- `exportFinancialStatements.ts` - Complete statement generation
- `generateCashFlow.ts` - Cash flow statement
- `generateRatioAnalysis.ts` - Financial ratios

### Compliance
- `validateScheduleIIICompliance.ts` - Schedule III validation
- `debugCompliance.ts` - Debugging tools

### Accounting Policies & Notes
- `initializeAccountingPolicies.ts` - Initialize defaults
- `getAccountingPolicies.ts` - Retrieve policies
- `updateAccountingPolicy.ts` - Modify policies
- `updateNoteNumbers.ts` - Manage note numbering
- `updateNoteSelection.ts` - Select/deselect notes
- `deleteNoteSelection.ts` - Remove notes

### Deferred Tax
- `getDeferredTaxEntries.ts` - Retrieve entries
- `updateDeferredTaxEntry.ts` - Update entries
- `deleteDeferredTaxEntry.ts` - Remove entries

### Related Party Transactions
- `getRelatedPartyTransactions.ts` - Retrieve transactions
- `getCommonControl.ts` - Common control information

### Tax
- `getTaxEntries.ts` - Retrieve tax entries

### License
- `license.ts` - License validation and management

## 🧪 Testing & Diagnostics

| File | Purpose |
|------|---------|
| `diagnostic-test.mjs` | System requirements verification |
| `test-runner.mjs` | Comprehensive feature testing |
| `run-deployment-test.mjs` | Deployment validation |
| `quick-diagnostic.mjs` | Quick system check |
| `deployment-script.mjs` | Automated deployment script |
| `run-tests.sh` | Shell script for running tests |
| `src/server/scripts/testAllFeatures.ts` | Feature test suite |
| `src/server/scripts/testCompliance.ts` | Compliance testing |
| `src/server/scripts/setup.ts` | Initial setup script |

## 🐳 Docker Deployment

| File | Purpose |
|------|---------|
| `docker/Dockerfile` | Container image definition |
| `docker/compose.yaml` | Docker Compose multi-service setup |
| `docker/nginx/conf.d/default.conf` | Nginx reverse proxy configuration |

## 🤖 AI/Codapt Documentation (.codapt/docs/)

### AI SDK (7 files)
- `ai-sdk-overview.md` - AI SDK introduction
- `ai-sdk-model-setup.md` - Model configuration
- `ai-sdk-generating-text.md` - Text generation
- `ai-sdk-generating-image.md` - Image generation
- `ai-sdk-generating-output.md` - Structured output
- `ai-sdk-streaming-text.md` - Streaming responses
- `ai-sdk-tool-calling.md` - Function calling
- `ai-sdk-using-image-data.md` - Image input handling

### React & Routing (3 files)
- `react/rules-of-hooks.md` - React hooks best practices
- `building-forms-with-react-hook-form.md` - Form handling
- `tanstack-router/pages.md` - Route definitions
- `tanstack-router/search-parameters.md` - URL search params

### tRPC (4 files)
- `trpc/implementing-trpc-procedures.md` - Creating procedures
- `trpc/trpc-client-side-usage.mdx` - Client integration
- `trpc/trpc-streaming-responses.md` - Streaming data
- `trpc/trpc-subscriptions.md` - Real-time subscriptions
- `trpc/handling-file-uploads.md` - File upload handling

### Database & Storage (2 files)
- `prisma-database.md` - Prisma ORM usage
- `minio-object-storage.md` - MinIO file storage

### Authentication & Security (2 files)
- `bcryptjs-password-hashing.md` - Password security
- `json-web-token-authentication-tokens.md` - JWT authentication

### State Management (2 files)
- `zustand/zustand-overview.md` - Zustand basics
- `zustand/zustand-persistance.md` - State persistence

### Utilities (5 files)
- `environment-variables.md` - Environment configuration
- `rendering-markdown.md` - Markdown rendering
- `resolving-json-parse-errors.md` - JSON error handling
- `date-and-datetime-form-input-types.md` - Date inputs
- `web-scraping-using-playwright.md` - Web scraping
- `react-hot-toast-alerts.md` - Toast notifications
- `global.md` - Global documentation

### Codapt Scripts (5 files)
- `.codapt/scripts/check-code` - Code validation
- `.codapt/scripts/check-running` - Service status check
- `.codapt/scripts/run` - Application runner
- `.codapt/scripts/setup` - Environment setup
- `.codapt/scripts/stop` - Stop services

## 🔑 Key Commands

### Development
```bash
pnpm install              # Install dependencies
pnpm run dev              # Start dev server
pnpm run typecheck        # TypeScript validation
pnpm run lint             # Code linting
pnpm run format           # Code formatting
pnpm run test-features    # Run feature tests
```

### Database
```bash
pnpm run db:generate      # Generate Prisma client
pnpm run db:migrate       # Run migrations
pnpm run db:push          # Push schema changes
pnpm run db:studio        # Open Prisma Studio GUI
```

### Building
```bash
pnpm run build            # Build web application
pnpm run build:electron   # Compile Electron TypeScript
pnpm run electron:pack    # Package Electron (no installer)
```

### Desktop App Distribution
```bash
pnpm run dist             # Build for all platforms
pnpm run dist:win         # Build Windows installer
pnpm run dist:mac         # Build macOS DMG
pnpm run dist:linux       # Build Linux packages
```

### Electron Development
```bash
pnpm run electron         # Run Electron directly
pnpm run electron:dev     # Dev server + Electron
```

## 📊 File Size Distribution

### Large Files (>10 KB)
- `validateScheduleIIICompliance.ts` - 53 KB
- `exportFinancialStatements.ts` - 37 KB
- `root.ts` - 34 KB
- `EXE Instructions.md` - 22 KB
- `generateCashFlow.ts` - 11 KB
- `initializeAccountingPolicies.ts` - 11 KB

### Medium Files (3-10 KB)
- Most procedure files
- Documentation files
- Component files
- Configuration files

### Small Files (<3 KB)
- Simple procedures
- Utility functions
- Type definitions
- Simple components

## 🎯 Most Important Files for Understanding the App

1. **README.md** - Start here for overview
2. **package.json** - Understand dependencies and scripts
3. **prisma/schema.prisma** - Database structure
4. **src/server/trpc/root.ts** - All API endpoints
5. **validateScheduleIIICompliance.ts** - Core compliance logic
6. **exportFinancialStatements.ts** - Statement generation
7. **electron-builder.config.js** - Desktop app configuration
8. **BUILD_FIXES_SUMMARY.md** - Critical build information

## 🔄 File Generation During Build

These files are **generated** during build and should not be manually edited:

- `electron/main.js` - Compiled from main.ts
- `electron/preload.js` - Compiled from preload.ts
- `src/generated/` - Prisma client
- `dist/` - Build output
- `dist-electron/` - Electron installers
- `.vinxi/` - Vinxi build cache
- `node_modules/` - Dependencies

## 📝 Notes

- **Configuration files** use various formats: .js, .mjs, .ts, .json
- **Documentation** is in Markdown (.md, .mdx)
- **Source code** is in TypeScript (.ts, .tsx)
- **Scripts** use .mjs for ES modules
- **Assets** include .png, .ico, .gif formats
- **Prisma** generates TypeScript client from schema

## 🚀 Quick Start Paths

### For Developers
1. Read `README.md`
2. Check `BUILD_FIXES_SUMMARY.md`
3. Review `package.json` scripts
4. Explore `prisma/schema.prisma`
5. Browse `src/server/trpc/procedures/`

### For Deployers
1. Read `WINDOWS_DEPLOYMENT_CHECKLIST.md`
2. Review `EXE Instructions.md`
3. Configure `.env` from `config.env.template`
4. Check `electron-builder.config.js`
5. Run deployment scripts

### For Understanding Architecture
1. Review `TECHNICAL_SUMMARY.md`
2. Examine `src/server/trpc/root.ts`
3. Study `prisma/schema.prisma`
4. Check `src/router.tsx`
5. Explore main procedures in `src/server/trpc/procedures/`
