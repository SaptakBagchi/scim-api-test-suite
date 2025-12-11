# SCIM API Test Framework

A production-ready test automation framework for SCIM (System for Cross-domain Identity Management) 2.0 APIs using Playwright and TypeScript.

## 🎯 Overview

This framework provides a clean, reusable structure for SCIM API testing with utilities for authentication, validation, environment management, and database operations. Built with enterprise best practices for maintainability and extensibility.

## � Branch Structure

- **`main`** - Clean framework only (utilities, configs, documentation) ⭐ You are here
- **`develop`** - Full test suite with 28+ tests (active development branch)
- **`poc`** - Showcase with 5-6 selected tests for demonstration

## 🚀 Key Features

- ✅ **Clean Architecture**: Reusable utilities and clear separation of concerns
- ✅ **Multi-Environment**: Support for Development, Staging, Production
- ✅ **OEM/Non-OEM**: Automatic handling of environment differences
- ✅ **OAuth2 Authentication**: Automated token management
- ✅ **Endpoint Flexibility**: Switch between SCIM and API Server endpoints
- ✅ **Database Integration**: Optional SQL Server integration for test data
- ✅ **Rich Validation**: Pre-built validators for common SCIM patterns
- ✅ **Type-Safe**: Full TypeScript support

## 📁 Framework Structure

```
scim-api-test-suite/  (main branch)
├── utils/
│   ├── api-config.ts           # API utilities, auth, validation
│   └── db-config.ts            # Database operations (optional)
├── tests/
│   └── example.spec.ts         # Example test template
├── scripts/
│   ├── switch-endpoint.ps1     # Endpoint switching script
│   └── test-with-endpoint.ps1  # Test runner with endpoint
├── global-setup.ts             # Global test setup
├── playwright.config.ts        # Playwright configuration
├── .env files                  # Environment configurations
├── FRAMEWORK.md                # Detailed framework documentation
└── Documentation files
```

## 🔧 Framework Components

### **Authentication & API Utilities** (`utils/api-config.ts`)
- OAuth2 token management
- Request/response validation
- Endpoint configuration (SCIM/API Server)
- Environment detection (OEM/Non-OEM)
- Pre-built validators

### **Database Utilities** (`utils/db-config.ts`)
- SQL Server connection pooling
- User CRUD operations
- Test data management
- Environment-specific configurations

### **Validation Utilities**
- Response status validation
- JSON schema validation
- Required fields validation
- Field type validation
- Response time validation

### **Logging & Debugging**
- Structured console output
- Clean ASCII prefixes (Windows PowerShell compatible)
- Request/response logging
- Test step tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the framework
git clone <repository-url>
cd scim-api-test-suite

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Run Example Tests
```bash
# Run the example tests
npx playwright test tests/example.spec.ts

# View HTML report
npx playwright show-report
```

### Switch to Development Branch (Full Test Suite)
```bash
# Checkout develop branch for full 28+ tests
git checkout develop

# Run full test suite
npm test

# Or specific tests
npx playwright test tests/scim-api-full.spec.ts
```

### Switch to POC Branch (Demo Tests)
```bash
# Checkout poc branch for showcase tests
git checkout poc

# Run POC tests (5-6 tests)
npx playwright test tests/scim-api-poc.spec.ts
```

## 🔐 Environment Configuration

### Required Variables
```bash
# OAuth2 Authentication
OAUTH_BASE_URL=https://your-domain.com/identityservice
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
OAUTH_SCOPES=iam.user-catalog iam.user-catalog.read iam.user-catalog.write

# API Configuration  
API_BASE_URL=https://your-domain.com
ENDPOINT_TYPE=scim  # scim or graph

# Test Configuration
DEFAULT_USER_ID=1
DEFAULT_GROUP_ID=1
```

## 📊 Test Reports

After running tests, open the HTML report:
```bash
npx playwright show-report
```

Reports include:
- ✅ Pass/Fail status for each test
- 📝 Detailed test steps with API responses
- 🕒 Performance timing
- 📷 Screenshots on failures
- 🔍 Network activity logs

## 🛠️ Development

### Adding New Tests
1. Add test cases to `tests/scim-api.spec.ts`
2. Use existing patterns for authentication and validation
3. Follow the naming convention: `should [operation] [resource]`

### Environment Switching
Use environment-specific .env files:
- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

### Custom Scripts
Add custom npm scripts in `package.json` for common test scenarios.

## 📚 Documentation

- **[SCIM API Testing Guide](./SCIM-API-TESTING-GUIDE.md)** - Complete testing documentation
- **[Parameterization Guide](./PARAMETERIZATION-GUIDE.md)** - Environment configuration
- **[Endpoint Switching Guide](./ENDPOINT_SWITCHING.md)** - Multi-endpoint testing
- **[Test Summary](./TEST_SUMMARY.md)** - Current test status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

ISC License - See LICENSE file for details