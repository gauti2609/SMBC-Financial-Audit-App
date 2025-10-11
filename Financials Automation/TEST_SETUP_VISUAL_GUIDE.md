# Test Environment Setup - Visual Guide

```
┌─────────────────────────────────────────────────────────────────┐
│         SMBC Financial Audit App - Test Environment            │
│                    Setup Decision Tree                          │
└─────────────────────────────────────────────────────────────────┘

                         START HERE
                              │
                              ▼
                    ┌─────────────────┐
                    │  What's your    │
                    │  use case?      │
                    └─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌───────────────┐           ┌──────────────┐
        │  End User     │           │  Developer/  │
        │  Installation │           │  Tester      │
        └───────────────┘           └──────────────┘
                │                           │
                ▼                           ▼
    ┌─────────────────────┐     ┌──────────────────────┐
    │ INSTALLATION_GUIDE  │     │ TEST_ENVIRONMENT     │
    │      .md            │     │    _SETUP.md         │
    │                     │     │                      │
    │ • Windows focused   │     │ • All platforms      │
    │ • Step-by-step      │     │ • Docker + Native    │
    │ • GUI focus         │     │ • CI/CD matching     │
    └─────────────────────┘     └──────────────────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
            ┌────────────────────┐              ┌──────────────────┐
            │   Docker Setup     │              │  Native Setup    │
            │  (Recommended)     │              │                  │
            └────────────────────┘              └──────────────────┘
                        │                                   │
                        ▼                                   ▼
            ┌────────────────────┐              ┌──────────────────┐
            │ 1. Install Docker  │              │ 1. Install Node  │
            │ 2. Clone repo      │              │ 2. Install pnpm  │
            │ 3. cp .env         │              │ 3. Clone repo    │
            │ 4. docker-compose  │              │ 4. cp .env       │
            │    up              │              │ 5. pnpm install  │
            └────────────────────┘              │ 6. pnpm setup    │
                        │                       └──────────────────┘
                        │                                   │
                        └────────────┬──────────────────────┘
                                     ▼
                        ┌────────────────────┐
                        │  VERIFICATION      │
                        │                    │
                        │ • pnpm verify-     │
                        │   prisma           │
                        │ • pnpm typecheck   │
                        │ • pnpm build       │
                        └────────────────────┘
                                     │
                        ┌────────────┴────────────┐
                        ▼                         ▼
                ┌───────────┐              ┌──────────┐
                │  SUCCESS! │              │  ERROR?  │
                └───────────┘              └──────────┘
                        │                         │
                        ▼                         ▼
            ┌────────────────────┐    ┌──────────────────────┐
            │ Use app for:       │    │ Check:               │
            │ • Development      │    │ • Troubleshooting    │
            │ • Testing          │    │   section            │
            │ • Building         │    │ • QUICK_TEST_        │
            └────────────────────┘    │   COMMANDS.md        │
                                      └──────────────────────┘

═══════════════════════════════════════════════════════════════════

                    Quick Command Reference

┌─────────────────────────────────────────────────────────────────┐
│ DOCKER ENVIRONMENT                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Start:     ./scripts/docker-compose up                        │
│  Stop:      ./scripts/docker-compose down                      │
│  Logs:      ./scripts/docker-compose logs -f                   │
│  Shell:     ./scripts/docker-compose exec app bash             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NATIVE ENVIRONMENT                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Setup:     pnpm install && pnpm run setup                     │
│  Dev:       pnpm run dev                                       │
│  Build:     pnpm run build                                     │
│  Verify:    pnpm run verify-prisma                             │
│  Clean:     rm -rf node_modules pnpm-lock.yaml                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

                Environment Comparison Matrix

┌──────────────┬─────────────────┬─────────────────────────────┐
│   Feature    │     Docker      │          Native             │
├──────────────┼─────────────────┼─────────────────────────────┤
│ Setup Time   │   5-10 min      │        15-30 min            │
├──────────────┼─────────────────┼─────────────────────────────┤
│ CI/CD Match  │   ✅ Exact      │        ⚠️ May vary          │
├──────────────┼─────────────────┼─────────────────────────────┤
│ Isolation    │   ✅ Complete   │        ❌ Shared            │
├──────────────┼─────────────────┼─────────────────────────────┤
│ Performance  │   ⚠️ Overhead   │        ✅ Native            │
├──────────────┼─────────────────┼─────────────────────────────┤
│ Database     │   ✅ Included   │        ❌ Manual            │
├──────────────┼─────────────────┼─────────────────────────────┤
│ Services     │   ✅ All in one │        ❌ Install each      │
├──────────────┼─────────────────┼─────────────────────────────┤
│ Best For     │   Testing       │        Development          │
└──────────────┴─────────────────┴─────────────────────────────┘

═══════════════════════════════════════════════════════════════════

                Platform-Specific Setup Steps

┌─────────────────────────────────────────────────────────────────┐
│ WINDOWS                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Install Node.js 20 from nodejs.org                         │
│  2. npm install -g pnpm                                         │
│  3. Git clone and navigate to directory                        │
│  4. copy config.env.template .env                              │
│  5. pnpm install                                               │
│  6. pnpm run setup                                             │
│                                                                 │
│  OR use Docker Desktop                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ macOS                                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. brew install node@20                                        │
│  2. npm install -g pnpm                                         │
│  3. git clone and cd to directory                              │
│  4. cp config.env.template .env                                │
│  5. pnpm install                                               │
│  6. pnpm run setup                                             │
│                                                                 │
│  OR use Docker Desktop                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LINUX (Ubuntu/Debian)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash│
│  2. sudo apt-get install -y nodejs                             │
│  3. npm install -g pnpm                                         │
│  4. git clone and cd to directory                              │
│  5. cp config.env.template .env                                │
│  6. pnpm install                                               │
│  7. pnpm run setup                                             │
│                                                                 │
│  OR install Docker Engine                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

                    Common Issues & Solutions

┌─────────────────────────────────────────────────────────────────┐
│ Issue: "node is not recognized"                                │
│ Solution: Restart terminal/computer after Node.js install      │
├─────────────────────────────────────────────────────────────────┤
│ Issue: "pnpm is not recognized"                                │
│ Solution: Close and reopen terminal, reinstall if needed       │
├─────────────────────────────────────────────────────────────────┤
│ Issue: "Cannot find module '@prisma/client'"                   │
│ Solution: pnpm run setup                                       │
├─────────────────────────────────────────────────────────────────┤
│ Issue: "DATABASE_URL not found"                                │
│ Solution: cp config.env.template .env                          │
├─────────────────────────────────────────────────────────────────┤
│ Issue: "Port 3000 already in use"                              │
│ Solution: Kill process using port (see docs)                   │
├─────────────────────────────────────────────────────────────────┤
│ Issue: Build fails                                              │
│ Solution: rm -rf .vinxi .output && pnpm run build             │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

                    Documentation Map

        ┌─────────────────────────────────────┐
        │     TEST_ENVIRONMENT_SETUP.md       │
        │    (Complete setup instructions)    │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│INSTALLATION_ │ │QUICK_TEST_   │ │VERIFICATION_ │
│GUIDE.md      │ │COMMANDS.md   │ │AND_TROUBLE   │
│              │ │              │ │SHOOTING.md   │
│(End users)   │ │(Reference)   │ │(Details)     │
└──────────────┘ └──────────────┘ └──────────────┘

═══════════════════════════════════════════════════════════════════

                Success Checklist After Setup

    ☑ Node.js 20+ installed and verified
    ☑ pnpm installed and verified  
    ☑ Project cloned from GitHub
    ☑ .env file created from template
    ☑ Dependencies installed (pnpm install)
    ☑ Prisma setup completed (pnpm run setup)
    ☑ Verification passed (pnpm run verify-prisma)
    ☑ Development server starts (pnpm run dev)
    ☑ Production build succeeds (pnpm run build)
    ☑ Can access http://localhost:3000

═══════════════════════════════════════════════════════════════════

For complete details, see: TEST_ENVIRONMENT_SETUP.md
For quick commands, see: QUICK_TEST_COMMANDS.md
For troubleshooting, see: VERIFICATION_AND_TROUBLESHOOTING.md
```
