import sql from 'mssql';

const dbConfig: sql.config = {
  server: 'RDV-009275\\QASQL17LOCAL',
  database: 'LocalOBTesting',
  user: 'hsi',
  password: 'wstinol',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function findUser() {
  let pool: sql.ConnectionPool | null = null;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected successfully!\n');
    
    // Search for user ID 106 (known existing user)
    console.log('🔍 Searching for user ID 106...\n');
    const result106 = await pool.request().query(`
      SELECT * 
      FROM hsi.useraccount
      WHERE usernum = 106
    `);
    
    if (result106.recordset.length > 0) {
      console.log('✅ Found user 106:');
      console.log(result106.recordset[0]);
    } else {
      console.log('❌ User 106 not found in hsi.useraccount');
    }
    
    // Check if user 335 exists
    console.log('\n🔍 Searching for user ID 335 (just created)...\n');
    const result335 = await pool.request().query(`
      SELECT * 
      FROM hsi.useraccount
      WHERE usernum = 335
    `);
    
    if (result335.recordset.length > 0) {
      console.log('✅ Found user 335:');
      console.log(result335.recordset[0]);
    } else {
      console.log('❌ User 335 not found in hsi.useraccount');
    }
    
    // List highest user numbers to see what's there
    console.log('\n🔍 Top 5 users by usernum...\n');
    const resultTop = await pool.request().query(`
      SELECT TOP 5 usernum, username, realname
      FROM hsi.useraccount
      ORDER BY usernum DESC
    `);
    
    console.log('Highest usernum records:');
    resultTop.recordset.forEach((row: any) => {
      console.log(`  ID: ${row.usernum}, Username: ${row.username}, RealName: ${row.realname}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n✅ Connection closed');
    }
  }
}

findUser();
