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

async function checkColumns() {
  let pool: sql.ConnectionPool | null = null;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected successfully!\n');
    
    // Get column information
    console.log('📋 Querying hsi.useraccount table structure...\n');
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'hsi' 
        AND TABLE_NAME = 'useraccount'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📊 Table Structure for hsi.useraccount:');
    console.log('==========================================\n');
    
    result.recordset.forEach((col: any) => {
      const nullable = col.IS_NULLABLE === 'YES' ? '(nullable)' : '(NOT NULL)';
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  ${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE}${length} ${nullable}`);
    });
    
    console.log('\n==========================================\n');
    
    // Try to get a sample record
    console.log('📄 Fetching sample record...\n');
    const sampleResult = await pool.request().query(`
      SELECT TOP 1 * 
      FROM hsi.useraccount
      ORDER BY UserNum DESC
    `);
    
    if (sampleResult.recordset.length > 0) {
      console.log('Sample record columns and values:');
      const sample = sampleResult.recordset[0];
      Object.keys(sample).forEach(key => {
        console.log(`  ${key}: ${sample[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n✅ Connection closed');
    }
  }
}

checkColumns();
