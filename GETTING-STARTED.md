# Getting Started - SCIM API Test Suite

## 🎯 What is This Project?

This is an **automated testing framework** that validates SCIM (System for Cross-domain Identity Management) APIs. Think of it as a robot that automatically checks if your user and group management APIs work correctly.

### Simple Analogy
Imagine you have a website where you can:
- Create users (like signing up)
- Read user information (like viewing a profile)
- Update users (like changing your email)
- Delete users (like closing an account)

Instead of manually testing these actions every time, this framework does it automatically!

---

## 📚 Quick Glossary (Technology Stack)

### What You Need to Know

| Technology | What It Is | Why We Use It |
|------------|-----------|---------------|
| **Node.js** | JavaScript runtime (like an engine) | Runs our test code on your computer |
| **TypeScript** | JavaScript with types (stricter rules) | Catches errors before running tests |
| **Playwright** | Testing tool | Sends API requests and checks responses |
| **npm** | Package manager | Installs tools and libraries we need |
| **Git** | Version control | Tracks code changes and collaboration |

### Don't Worry If You Don't Know These!
You'll learn as you go. The important part is understanding **what** the tests do, not **how** they work internally (at first).

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOU (Test Engineer)                      │
│              Run Command: npx playwright test               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Playwright Test Framework                  │
│  • Reads test files (tests/scim-api.spec.ts)              │
│  • Executes each test case                                 │
│  • Reports results (Pass ✅ / Fail ❌)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Configuration Layer                       │
│  • utils/api-config.ts (Where to send requests)           │
│  • .env file (Credentials and settings)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   SCIM API Server                          │
│  • Receives requests (Create user, Get user, etc.)        │
│  • Processes them                                         │
│  • Sends back responses (Success/Error)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started in 5 Steps

### Step 1: Install Prerequisites
```powershell
# Check if Node.js is installed
node --version   # Should show v18.x or higher

# If not installed, download from: https://nodejs.org/
```

### Step 2: Clone the Project
```powershell
git clone https://github.com/SaptakBagchi/scim-api-test-suite
cd scim-api-test-suite
```

### Step 3: Install Dependencies
```powershell
npm install   # Downloads all required libraries
```

### Step 4: Configure Environment
Create a `.env` file with your credentials:
```env
# Authentication Server
OAUTH_BASE_URL=https://your-server.com/identityservice
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret

# API Server
API_BASE_URL=https://your-server.com
```

### Step 5: Run Your First Test
```powershell
npx playwright test   # Runs all tests
```

---

## 📂 Project Structure (Simplified)

```
scim-api-test-suite/
│
├── tests/
│   └── scim-api.spec.ts          ← THE TESTS (Start here!)
│
├── utils/
│   ├── api-config.ts             ← Configuration (where, what credentials)
│   └── db-config.ts              ← Environment switching logic
│
├── .env                          ← YOUR SETTINGS (create this!)
├── package.json                  ← Project dependencies list
├── playwright.config.ts          ← Playwright settings
│
├── README.md                     ← Quick reference guide
├── GETTING-STARTED.md            ← This file!
└── SCIM-API-TESTING-GUIDE.md    ← Detailed testing guide
```

### Where to Focus First

1. **`tests/scim-api.spec.ts`** - Read this to understand what tests exist
2. **`.env`** - Configure this with your server details
3. **`README.md`** - Quick commands reference

---

## 🧪 What Tests Are Available?

### User Tests (15 tests)
- ✅ Create a new user
- ✅ Get user by ID
- ✅ Search for users
- ✅ Update user (full and partial)
- ✅ Delete user
- ✅ Handle errors (duplicates, not found, etc.)

### Group Tests (13 tests)
- ✅ Create a new group
- ✅ Get group by ID
- ✅ Search for groups
- ✅ Update group (add/remove members)
- ✅ Delete group
- ✅ Handle errors

---

## 🎮 Common Commands

### Run All Tests
```powershell
npx playwright test
```

### Run Tests with Details
```powershell
npx playwright test --reporter=line
```

### Run Specific Test
```powershell
npx playwright test -g "Create User"
```

### Switch Between Environments

**Non-OEM Environment:**
```powershell
$env:OEM = "false"
$env:ENDPOINT_TYPE = "scim"
npx playwright test
```

**OEM Environment:**
```powershell
$env:OEM = "true"
$env:ENDPOINT_TYPE = "apiserver"
npx playwright test
```

---

## 🔑 Key Concepts You'll Learn

### 1. **API Testing**
Instead of clicking buttons, we send HTTP requests:
- **POST** → Create something (like a user)
- **GET** → Read/retrieve information
- **PATCH/PUT** → Update existing data
- **DELETE** → Remove data

### 2. **Authentication**
Tests need permission to access the API:
- We use **OAuth 2.0** (like logging in with Google)
- Tests get a **token** (like a temporary password)
- Every request includes this token

### 3. **Test Structure**
Each test follows this pattern:
```typescript
test('Create User', async () => {
  // 1. Prepare: Create test data
  // 2. Act: Send API request
  // 3. Assert: Check if response is correct
  // 4. Cleanup: Delete test data
});
```

### 4. **Environment Switching**
We test against different servers:
- **OEM** (rdv-009275) - Multi-tenant environment
- **Non-OEM** (rdv-010318) - Single tenant environment
- **SCIM Endpoint** - Direct SCIM service
- **API Server Endpoint** - Through API gateway

---

## 📖 Learning Path

### Week 1: Understand the Basics
- [ ] Read this document completely
- [ ] Install Node.js and clone the project
- [ ] Run your first test successfully
- [ ] Read `tests/scim-api.spec.ts` to see test examples

### Week 2: Explore TypeScript & Playwright
- [ ] Read `SCIM-API-TESTING-GUIDE.md` for detailed concepts
- [ ] Modify one simple test (change a username)
- [ ] Understand what `.env` variables do
- [ ] Run tests in different environments

### Week 3: Write Your Own Test
- [ ] Create a new test case
- [ ] Understand authentication flow in `api-config.ts`
- [ ] Learn about Playwright's `expect()` assertions
- [ ] Debug a failing test

### Week 4: Advanced Concepts
- [ ] Read `PARAMETERIZATION-GUIDE.md`
- [ ] Understand endpoint switching
- [ ] Learn about test reporters
- [ ] Contribute to the framework!

---

## 🆘 Getting Help

### Documentation Resources

| Topic | Document | Purpose |
|-------|----------|---------|
| Quick Start | `README.md` | Fast commands reference |
| This Guide | `GETTING-STARTED.md` | Beginner-friendly overview |
| Deep Dive | `SCIM-API-TESTING-GUIDE.md` | Detailed testing concepts |
| Endpoints | `ENDPOINT_SWITCHING.md` | Environment switching |
| Parameters | `PARAMETERIZATION-GUIDE.md` | Advanced configurations |

### Online Resources
- **Node.js Tutorial**: https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
- **TypeScript Basics**: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
- **Playwright Docs**: https://playwright.dev/docs/intro
- **SCIM Protocol**: https://scim.cloud/

### Common Errors & Solutions

#### "Command not found: npx"
**Problem**: Node.js not installed
**Solution**: Install Node.js from https://nodejs.org/

#### "Cannot find module"
**Problem**: Dependencies not installed
**Solution**: Run `npm install`

#### "Authentication failed"
**Problem**: Wrong credentials in `.env`
**Solution**: Verify CLIENT_ID and CLIENT_SECRET

#### "Test timeout"
**Problem**: Server not responding or wrong URL
**Solution**: Check API_BASE_URL in `.env`

---

## 🎓 Next Steps

Now that you understand the high level:

1. **Continue to**: [`SCIM-API-TESTING-GUIDE.md`](./SCIM-API-TESTING-GUIDE.md) for deeper understanding
2. **Try running**: Your first test using the commands above
3. **Explore**: Open `tests/scim-api.spec.ts` and read through one test
4. **Ask questions**: Don't hesitate to ask your team!

---

## 💡 Pro Tips

1. **Start Small**: Don't try to understand everything at once
2. **Run Tests Often**: The best way to learn is by doing
3. **Read Error Messages**: They usually tell you exactly what's wrong
4. **Use Comments**: Add comments to code you don't understand
5. **Break Things**: It's a test environment - experiment freely!

---

## 🎉 Welcome Aboard!

You're now ready to start your journey with this test framework. Remember:
- **Everyone starts as a beginner**
- **Questions are encouraged**
- **Learning by doing is the best approach**

Happy Testing! 🚀

---

**Last Updated**: December 9, 2025
**Next Review**: Add video tutorials and interactive examples
