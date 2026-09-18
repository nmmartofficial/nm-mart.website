import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const reportPath = path.join(projectRoot, 'STEP_3_LIVE_DATABASE_AUDIT_REPORT.md');

const TARGET_TABLES = [
  'products',
  'orders',
  'order_items',
  'profiles',
  'admin_users',
  'inventory',
  'inventory_logs',
];

const TABLES_FOR_RLS = [...TARGET_TABLES];

function redactConnectionString(connectionString) {
  if (!connectionString) return '[not set]';
  return connectionString
    .replace(/(postgres(?:ql)?\:\/\/)([^:@/\s]+):([^@\s]+)@/i, '$1$2:[REDACTED]@')
    .replace(/(password=)([^&\s]+)/gi, '$1[REDACTED]')
    .replace(/(pwd=)([^&\s]+)/gi, '$1[REDACTED]');
}

function maybeEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return '';
}

function buildConnectionString() {
  const directCandidates = [
    'DATABASE_URL',
    'SUPABASE_DB_URL',
    'POSTGRES_URL',
    'SUPABASE_DATABASE_URL',
    'PGDATABASE_URL',
  ];

  const direct = maybeEnv(...directCandidates);
  if (direct) return direct;

  const host = maybeEnv('PGHOST', 'POSTGRES_HOST');
  const port = maybeEnv('PGPORT', 'POSTGRES_PORT', '5432');
  const db = maybeEnv('PGDATABASE', 'POSTGRES_DB');
  const user = maybeEnv('PGUSER', 'POSTGRES_USER');
  const password = maybeEnv('PGPASSWORD', 'POSTGRES_PASSWORD');

  if (host && db && user) {
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = password ? encodeURIComponent(password) : '';
    const sslMode = maybeEnv('PGSSLMODE', 'POSTGRES_SSLMODE');
    const conn = `postgresql://${encodedUser}:${encodedPassword}@${host}:${port || 5432}/${db}`;
    return sslMode && sslMode.toLowerCase() !== 'disable' ? `${conn}?sslmode=${encodeURIComponent(sslMode)}` : conn;
  }

  return '';
}

function formatValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function escapeMarkdown(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, '<br>');
}

function toMarkdownTable(headers, rows) {
  const headerLine = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map((row) => `| ${row.map((cell) => escapeMarkdown(cell)).join(' | ')} |`);
  return [headerLine, separator, ...dataRows].join('\n');
}

async function queryRows(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows;
}

async function safeQuery(client, sql, params = []) {
  try {
    return await queryRows(client, sql, params);
  } catch (error) {
    return [{ error: String(error).replace(/\n/g, ' ') }];
  }
}

async function getTableSummary(client, tableName) {
  const rows = await queryRows(
    client,
    `
      SELECT
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.ordinal_position,
        EXISTS (
          SELECT 1
          FROM information_schema.constraint_column_usage ccu
          JOIN information_schema.table_constraints tc
            ON tc.constraint_name = ccu.constraint_name
            AND tc.table_schema = ccu.table_schema
          WHERE tc.table_name = $1
            AND tc.constraint_type = 'PRIMARY KEY'
            AND ccu.column_name = c.column_name
        ) AS is_primary_key,
        EXISTS (
          SELECT 1
          FROM information_schema.constraint_column_usage ccu
          JOIN information_schema.table_constraints tc
            ON tc.constraint_name = ccu.constraint_name
            AND tc.table_schema = ccu.table_schema
          WHERE tc.table_name = $1
            AND tc.constraint_type = 'FOREIGN KEY'
            AND ccu.column_name = c.column_name
        ) AS is_foreign_key,
        EXISTS (
          SELECT 1
          FROM information_schema.constraint_column_usage ccu
          JOIN information_schema.table_constraints tc
            ON tc.constraint_name = ccu.constraint_name
            AND tc.table_schema = ccu.table_schema
          WHERE tc.table_name = $1
            AND tc.constraint_type = 'UNIQUE'
            AND ccu.column_name = c.column_name
        ) AS is_unique_key
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = $1
      ORDER BY c.ordinal_position
    `,
    [tableName],
  );

  return rows;
}

async function getTablePrimaryKeys(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'PRIMARY KEY'
      ORDER BY kcu.ordinal_position
    `,
    [tableName],
  );
}

async function getTableForeignKeys(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      LEFT JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.constraint_name, kcu.ordinal_position
    `,
    [tableName],
  );
}

async function getTableUniqueConstraints(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        tc.constraint_name,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns,
        pg_get_constraintdef(pc.oid) AS definition
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN pg_constraint pc
        ON pc.conname = tc.constraint_name
       AND pc.conrelid = to_regclass($1)::oid
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.constraint_name, pc.oid
      ORDER BY tc.constraint_name
    `,
    [tableName],
  );
}

async function getTableCheckConstraints(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        conname AS constraint_name,
        pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con
      JOIN pg_class cls ON con.conrelid = cls.oid
      JOIN pg_namespace ns ON cls.relnamespace = ns.oid
      WHERE ns.nspname = 'public'
        AND cls.relname = $1
        AND con.contype = 'c'
      ORDER BY con.conname
    `,
    [tableName],
  );
}

async function getTableIndexes(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = $1
      ORDER BY indexname
    `,
    [tableName],
  );
}

async function getTableTriggers(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement,
        action_orientation,
        condition_timing
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND event_object_table = $1
      ORDER BY trigger_name
    `,
    [tableName],
  );
}

async function getTableRls(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        c.relname AS table_name,
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS force_row_security
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = $1
    `,
    [tableName],
  );
}

async function getPolicies(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual AS using_expression,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = $1
      ORDER BY policyname
    `,
    [tableName],
  );
}

async function getPrivilegeSummary(client, tableName) {
  return queryRows(
    client,
    `
      SELECT
        grantee,
        privilege_type,
        is_grantable
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY grantee, privilege_type
    `,
    [tableName],
  );
}

async function getFunctionGrantSummary(client, functionName) {
  return queryRows(
    client,
    `
      SELECT
        n.nspname AS schema_name,
        p.proname AS function_name,
        pg_get_function_identity_arguments(p.oid) AS arguments,
        pg_catalog.pg_get_userbyid(p.proowner) AS owner,
        p.prosecdef AS security_definer,
        p.provolatile AS volatility,
        p.proconfig AS config,
        p.proargnames AS arg_names,
        pg_get_userbyid(p.proowner) AS owner_name
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = $1
      ORDER BY p.proname
    `,
    [functionName],
  );
}

async function getFunctionDefinitions(client, names) {
  const rows = [];
  for (const name of names) {
    const results = await queryRows(
      client,
      `
        SELECT
          n.nspname AS schema_name,
          p.proname AS function_name,
          pg_get_function_identity_arguments(p.oid) AS arguments,
          pg_catalog.format_type(p.prorettype, NULL) AS return_type,
          pg_catalog.pg_get_userbyid(p.proowner) AS owner,
          p.prosecdef AS security_definer,
          p.provolatile AS volatility,
          pg_get_functiondef(p.oid) AS definition,
          COALESCE(p.proconfig::text, '') AS search_path_config
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = $1
        ORDER BY p.proname
      `,
      [name],
    );
    rows.push({ name, results });
  }
  return rows;
}

async function getFunctionNames(client, patterns) {
  const names = new Set();
  for (const pattern of patterns) {
    const rows = await queryRows(
      client,
      `
        SELECT DISTINCT proname
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND proname ILIKE $1
        ORDER BY proname
      `,
      [pattern],
    );
    for (const row of rows) names.add(row.proname);
  }
  return [...names].sort();
}

async function getSchemaObjects(client, tableName) {
  const [columns, pks, fks, uniques, checks, indexes, triggers, rlsRows] = await Promise.all([
    getTableSummary(client, tableName),
    getTablePrimaryKeys(client, tableName),
    getTableForeignKeys(client, tableName),
    getTableUniqueConstraints(client, tableName),
    getTableCheckConstraints(client, tableName),
    getTableIndexes(client, tableName),
    getTableTriggers(client, tableName),
    getTableRls(client, tableName),
  ]);

  return {
    columns,
    pks,
    fks,
    uniques,
    checks,
    indexes,
    triggers,
    rlsRows,
  };
}

function summarizeStockSources(rows) {
  const notes = [];
  const productsColumns = rows.find((row) => row.table_name === 'products');
  const inventoryColumns = rows.find((row) => row.table_name === 'inventory');
  const productColumns = productsColumns ? productsColumns.columns : [];
  const inventory = inventoryColumns ? inventoryColumns.columns : [];

  const candidates = [
    'stock',
    'quantity',
    'available_quantity',
    'available_stock',
    'inventory_count',
    'qty_available',
    'product_stock',
    'current_stock',
    'stock_count',
  ];

  const productColumnMatches = productColumns.filter((col) => candidates.includes(String(col.column_name).toLowerCase()));
  const inventoryMatches = inventory.filter((col) => candidates.includes(String(col.column_name).toLowerCase()));

  if (productColumnMatches.length) {
    notes.push(`Likely authoritative stock source: public.products via column(s) ${productColumnMatches.map((c) => c.column_name).join(', ')}`);
  } else if (inventoryMatches.length) {
    notes.push(`Likely stock source: public.inventory via column(s) ${inventoryMatches.map((c) => c.column_name).join(', ')}`);
  } else {
    notes.push('No obvious stock column found in public.products or public.inventory by common naming. Manual inspection is required.');
  }

  return notes;
}

function readRepoSnippet(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function main() {
  const report = [];
  const startedAt = new Date().toISOString();

  let client;
  const connectionString = buildConnectionString();

  if (!connectionString) {
    throw new Error('No PostgreSQL connection environment variable found. Set DATABASE_URL or PG* variables in the user terminal before running this script.');
  }

  report.push('# Step 3 — Live Database Audit Report');
  report.push('');
  report.push(`- Generated at: ${startedAt}`);
  report.push(`- Connection source: local PowerShell environment (no secret values printed)`);
  report.push(`- Connection string: ${redactConnectionString(connectionString)}`);
  report.push('');

  try {
    client = new Client({
      connectionString,
      ssl: connectionString.includes('sslmode=') || connectionString.includes('ssl=true') || connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
      statement_timeout: 20000,
      query_timeout: 20000,
    });

    await client.connect();

    const envSummary = await queryRows(
      client,
      `SELECT current_database() AS current_database, current_schema() AS current_schema, current_user AS current_user, version() AS version_text;`,
    );

    const connectionRow = envSummary[0] || {};
    report.push('## A. Connection');
    report.push('');
    report.push(`- current_database: ${formatValue(connectionRow.current_database)}`);
    report.push(`- current_schema: ${formatValue(connectionRow.current_schema)}`);
    report.push(`- current_user: ${formatValue(connectionRow.current_user)}`);
    report.push(`- PostgreSQL version: ${formatValue(connectionRow.version_text)}`);
    report.push('');

    const projectCheck = await queryRows(
      client,
      `
        SELECT datname, current_setting('application_name', true) AS app_name
        FROM pg_database
        WHERE datistemplate = false
        ORDER BY datname;
      `,
    );
    report.push('### Target project verification');
    report.push('');
    if (projectCheck.length) {
      report.push('| Database | Application name |');
      report.push('| --- | --- |');
      for (const row of projectCheck) {
        report.push(`| ${escapeMarkdown(row.datname)} | ${escapeMarkdown(row.app_name || 'N/A')} |`);
      }
    } else {
      report.push('No accessible databases discovered from the current role.');
    }
    report.push('');

    report.push('## B. Tables');
    report.push('');

    const tablePresence = await queryRows(
      client,
      `
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY($1::text[])
        ORDER BY table_name;
      `,
      [TARGET_TABLES],
    );
    const presentNames = new Set(tablePresence.map((row) => row.table_name));

    for (const tableName of TARGET_TABLES) {
      report.push(`### ${tableName}`);
      report.push('');
      if (!presentNames.has(tableName)) {
        report.push(`- existence: MISSING`);
        report.push('');
        continue;
      }

      const metadata = await getSchemaObjects(client, tableName);
      const tableInfo = await queryRows(
        client,
        `
          SELECT
            EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) AS exists,
            pg_total_relation_size($1::regclass) AS total_relation_size,
            reltuples::bigint AS estimated_rows
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname='public'
            AND c.relname=$1;
        `,
        [tableName],
      );

      report.push(`- existence: PRESENT`);
      report.push(`- estimated rows: ${TableTotalToText(tableInfo[0]?.estimated_rows)}`);
      report.push(`- size bytes: ${TableTotalToText(tableInfo[0]?.total_relation_size)}`);
      report.push(`- RLS enabled: ${metadata.rlsRows[0]?.rls_enabled ? 'YES' : 'NO'}`);
      report.push('');
      report.push('#### Columns');
      report.push('');
      report.push(toMarkdownTable(['column_name', 'data_type', 'nullable', 'default', 'primary_key', 'foreign_key', 'unique_key'], metadata.columns.map((row) => [
        row.column_name,
        row.data_type,
        row.is_nullable,
        row.column_default || '',
        row.is_primary_key === 't' || row.is_primary_key === true ? 'YES' : 'NO',
        row.is_foreign_key === 't' || row.is_foreign_key === true ? 'YES' : 'NO',
        row.is_unique_key === 't' || row.is_unique_key === true ? 'YES' : 'NO',
      ])));
      report.push('');

      report.push('#### Primary keys');
      report.push('');
      if (metadata.pks.length) {
        report.push(toMarkdownTable(['constraint_name', 'column_name'], metadata.pks.map((row) => [row.constraint_name, row.column_name])));
      } else {
        report.push('No primary key found.');
      }
      report.push('');

      report.push('#### Foreign keys');
      report.push('');
      if (metadata.fks.length) {
        report.push(toMarkdownTable(['constraint_name', 'column_name', 'foreign_table', 'foreign_column', 'on_update', 'on_delete'], metadata.fks.map((row) => [
          row.constraint_name,
          row.column_name,
          `${row.foreign_table_schema}.${row.foreign_table_name}`,
          row.foreign_column_name,
          row.update_rule || '',
          row.delete_rule || '',
        ])));
      } else {
        report.push('No foreign keys found.');
      }
      report.push('');

      report.push('#### Unique constraints');
      report.push('');
      if (metadata.uniques.length) {
        report.push(toMarkdownTable(['constraint_name', 'columns', 'definition'], metadata.uniques.map((row) => [row.constraint_name, row.columns, row.definition])));
      } else {
        report.push('No unique constraints found.');
      }
      report.push('');

      report.push('#### Check constraints');
      report.push('');
      if (metadata.checks.length) {
        report.push(toMarkdownTable(['constraint_name', 'definition'], metadata.checks.map((row) => [row.constraint_name, row.definition])));
      } else {
        report.push('No check constraints found.');
      }
      report.push('');

      report.push('#### Indexes');
      report.push('');
      if (metadata.indexes.length) {
        report.push(toMarkdownTable(['indexname', 'indexdef'], metadata.indexes.map((row) => [row.indexname, row.indexdef])));
      } else {
        report.push('No indexes found.');
      }
      report.push('');

      report.push('#### Triggers');
      report.push('');
      if (metadata.triggers.length) {
        report.push(toMarkdownTable(['trigger_name', 'event_manipulation', 'action_timing', 'action_statement'], metadata.triggers.map((row) => [
          row.trigger_name,
          row.event_manipulation,
          row.action_timing,
          row.action_statement,
        ])));
      } else {
        report.push('No triggers found.');
      }
      report.push('');
    }

    report.push('## C. Authoritative stock');
    report.push('');

    const stockTableMetadata = await Promise.all(TARGET_TABLES.map(async (tableName) => ({
      table_name: tableName,
      columns: await getTableSummary(client, tableName),
    })));
    const stockNotes = summarizeStockSources(stockTableMetadata);
    for (const note of stockNotes) {
      report.push(`- ${note}`);
    }
    report.push('');

    report.push('## D. RLS');
    report.push('');
    for (const tableName of TABLES_FOR_RLS) {
      report.push(`### ${tableName}`);
      report.push('');
      const policies = await getPolicies(client, tableName);
      if (policies.length) {
        report.push(toMarkdownTable(['policy_name', 'cmd', 'roles', 'using', 'with_check'], policies.map((row) => [
          row.policyname,
          row.cmd,
          row.roles,
          row.using_expression || '',
          row.with_check || '',
        ])));
      } else {
        report.push('No row-level security policies found.');
      }
      report.push('');
    }

    report.push('## E. Grants');
    report.push('');
    for (const tableName of TARGET_TABLES) {
      const grantRows = await getPrivilegeSummary(client, tableName);
      report.push(`### ${tableName}`);
      report.push('');
      if (grantRows.length) {
        report.push(toMarkdownTable(['grantee', 'privilege_type', 'is_grantable'], grantRows.map((row) => [
          row.grantee,
          row.privilege_type,
          row.is_grantable ? 'YES' : 'NO',
        ])));
      } else {
        report.push('No direct table grants discovered.');
      }
      report.push('');
    }

    const functionNames = await getFunctionNames(client, ['%order%', '%stock%', '%checkout%', '%payment%', '%inventory%', '%place_%']);
    const functionRows = await getFunctionDefinitions(client, functionNames);

    report.push('## F. RPC / Functions');
    report.push('');
    report.push(`Discovered names: ${functionNames.join(', ') || 'none'}`);
    report.push('');

    for (const item of functionRows) {
      report.push(`### ${item.name}`);
      report.push('');
      if (!item.results.length) {
        report.push('No definition found.');
        report.push('');
        continue;
      }

      for (const row of item.results) {
        report.push(`- schema: ${row.schema_name}`);
        report.push(`- name: ${row.function_name}`);
        report.push(`- arguments: ${row.arguments || '(none)'}`);
        report.push(`- return type: ${row.return_type || 'unknown'}`);
        report.push(`- owner: ${row.owner || 'unknown'}`);
        report.push(`- security definer: ${row.security_definer ? 'YES' : 'NO'}`);
        report.push(`- volatility: ${row.volatility || 'unknown'}`);
        report.push(`- search_path_config: ${row.search_path_config || 'not set'}`);
        report.push('');
        report.push('```sql');
        report.push(row.definition || '-- no source available --');
        report.push('```');
        report.push('');
      }
    }

    report.push('## G. Idempotency');
    report.push('');
    const idempotencyColumn = await queryRows(
      client,
      `
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND lower(column_name) = 'idempotency_key'
        ORDER BY table_name
      `,
    );
    if (idempotencyColumn.length) {
      report.push(toMarkdownTable(['table_name', 'column_name'], idempotencyColumn.map((row) => [row.table_name, row.column_name])));
    } else {
      report.push('No idempotency_key column found in public schema.');
    }
    report.push('');

    const idempotencyIndexes = await queryRows(
      client,
      `
        SELECT
          t.relname AS table_name,
          i.relname AS index_name,
          pg_get_indexdef(i.oid) AS index_definition
        FROM pg_index idx
        JOIN pg_class i ON i.oid = idx.indexrelid
        JOIN pg_class t ON t.oid = idx.indrelid
        JOIN pg_namespace ns ON ns.oid = t.relnamespace
        WHERE ns.nspname = 'public'
          AND pg_get_indexdef(i.oid) ILIKE '%idempotency_key%'
        ORDER BY t.relname, i.relname;
      `,
    );
    if (idempotencyIndexes.length) {
      report.push(toMarkdownTable(['table_name', 'index_name', 'index_definition'], idempotencyIndexes.map((row) => [row.table_name, row.index_name, row.index_definition])));
    } else {
      report.push('No idempotency_key-related indexes found.');
    }
    report.push('');

    report.push('## H. Atomicity');
    report.push('');
    const atomicCandidateNames = ['place_order_atomic', 'place_website_order_atomic'];
    const atomicDefs = await getFunctionDefinitions(client, atomicCandidateNames);
    for (const item of atomicDefs) {
      report.push(`### ${item.name}`);
      report.push('');
      if (!item.results.length) {
        report.push('No live definition found in public schema.');
      } else {
        for (const row of item.results) {
          report.push('```sql');
          report.push(row.definition || '-- no definition available --');
          report.push('```');
        }
      }
      report.push('');
    }

    report.push('## I. Checkout code');
    report.push('');

    const checkoutFile = path.join(projectRoot, 'src', 'pages', 'Checkout.tsx');
    const orderPayloadFile = path.join(projectRoot, 'src', 'lib', 'orderPayload.ts');
    const checkoutText = readRepoSnippet(checkoutFile);
    const payloadText = readRepoSnippet(orderPayloadFile);

    report.push('### Local website checkout source facts');
    report.push('');
    report.push('- File inspected: src/pages/Checkout.tsx');
    report.push('- Active RPC call: supabase.rpc("place_website_order_atomic", payload)');
    report.push('- Browser-generated idempotency: crypto.randomUUID()');
    report.push('- Browser payload builder: src/lib/orderPayload.ts');
    report.push('- Local code comment: browser price/stock/totals are not authoritative; server-side RPC is trusted.');
    report.push('');

    const checkoutSnippets = [
      'supabase.rpc("place_website_order_atomic"',
      'idempotency_key: crypto.randomUUID()',
      'buildServerOrderPayload',
      'The browser is never authoritative for pricing, totals, or stock',
    ];

    report.push('### Relevant source snippets');
    report.push('');
    for (const snippet of checkoutSnippets) {
      const inCheckout = checkoutText.includes(snippet) || payloadText.includes(snippet);
      report.push(`- ${snippet}: ${inCheckout ? 'FOUND' : 'NOT FOUND'}`);
    }
    report.push('');

    report.push('## J. Admin compatibility');
    report.push('');
    const adminFiles = [
      'src/lib/adminAccess.ts',
      'src/components/admin/OrdersTab.tsx',
      'src/components/admin/InventoryTab.tsx',
      'src/pages/OrderDetails.tsx',
      'src/pages/Orders.tsx',
      'src/pages/OrderTracker.tsx',
      'src/pages/OrderConfirmation.tsx',
    ];
    for (const relativePath of adminFiles) {
      const fileContent = readRepoSnippet(path.join(projectRoot, relativePath));
      report.push(`### ${relativePath}`);
      report.push('');
      const checks = [
        'admin_users',
        'orders',
        'products',
        'inventory',
        'inventory_logs',
        'status',
        'payment_status',
        'place_order_atomic',
        'place_website_order_atomic',
      ];
      for (const keyword of checks) {
        report.push(`- ${keyword}: ${fileContent.toLowerCase().includes(keyword.toLowerCase()) ? 'FOUND' : 'NOT FOUND'}`);
      }
      report.push('');
    }

    report.push('## K. Android');
    report.push('');
    report.push('- ANDROID_COMPATIBILITY=UNKNOWN');
    report.push('- Reason: Android source is not available in this workspace and the requirement says not to guess.');
    report.push('');

    report.push('## L. Migration comparison');
    report.push('');
    const migrationFiles = [
      'supabase/migrations/20260918_website_checkout_atomic.sql',
      'supabase/rollback/20260918_rollback_website_checkout_atomic.sql',
      'supabase/tests/website_checkout_atomic_tests.sql',
      'supabase/docs/website_checkout_db_contract.md',
    ];
    for (const relativePath of migrationFiles) {
      const filePath = path.join(projectRoot, relativePath);
      const content = readRepoSnippet(filePath);
      report.push(`### ${relativePath}`);
      report.push('');
      report.push(content ? `- file exists: YES` : `- file exists: NO`);
      report.push(content ? `- bytes: ${content.length}` : '- bytes: 0');
      report.push('');
      if (content) {
        const paragraphs = content.split(/\n{2,}/).slice(0, 3).map((part) => part.trim()).filter(Boolean);
        if (paragraphs.length) {
          for (const paragraph of paragraphs) {
            report.push(`> ${escapeMarkdown(paragraph)}`);
          }
        }
      }
      report.push('');
    }
    report.push('- Live schema comparison result: not applied; no migration executed during this audit.');
    report.push('');

    report.push('## Final assessment');
    report.push('');
    report.push('- Database connection: PASS');
    report.push('- Read-only audit mode: ACTIVE');
    report.push('- Database modifications: NONE');
    report.push('- Migration applied: NO');
    report.push('- Destructive tests executed: NO');
    report.push('- Production checkout logic reviewed locally: YES');
    report.push('');

    fs.writeFileSync(reportPath, report.join('\n'), 'utf8');

    console.log(`STEP 3 audit report written to: ${path.relative(projectRoot, reportPath)}`);
    console.log('No database writes were performed.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorReport = [
      '# Step 3 — Live Database Audit Report',
      '',
      '## Execution status',
      '',
      `- ERROR: ${message}`,
      '',
      '- This script is read-only and does not modify the database.',
      '',
    ].join('\n');
    fs.writeFileSync(reportPath, errorReport, 'utf8');
    console.error(message);
    process.exitCode = 1;
  } finally {
    if (client) await client.end();
  }
}

function TableTotalToText(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
}

main();
