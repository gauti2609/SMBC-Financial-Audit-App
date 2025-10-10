# Financial Statement Generator

A professional financial statement generation tool with Schedule III compliance for Indian companies. Available as both a web application and desktop software.

## Features

### 🏢 Core Functionality
- **Schedule III Compliant** financial statement generation
- **Professional Excel Export** with formulas and advanced formatting
- **Trial Balance Import** from Excel/CSV files
- **Multi-format Support** (XLSX, CSV)
- **Desktop & Web Versions** available

### 📊 Financial Statements
- Balance Sheet with automatic calculations
- Profit & Loss Statement with variance analysis
- Cash Flow Statement (indirect method)
- Aging Schedules for receivables and payables
- Ratio Analysis with explanations
- Compliance Dashboard

### 🎨 Professional Features
- **Excel Formulas** - Live calculations in exported files
- **Advanced Formatting** - Professional templates with styling
- **Custom Branding** - Entity information and preferences
- **Multiple Currencies** - INR, USD, EUR support
- **Flexible Units** - Actual, Thousands, Millions, Crores

### 🖥️ Desktop Application
- **Local File Management** - Select download/upload paths
- **Offline Capability** - Works without internet
- **File Associations** - Open Excel/CSV files directly
- **Windows Installer** - Professional installation package
- **Auto-Updates** - Seamless software updates

## Installation

> **⚠️ Important**: If you encounter a Prisma installation error (`query_engine_bg.postgresql.wasm-base64.js`), see [QUICK_FIX_GUIDE.md](./QUICK_FIX_GUIDE.md) for the solution.

### Web Version
```bash
# Clone the repository
git clone <repository-url>
cd financial-statement-generator

# Install dependencies
pnpm install

# Setup Prisma (Important!)
pnpm run setup

# Set up environment variables
cp config.env.template .env
# Edit .env with your configuration

# Verify setup
pnpm run verify-prisma

# Start development server
pnpm run dev
```

### Desktop Version

#### Development
```bash
# Install dependencies (if not already done)
pnpm install

# Setup Prisma
pnpm run setup

# Build Electron app for development
pnpm run electron:dev
```

#### Production Build
```bash
# Build for Windows
pnpm run dist:win

# Build for macOS
pnpm run dist:mac

# Build for Linux
pnpm run dist:linux

# Build for all platforms
npm run dist
```

The installer files will be created in the `dist-electron` directory.

## Usage

### Getting Started
1. **Configure Entity Details** - Set up your company information in Common Control
2. **Upload Trial Balance** - Import your trial balance data from Excel
3. **Configure Schedules** - Set up additional schedules (PPE, Investments, etc.)
4. **Generate Statements** - Create professional financial statements
5. **Export & Review** - Download Excel files with formulas and formatting

### Desktop Features
- **File Path Selection** - Choose where to save exports and load files
- **Local File Operations** - Direct file system access
- **Offline Mode** - Full functionality without internet
- **Professional Installer** - Easy deployment across organizations

### Excel Export Features
- **Live Formulas** - Calculations update when you change values
- **Professional Formatting** - Corporate-style templates
- **Custom Styling** - Fonts, colors, and layouts from your preferences
- **Multiple Sheets** - Organized data across worksheets
- **Print-Ready** - Optimized for professional printing

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/financial_db"

# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# MinIO (for file storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="admin"
MINIO_SECRET_KEY="password"

# Application
NODE_ENV="development"
PORT=3000
```

### Common Control Settings
- **Entity Information** - Name, address, CIN
- **Financial Year** - Start and end dates
- **Display Preferences** - Currency, units, formatting
- **Report Customization** - Headers, signatures, compliance indicators

## Architecture

### Technology Stack
- **Frontend** - React 19, TypeScript, Tailwind CSS
- **Backend** - tRPC, Prisma ORM, PostgreSQL
- **Desktop** - Electron 27, Node.js
- **File Processing** - XLSX.js with advanced formatting
- **Deployment** - Docker, Docker Compose

### Project Structure
```
├── src/
│   ├── components/          # React components
│   ├── routes/             # Page routes
│   ├── server/             # Backend logic
│   └── trpc/              # API client
├── electron/              # Desktop application
│   ├── main.ts            # Main process
│   ├── preload.ts         # Preload scripts
│   └── assets/            # App icons and images
├── prisma/                # Database schema
└── docker/               # Container configuration
```

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- MinIO (for file storage)

### Development Workflow
```bash
# Start services
npm run dev

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:studio      # Open database GUI

# Code quality
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run format        # Prettier formatting
```

### Building Desktop App
```bash
# Compile TypeScript for Electron
npm run build:electron

# Create installers
npm run dist:win      # Windows installer
npm run dist:mac      # macOS DMG
npm run dist:linux    # Linux packages
```

## Deployment

### Web Application
```bash
# Build production version
npm run build

# Deploy with Docker
docker-compose up -d
```

### Desktop Distribution
1. **Build Installers** - Use `npm run dist:win` etc.
2. **Code Signing** - Configure certificates in electron-builder
3. **Auto-Updates** - Set up GitHub releases or custom server
4. **Distribution** - Share installer files with users

## Troubleshooting

### Prisma Installation Error

If you see:
```
Cannot find module 'query_engine_bg.postgresql.wasm-base64.js'
ELIFECYCLE Command failed with exit code 1.
```

**Solution**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run setup
```

See [QUICK_FIX_GUIDE.md](./QUICK_FIX_GUIDE.md) for details.

### Database Connection Issues

**Error**: "DATABASE_URL not found"
```bash
cp config.env.template .env
# Edit .env and configure DATABASE_URL
```

**Error**: "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env file
- Test connection: `pnpm prisma validate`

### Build Errors

**TypeScript errors**:
```bash
pnpm run typecheck
```

**Missing dependencies**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Electron build fails**:
- Check all asset files exist in `electron/assets/`
- Verify electron-builder.config.js configuration
- See `BUILD_FIXES_SUMMARY.md` for known issues

### Getting Help

For more help:
- Check `BUILD_FIXES_SUMMARY.md` for all known issues and fixes
- Check `PRISMA_FIX_FINAL.md` for Prisma-specific issues
- Run `pnpm run verify-prisma` for diagnostics
- Open a GitHub issue with error details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation** - [docs.financialstatementgenerator.com](https://docs.financialstatementgenerator.com)
- **Issues** - GitHub Issues
- **Email** - support@financialstatementgenerator.com

## Disclaimer

This software is provided as-is for assistance with financial statement preparation. Users are responsible for:
- Validating accuracy of input data
- Ensuring compliance with applicable standards
- Professional review of generated statements
- Meeting regulatory requirements

Professional accounting advice should be sought for important financial reporting matters.
