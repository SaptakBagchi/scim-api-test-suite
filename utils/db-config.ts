import sql from 'mssql';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment-specific database configurations
 * OEM and Non-OEM environments with their database and API settings
 */
interface EnvironmentDbConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  apiBaseUrl: string;
  oauthBaseUrl: string;
  institutionId?: string; // Optional: Used for OEM environment searches
}

const environmentConfigs = {
  oem: {
    server: 'RDV-009275\\QASQL17LOCAL',
    database: 'LocalOBTestingTwo',
    user: 'hsi',
    password: 'wstinol',
    apiBaseUrl: 'https://rdv-009275.hylandqa.net',
    oauthBaseUrl: 'https://rdv-009275.hylandqa.net/identityservice',
    institutionId: '103' // Default institution ID for OEM searches
  },
  nonOem: {
    server: 'RDV-010318\\LOCALSQLSERVER22',
    database: 'LocalOBTesting',
    user: 'hsi',
    password: 'wstinol',
    apiBaseUrl: 'https://rdv-010318.hylandqa.net',
    oauthBaseUrl: 'https://rdv-010318.hylandqa.net/identityservice'
  }
};

/**
 * Get database and API configuration based on the OEM environment variable
 * Set OEM=true or OEM=1 for OEM environment, otherwise defaults to Non-OEM
 */
function getDbConfigForEnvironment(): EnvironmentDbConfig {
  // Check if OEM parameter is set (can be 'true', '1', 'yes', or 'oem')
  const oemParam = process.env.OEM?.toLowerCase();
  const isOem = oemParam === 'true' || oemParam === '1' || oemParam === 'yes' || oemParam === 'oem';
  
  const selectedConfig = isOem ? environmentConfigs.oem : environmentConfigs.nonOem;
  
  console.log(`🔧 Environment: ${isOem ? 'OEM (rdv-009275)' : 'Non-OEM (rdv-010318)'}`);
  console.log(`📍 API URL: ${selectedConfig.apiBaseUrl}`);
  console.log(`ðŸ—„ï¸  Database: ${selectedConfig.server}\\${selectedConfig.database}`);
  
  // Set the API_BASE_URL and OAUTH_BASE_URL for the test context
  process.env.API_BASE_URL = selectedConfig.apiBaseUrl;
  process.env.OAUTH_BASE_URL = selectedConfig.oauthBaseUrl;
  
  return selectedConfig;
}

// Get the appropriate database configuration for the current environment
const envDbConfig = getDbConfigForEnvironment();

// SQL Server configuration with environment-specific or fallback values
const dbConfig: sql.config = {
  server: envDbConfig.server,
  database: envDbConfig.database,
  user: envDbConfig.user,
  password: envDbConfig.password,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectTimeout: 60000, // Increased from 30s to 60s
    requestTimeout: 60000  // Increased from 30s to 60s
  },
  pool: {
    max: 50,
    min: 0, // Changed from 2 to 0 - don't pre-create connections
    idleTimeoutMillis: 60000, // Increased from 30s to 60s
    acquireTimeoutMillis: 60000 // Increased from 30s to 60s
  }
};

// Shared connection pool
let poolPromise: Promise<sql.ConnectionPool> | null = null;

/**
 * Get or create a shared connection pool
 */
async function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    console.log(`⏳ Creating database connection pool...`);
    console.log(`   Server: ${dbConfig.server}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then(pool => {
        console.log('✅ Database connection pool successfully created and connected');
        pool.on('error', err => {
          console.error('❌ Database pool error:', err.message);
          poolPromise = null;
        });
        return pool;
      })
      .catch(err => {
        console.error('❌ Failed to create database pool:', err.message);
        console.error('   Error details:', err);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}

/**
 * Retry a database operation with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's not a connection error
      if (!error.message?.includes('Failed to connect') && 
          !error.message?.includes('Connection') &&
          !error.code?.includes('ECONNREFUSED')) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Database connection attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Reset pool on connection errors
      if (poolPromise) {
        try {
          const pool = await poolPromise;
          await pool.close();
        } catch (e) {
          // Ignore errors when closing
        }
        poolPromise = null;
      }
    }
  }
  
  throw lastError;
}

// Export database connection info for logging
export const getDatabaseInfo = () => ({
  server: dbConfig.server,
  database: dbConfig.database,
  user: dbConfig.user
});

/**
 * Query the useraccount table to verify user exists
 * @param username - The username to search for
 * @returns User record if found, null otherwise
 */
export async function getUserFromDatabase(username: string) {
  return retryOperation(async () => {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT 
          usernum,
          username,
          realname,
          emailaddress,
          disablelogin,
          lastlogon,
          lastpwchange,
          obuniqueid,
          usertype
        FROM hsi.useraccount
        WHERE username = @username
      `);
    
    return result.recordset.length > 0 ? result.recordset[0] : null;
  });
}

/**
 * Get user by UserNum (ID)
 * @param userNum - The UserNum to search for
 * @returns User record if found, null otherwise
 */
export async function getUserByIdFromDatabase(userNum: number) {
  return retryOperation(async () => {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('userNum', sql.BigInt, userNum)
      .query(`
        SELECT 
          usernum,
          username,
          realname,
          emailaddress,
          disablelogin,
          lastlogon,
          lastpwchange,
          obuniqueid,
          usertype
        FROM hsi.useraccount
        WHERE usernum = @userNum
      `);
    
    return result.recordset.length > 0 ? result.recordset[0] : null;
  });
}

/**
 * Get group by GroupNum (ID)
 * @param groupNum - The GroupNum to search for
 * @returns Group record if found, null otherwise
 */
export async function getGroupByIdFromDatabase(groupNum: number) {
  return retryOperation(async () => {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('groupNum', sql.BigInt, groupNum)
      .query(`
        SELECT 
          usergroupnum,
          usergroupname
        FROM hsi.usergroup
        WHERE usergroupnum = @groupNum
      `);
    
    return result.recordset.length > 0 ? result.recordset[0] : null;
  });
}

/**
 * Get group by GroupName
 * @param groupName - The group name to search for
 * @returns Group record if found, null otherwise
 */
export async function getGroupByNameFromDatabase(groupName: string) {
  return retryOperation(async () => {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('groupName', sql.NVarChar, groupName)
      .query(`
        SELECT 
          usergroupnum,
          usergroupname
        FROM hsi.usergroup
        WHERE usergroupname = @groupName
      `);
    
    return result.recordset.length > 0 ? result.recordset[0] : null;
  });
}

/**
 * Check if user is member of a group
 * @param userNum - The UserNum
 * @param groupNum - The GroupNum
 * @returns true if user is member, false otherwise
 */
export async function isUserGroupMember(userNum: number, groupNum: number) {
  return retryOperation(async () => {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('userNum', sql.BigInt, userNum)
      .input('groupNum', sql.BigInt, groupNum)
      .query(`
        SELECT 
          usernum,
          groupnum
        FROM hsi.userxusergroup
        WHERE usernum = @usernum AND usergroupnum = @groupnum
      `);
    
    return result.recordset.length > 0;
  });
}

/**
 * Get all members of a group
 * @param groupNum - The GroupNum
 * @returns Array of user IDs in the group
 */
export async function getGroupMembers(groupNum: number) {
  return retryOperation(async () => {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('groupNum', sql.BigInt, groupNum)
      .query(`
        SELECT 
          usernum
        FROM hsi.userxusergroup
        WHERE usergroupnum = @groupnum
      `);
    
    return result.recordset.map(row => parseInt(row.usernum));
  });
}

/**
 * Check if current environment is OEM
 */
export function isOemEnvironment(): boolean {
  const oemParam = process.env.OEM?.toLowerCase();
  return oemParam === 'true' || oemParam === '1' || oemParam === 'yes' || oemParam === 'oem';
}

/**
 * Get institution ID for OEM environment (returns undefined for Non-OEM)
 */
export function getInstitutionId(): string | undefined {
  return isOemEnvironment() ? envDbConfig.institutionId : undefined;
}

// Cache for column information
let cachedColumnInfo: { columns: string[], identityColumn: string | null } | null = null;

/**
 * Get column information from hsi.useraccount table
 * @returns Object with column names and identity info
 */
export async function getUserAccountColumns(): Promise<{ columns: string[], identityColumn: string | null }> {
  // Return cached info if available
  if (cachedColumnInfo) {
    return cachedColumnInfo;
  }
  
  const pool = await getPool();
  
  // Get columns and identity info in a single query for efficiency
  const result = await pool.request().query(`
    SELECT 
      c.COLUMN_NAME,
      COLUMNPROPERTY(OBJECT_ID('hsi.useraccount'), c.COLUMN_NAME, 'IsIdentity') as IsIdentity
    FROM INFORMATION_SCHEMA.COLUMNS c
    WHERE c.TABLE_SCHEMA = 'hsi' 
      AND c.TABLE_NAME = 'useraccount'
    ORDER BY c.ORDINAL_POSITION
  `);
  
  const columns = result.recordset.map((row: any) => row.COLUMN_NAME);
  const identityColumn = result.recordset.find((row: any) => row.IsIdentity === 1)?.COLUMN_NAME || null;
  
  console.log(`📋 Available columns in hsi.useraccount: ${columns.slice(0, 10).join(', ')}...`);
  console.log(`🔑 Identity column: ${identityColumn || 'None (usernum may need explicit value)'}`);
  
  // Cache the result
  cachedColumnInfo = { columns, identityColumn };
  return cachedColumnInfo;
}

/**
 * Create a test user directly in the database for DELETE testing
 * @param username - Username for the test user
 * @param institutionId - Institution ID for OEM environments
 * @returns The created user's UserNum
 */
export async function createTestUserInDatabase(username: string, institutionId?: string): Promise<number> {
  return retryOperation(async () => {
    const pool = await getPool();
    
    // First, get the actual column names from the database
    const { columns, identityColumn } = await getUserAccountColumns();
    
    // Find the correct column name (check for 'institution' or 'institutionid')
    const institutionIdColumn = columns.find((col: string) => col.toLowerCase() === 'institutionid' || col.toLowerCase() === 'institution');
    const usernameColumn = columns.find((col: string) => col.toLowerCase() === 'username');
    const realnameColumn = columns.find((col: string) => col.toLowerCase() === 'realname');
    const emailColumn = columns.find((col: string) => col.toLowerCase() === 'emailaddress');
    const disableLoginColumn = columns.find((col: string) => col.toLowerCase() === 'disablelogin');
    const obUniqueIdColumn = columns.find((col: string) => col.toLowerCase() === 'obuniqueid');
    const userNumColumn = columns.find((col: string) => col.toLowerCase() === 'usernum');
    
    console.log(`📝 Using column names: username=${usernameColumn}, institution=${institutionIdColumn}, identity=${identityColumn}`);
    
    // Generate unique IDs
    const obUniqueId = Date.now();
    const generatedUserNum = Math.floor(Math.random() * 900000) + 100000; // Generate random 6-digit number
    
    const request = pool.request()
      .input('username', sql.NVarChar, username)
      .input('realname', sql.NVarChar, `Test User ${username}`)
      .input('emailaddress', sql.NVarChar, `${username}@test.com`)
      .input('disablelogin', sql.Bit, 0)
      .input('obuniqueid', sql.BigInt, obUniqueId);
    
    // Build INSERT query dynamically based on available columns
    let insertColumns = [usernameColumn, realnameColumn, emailColumn, disableLoginColumn, obUniqueIdColumn].filter(Boolean);
    let insertValues = ['@username', '@realname', '@emailaddress', '@disablelogin', '@obuniqueid'];
    
    // Add usernum if it's not an identity column
    if (userNumColumn && !identityColumn) {
      request.input('usernum', sql.Int, generatedUserNum);
      insertColumns.unshift(userNumColumn); // Add at beginning
      insertValues.unshift('@usernum');
    }
    
    // Add institutionId for OEM environments if column exists
    if (institutionId && institutionIdColumn) {
      request.input('institutionId', sql.Int, parseInt(institutionId));
      insertColumns.push(institutionIdColumn);
      insertValues.push('@institutionId');
    }
    
    const result = await request.query(`
      INSERT INTO hsi.useraccount (
        ${insertColumns.join(', ')}
      )
      OUTPUT INSERTED.${userNumColumn}
      VALUES (
        ${insertValues.join(', ')}
      )
    `);
    
    const userNum = result.recordset[0][userNumColumn!];
    console.log(`✅ Created test user in database: ${username} (ID: ${userNum}, InstitutionId: ${institutionId || 'N/A'})`);
    return userNum;
  });
}

/**
 * Delete a test user directly from the database (cleanup only, not for testing DELETE API)
 * @param userNum - The UserNum to delete
 */
export async function deleteTestUserFromDatabase(userNum: number): Promise<void> {
  return retryOperation(async () => {
    const pool = await getPool();
    
    // First delete any group memberships
    await pool.request()
      .input('userNum', sql.BigInt, userNum)
      .query(`DELETE FROM hsi.userxusergroup WHERE usernum = @userNum`);
    
    // Then delete the user
    await pool.request()
      .input('userNum', sql.BigInt, userNum)
      .query(`DELETE FROM hsi.useraccount WHERE usernum = @userNum`);
    
    console.log(`🗑️  Cleaned up test user from database (ID: ${userNum})`);
  });
}

/**
 * Close all SQL connections
 */
export async function closeDatabaseConnections() {
  if (poolPromise) {
    try {
      const pool = await poolPromise;
      await pool.close();
      console.log('Database connection pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
    } finally {
      poolPromise = null;
    }
  }
}
