#!/usr/bin/env bun

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';
import { $ } from 'bun';

const RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';

function log(message: string) {
	console.log(`${BRIGHT}${message}${RESET}`);
}

function success(message: string) {
	console.log(`${GREEN}✓${RESET} ${message}`);
}

function info(message: string) {
	console.log(`${BLUE}ℹ${RESET} ${message}`);
}

function warning(message: string) {
	console.log(`${YELLOW}⚠${RESET} ${message}`);
}

function error(message: string) {
	console.log(`${RED}✗${RESET} ${message}`);
}

function code(message: string) {
	console.log(`${CYAN}${message}${RESET}`);
}

function question(query: string): Promise<string> {
	const rl = readline.createInterface({
		input: stdin,
		output: stdout,
	});

	return new Promise((resolve) => {
		rl.question(query, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

async function checkBun() {
	log('\n📦 Checking Bun installation...');
	try {
		const version = await $`bun --version`.text();
		success(`Bun ${version.trim()} is installed`);
		return true;
	} catch {
		error('Bun is not installed');
		info('Install from: https://bun.sh');
		return false;
	}
}

async function checkWranglerAuth() {
	log('\n🔐 Checking Cloudflare authentication...');
	try {
		await $`bunx wrangler whoami`.quiet();
		success('You are logged in to Cloudflare');
		return true;
	} catch (err: unknown) {
		const errorOutput = err instanceof Error ? err.message : String(err);
		const errorText = errorOutput.toLowerCase();

		if (
			errorText.includes('authentication') ||
			errorText.includes('login') ||
			errorText.includes('expired') ||
			errorText.includes('token')
		) {
			warning('Cloudflare authentication failed');
			info('Your Cloudflare session may have expired or you are not logged in.');
			console.log('\nPlease run:');
			code('  bunx wrangler login');
			console.log('\nThis will open your browser to authenticate with Cloudflare.\n');
		} else {
			warning('Unable to verify Cloudflare authentication');
			info('Please run: bunx wrangler login');
		}
		return false;
	}
}

async function promptDatabaseName(): Promise<string> {
	const defaultName = 'bhvr-db';
	console.log('\n');
	info(`Enter a name for your D1 database (default: ${defaultName})`);
	const name = await question(`Database name [${defaultName}]: `);
	return name || defaultName;
}

function showManualSetupInstructions(dbName: string, output: string) {
	console.log('\n');
	warning('Could not automatically extract database_id from output');
	console.log('\n');
	info('Full command output:');
	console.log('─'.repeat(60));
	console.log(output);
	console.log('─'.repeat(60));
	console.log('\n');
	info('Manual setup instructions:');
	console.log('\n1. Find the database_id in the output above');
	console.log('   Look for a line like: database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"');
	console.log('\n2. Open the file: apps/backend/wrangler.toml');
	console.log('\n3. Find the production database configuration:');
	code('   [[env.production.d1_databases]]');
	code('   binding = "DB"');
	code('   database_name = "cloudflare-d1-db"');
	code('   database_id = "YOUR_DATABASE_ID_HERE"');
	console.log('\n4. Replace YOUR_DATABASE_ID_HERE with the database_id from step 1');
	console.log('\n5. Also update the database_name if you used a different name:');
	code(`   database_name = "${dbName}"`);
	console.log('\n6. For local development, the database_id should be "local-db"');
	console.log('   (This is already configured correctly)');
	console.log('\n7. After updating wrangler.toml, run:');
	code('   cd apps/backend && bun run db:migrate');
	console.log('\n8. To verify your databases, run:');
	code('   bunx wrangler d1 list');
	console.log('\n9. To see details of a specific database:');
	code(`   bunx wrangler d1 info ${dbName}`);
	console.log('\n');
}

async function createD1Database() {
	log('\n🗄️  Creating D1 Database...');
	info('This will create a new D1 database in your Cloudflare account');
	info('The database will be used for production deployments');
	console.log('\n');

	const dbName = await promptDatabaseName();
	info(`Creating database: ${dbName}`);

	try {
		const output = await $`bunx wrangler d1 create ${dbName}`.text();

		const match = output.match(/database_id\s*=\s*"([^"]+)"/);
		if (match?.[1]) {
			const databaseId = match[1];
			success(`Created database: ${dbName}`);
			info(`Database ID: ${databaseId}`);
			return { databaseId, dbName };
		}

		showManualSetupInstructions(dbName, output);
		return null;
	} catch (err: unknown) {
		let errorOutput = '';
		if (err instanceof Error) {
			errorOutput = err.message;
			if (err.stack) {
				errorOutput += `\n${err.stack}`;
			}
		} else {
			errorOutput = String(err);
		}

		const errorText = errorOutput.toLowerCase();

		if (errorText.includes('already exists') || errorText.includes('duplicate')) {
			warning(`Database "${dbName}" already exists`);
			info('You can use the existing database or create a new one with a different name');
			console.log('\nTo list all your databases:');
			code('  bunx wrangler d1 list');
			console.log('\nTo see details of this database:');
			code(`  bunx wrangler d1 info ${dbName}`);
			console.log('\nTo get the database_id, run:');
			code(`  bunx wrangler d1 info ${dbName}`);
			console.log('\nThen follow the manual setup instructions below.\n');
			showManualSetupInstructions(dbName, '');
			return null;
		}

		error('Failed to create database');
		console.error(err);
		showManualSetupInstructions(dbName, errorOutput);
		return null;
	}
}

async function updateWranglerToml(databaseId: string, dbName: string) {
	log('\n📝 Updating wrangler.toml...');

	const wranglerPath = join(process.cwd(), 'apps', 'backend', 'wrangler.toml');

	try {
		let content = await readFile(wranglerPath, 'utf-8');

		content = content.replace(
			/(\[env\.production\.d1_databases\][\s\S]*?database_id\s*=\s*)"[^"]*"/,
			`$1"${databaseId}"`
		);

		content = content.replace(
			/(\[env\.production\.d1_databases\][\s\S]*?database_name\s*=\s*)"[^"]*"/,
			`$1"${dbName}"`
		);

		await writeFile(wranglerPath, content);
		success('Updated wrangler.toml with production database_id and database_name');
		return true;
	} catch (err) {
		error('Failed to update wrangler.toml');
		console.error(err);
		return false;
	}
}

async function applyMigrations() {
	log('\n🔨 Applying database migrations...');

	try {
		info('Applying to local database...');
		await $`cd apps/backend && bun run db:migrate`;
		success('Local migrations applied');

		return true;
	} catch (err) {
		error('Failed to apply migrations');
		console.error(err);
		return false;
	}
}

async function seedData() {
	log('\n🌱 Seeding demo data...');

	try {
		await $`cd apps/backend && bunx wrangler d1 execute cloudflare-d1-db --local --command "INSERT INTO users (name, email) VALUES ('Alice Johnson', 'alice@example.com'), ('Bob Smith', 'bob@example.com'), ('Charlie Davis', 'charlie@example.com')"`;
		success('Demo data seeded');
		return true;
	} catch (err) {
		warning('Failed to seed data (might already exist)');
		return true;
	}
}

async function main() {
	console.clear();
	log('🦫 bhvr - Cloudflare Fullstack Setup');
	log('=====================================\n');

	info('This script will help you set up your development environment');
	info('and production Cloudflare resources.\n');

	const hasBun = await checkBun();
	if (!hasBun) {
		process.exit(1);
	}

	const isAuthenticated = await checkWranglerAuth();
	if (!isAuthenticated) {
		process.exit(1);
	}

	const dbResult = await createD1Database();
	if (!dbResult) {
		info('\nYou can continue setup manually by following the instructions above.');
		info('Or run this script again after creating the database manually.\n');
		process.exit(1);
	}

	const { databaseId, dbName } = dbResult;

	const updated = await updateWranglerToml(databaseId, dbName);
	if (!updated) {
		process.exit(1);
	}

	const migrated = await applyMigrations();
	if (!migrated) {
		process.exit(1);
	}

	await seedData();

	log('\n✨ Setup Complete!\n');
	success('Your environment is ready for development\n');

	info('Next steps:');
	console.log('  1. Run: bun dev');
	console.log('  2. Open: http://localhost:5173');
	console.log('  3. Start coding!\n');

	info('To deploy to production:');
	console.log('  cd apps/backend && bun run deploy\n');

	info('Useful commands:');
	console.log('  bunx wrangler d1 list              - List all databases');
	console.log(`  bunx wrangler d1 info ${dbName}     - See database details`);
	console.log('  cd apps/backend && bun run db:migrate:prod  - Apply migrations to production\n');
}

main().catch((err) => {
	error('\nSetup failed');
	console.error(err);
	process.exit(1);
});
