# SCIM API Test Suite

A comprehensive test automation framework for SCIM (System for Cross-domain Identity Management) API endpoints using Playwright and TypeScript.

## 🎯 Overview

This test suite provides complete coverage for SCIM v2 API operations including Users, Groups, Schemas, Service Provider Configuration, Resource Types, and Health Check endpoints. Built with enterprise-grade practices for reliability and maintainability.

## 🚀 Features

- ✅ **Comprehensive Coverage**: 28+ tests covering all SCIM API endpoints
- ✅ **Multi-Environment Support**: Development, Staging, and Production configurations
- ✅ **Type-Safe**: Full TypeScript support with proper interfaces
- ✅ **OAuth2 Authentication**: Automated token management
- ✅ **Rich Reporting**: HTML reports with detailed test steps
- ✅ **Error Handling**: Production-ready error scenarios
- ✅ **Parallel Execution**: Optimized test performance

## 📁 Project Structure

```
scim-api-test-suite/
├── .env                          # Environment configuration
├── .env.development             # Development environment
├── .env.staging                 # Staging environment  
├── .env.production             # Production environment
├── global-setup.ts             # Global test setup
├── playwright.config.ts        # Playwright configuration
├── utils/
│   └── api-config.ts           # Authentication & API utilities
├── tests/
│   └── scim-api.spec.ts        # Main SCIM API test suite
├── TestContext/                # Test context and data management
├── scripts/                    # Utility scripts
└── docs/
    ├── SCIM-API-TESTING-GUIDE.md
    ├── PARAMETERIZATION-GUIDE.md
    ├── ENDPOINT_SWITCHING.md
    └── TEST_SUMMARY.md
```

## 🔧 Test Coverage

### **User Operations (15+ Tests)**
- Get All Users (with pagination, filtering)
- Get User by ID
- Create User
- Update User (PUT)
- Partial Update User (PATCH)  
- Delete User
- Search Users with POST

### **Group Operations (7+ Tests)**
- Get All Groups
- Get Group by ID
- Create Group
- Update Group (PUT/PATCH)
- Delete Group

### **Schema & Configuration (6+ Tests)**
- Service Provider Configuration
- SCIM Schemas validation
- Resource Types discovery
- Health Check endpoints
- Diagnostics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone and setup
git clone <repository-url>
cd scim-api-test-suite
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API credentials
```

### Running Tests
```bash
# Run all tests
npm test

# Run with HTML report
npm run test:api

# Environment-specific runs
npm run test:dev
npm run test:staging  
npm run test:prod

# Run specific test groups
npm run test:resource-types
npm run test:get-user

# Debug mode
npm run test:debug
npm run test:headed

# View last report
npm run report
```

## 🔐 Environment Configuration

### Required Environment Variables
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