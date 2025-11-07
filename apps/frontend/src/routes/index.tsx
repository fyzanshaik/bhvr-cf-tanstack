/**
 * ============================================================================
 * DEMO PAGE - SAFE TO DELETE
 * ============================================================================
 * This entire file (index.tsx) is just a demo. When you're ready to build
 * your own app, you can safely delete the DemoPage component below and
 * replace it with your own component. This is your main root route (/).
 * ============================================================================
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/')({
	component: DemoPage,
});

function DemoPage() {
	const queryClient = useQueryClient();
	const [showHello, setShowHello] = useState(false);
	const [showUsers, setShowUsers] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');

	const {
		data: helloData,
		isLoading: helloLoading,
		error: helloError,
		refetch: refetchHello,
	} = useQuery({
		queryKey: ['hello'],
		queryFn: async () => {
			const response = await apiClient.api.hello.$get();
			return response.json();
		},
		enabled: false,
	});

	const {
		data: usersData,
		isLoading: usersLoading,
		error: usersError,
		refetch: refetchUsers,
	} = useQuery({
		queryKey: ['users'],
		queryFn: async () => {
			const response = await apiClient.api.users.$get();
			return response.json();
		},
		enabled: false,
	});

	const createUserMutation = useMutation({
		mutationFn: async (userData: { name: string; email: string }) => {
			const response = await apiClient.api.users.$post({ json: userData });
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			setName('');
			setEmail('');
			if (showUsers) {
				refetchUsers();
			}
		},
	});

	const handleCallHello = () => {
		setShowHello(true);
		refetchHello();
	};

	const handleCallUsers = () => {
		setShowUsers(true);
		refetchUsers();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name && email) {
			createUserMutation.mutate({ name, email });
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			<div className="relative overflow-hidden text-white py-16">
				<div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
				<div className="relative max-w-6xl mx-auto px-8 text-center">
					<div className="inline-block text-6xl mb-5 animate-bounce-slow">🦫</div>
					<h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
						bhvr
					</h1>
					<p className="text-2xl md:text-3xl font-semibold mb-3 text-slate-300">
						Bun + Hono + Vite + React
					</p>
					<p className="text-base text-slate-400 max-w-2xl mx-auto mb-8">
						Production-ready, type-safe fullstack monorepo for Cloudflare's edge
					</p>
					<div className="flex flex-wrap gap-3 justify-center">
						<span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
							⚡ Edge-First
						</span>
						<span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
							🔒 Type-Safe
						</span>
						<span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
							🚀 Fast
						</span>
						<span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
							📦 Monorepo
						</span>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-8 -mt-12 relative z-10">
				<div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 mb-16">
					<div className="text-center mb-8">
						<h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">API Demo</h2>
						<p className="text-slate-600 text-base">Test the type-safe API integration</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="group">
							<Card className="h-full border-2 border-slate-200 hover:border-slate-900 transition-all duration-300 hover:shadow-lg">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between mb-2">
										<CardTitle className="text-lg font-bold text-slate-900">Hello World</CardTitle>
										<span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
											GET
										</span>
									</div>
									<p className="text-sm text-slate-600">Test API connectivity</p>
								</CardHeader>
								<CardContent className="space-y-4">
									<Button
										onClick={handleCallHello}
										className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-5 text-base transition-all duration-200 shadow-md hover:shadow-lg"
										disabled={helloLoading}
									>
										{helloLoading ? (
											<span className="flex items-center gap-2">
												<span className="animate-spin">⏳</span> Loading...
											</span>
										) : (
											<span className="flex items-center gap-2">
												<span>📡</span> Call API
											</span>
										)}
									</Button>
									{showHello && helloError && (
										<div className="p-4 bg-red-50 rounded-lg border-2 border-red-200 animate-fade-in">
											<div className="flex items-center gap-2 mb-2">
												<span className="text-lg">⚠️</span>
												<span className="text-sm font-bold text-red-700">
													API Connection Failed
												</span>
											</div>
											<p className="text-xs text-red-600 mb-2">
												Unable to connect to the backend API.
											</p>
											<div className="p-2 bg-red-100 rounded text-xs text-red-700 font-mono">
												<p className="font-semibold mb-1">💡 Make sure:</p>
												<p>
													• Backend is running:{' '}
													<code className="bg-red-200 px-1 rounded">bun dev</code>
												</p>
												<p>
													• API is accessible at:{' '}
													<code className="bg-red-200 px-1 rounded">http://localhost:8787</code>
												</p>
											</div>
										</div>
									)}
									{showHello && helloData && !helloError && (
										<div className="p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
											<div className="flex items-center gap-2 mb-2">
												<span className="text-sm font-semibold text-slate-700">Response:</span>
												<span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
													200 OK
												</span>
											</div>
											<pre className="text-xs overflow-auto text-slate-800 font-mono">
												{JSON.stringify(helloData, null, 2)}
											</pre>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div className="group">
							<Card className="h-full border-2 border-slate-200 hover:border-slate-900 transition-all duration-300 hover:shadow-lg">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between mb-2">
										<CardTitle className="text-lg font-bold text-slate-900">Fetch Users</CardTitle>
										<span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
											GET
										</span>
									</div>
									<p className="text-sm text-slate-600">Retrieve all users from D1</p>
								</CardHeader>
								<CardContent className="space-y-4">
									<Button
										onClick={handleCallUsers}
										className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-5 text-base transition-all duration-200 shadow-md hover:shadow-lg"
										disabled={usersLoading}
									>
										{usersLoading ? (
											<span className="flex items-center gap-2">
												<span className="animate-spin">⏳</span> Loading...
											</span>
										) : (
											<span className="flex items-center gap-2">
												<span>👥</span> Get Users
											</span>
										)}
									</Button>
									{showUsers && usersError && (
										<div className="p-4 bg-red-50 rounded-lg border-2 border-red-200 animate-fade-in">
											<div className="flex items-center gap-2 mb-2">
												<span className="text-lg">⚠️</span>
												<span className="text-sm font-bold text-red-700">
													Database Connection Failed
												</span>
											</div>
											<p className="text-xs text-red-600 mb-2">
												Unable to fetch users from the database.
											</p>
											<div className="p-2 bg-red-100 rounded text-xs text-red-700 font-mono">
												<p className="font-semibold mb-1">💡 Make sure:</p>
												<p>
													• Database is set up:{' '}
													<code className="bg-red-200 px-1 rounded">bun run setup</code>
												</p>
												<p>
													• Migrations applied:{' '}
													<code className="bg-red-200 px-1 rounded">bun run db:migrate</code>
												</p>
												<p>• Check D1 database connection</p>
											</div>
										</div>
									)}
									{showUsers &&
										usersData &&
										!usersError &&
										usersData.data &&
										usersData.data.length === 0 && (
											<div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 animate-fade-in">
												<div className="flex items-center gap-2 mb-2">
													<span className="text-lg">📭</span>
													<span className="text-sm font-bold text-yellow-700">No Users Found</span>
												</div>
												<p className="text-xs text-yellow-600 mb-2">
													The database is connected but no users exist yet.
												</p>
												<div className="p-2 bg-yellow-100 rounded text-xs text-yellow-700 font-mono">
													<p className="font-semibold mb-1">💡 Try:</p>
													<p>
														• Run seed script:{' '}
														<code className="bg-yellow-200 px-1 rounded">bun run db:seed</code>
													</p>
													<p>• Or create a user using the form →</p>
												</div>
											</div>
										)}
									{showUsers &&
										usersData &&
										!usersError &&
										usersData.data &&
										usersData.data.length > 0 && (
											<div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-64 overflow-auto animate-fade-in">
												<div className="flex items-center gap-2 mb-2">
													<span className="text-sm font-semibold text-slate-700">Response:</span>
													<span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
														{usersData.data?.length || 0} users
													</span>
												</div>
												<pre className="text-xs text-slate-800 font-mono">
													{JSON.stringify(usersData, null, 2)}
												</pre>
											</div>
										)}
								</CardContent>
							</Card>
						</div>

						<div className="group">
							<Card className="h-full border-2 border-slate-200 hover:border-slate-900 transition-all duration-300 hover:shadow-lg">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between mb-2">
										<CardTitle className="text-lg font-bold text-slate-900">Create User</CardTitle>
										<span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
											POST
										</span>
									</div>
									<p className="text-sm text-slate-600">Add new user with validation</p>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name" className="text-sm font-semibold text-slate-700">
												Name
											</Label>
											<Input
												id="name"
												placeholder="John Doe"
												value={name}
												onChange={(e) => setName(e.target.value)}
												required
												className="h-10"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email" className="text-sm font-semibold text-slate-700">
												Email
											</Label>
											<Input
												id="email"
												type="email"
												placeholder="john@example.com"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
												className="h-10"
											/>
										</div>
										<Button
											type="submit"
											className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-5 text-base transition-all duration-200 shadow-md hover:shadow-lg"
											disabled={createUserMutation.isPending}
										>
											{createUserMutation.isPending ? (
												<span className="flex items-center gap-2">
													<span className="animate-spin">⏳</span> Creating...
												</span>
											) : (
												<span className="flex items-center gap-2">
													<span>✨</span> Create User
												</span>
											)}
										</Button>
										{createUserMutation.isSuccess && (
											<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center animate-fade-in">
												<p className="text-sm font-semibold text-green-700">
													✓ User created successfully!
												</p>
											</div>
										)}
										{createUserMutation.isError && (
											<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center animate-fade-in">
												<p className="text-sm font-semibold text-red-700">✗ Error creating user</p>
											</div>
										)}
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-8 py-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
						Tech Stack Architecture
					</h2>
					<p className="text-slate-300 text-base">Full-stack type safety from database to UI</p>
				</div>

				<div className="space-y-6">
					<Card className="border-2 border-slate-700 bg-slate-800/50">
						<CardContent className="p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-blue-600 rounded-lg">
									<span className="text-2xl">🎨</span>
								</div>
								<div>
									<h3 className="text-xl font-bold text-white">Frontend</h3>
									<p className="text-sm text-slate-400">User interface & styling</p>
								</div>
							</div>
							<div className="flex items-center gap-3 flex-wrap">
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									React 18
								</div>
								<span className="text-slate-400 text-xl">→</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									Vite
								</div>
								<span className="text-slate-400 text-xl">→</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									Tailwind v4
								</div>
								<span className="text-slate-400 text-xl">+</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									Shadcn UI
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-2 border-slate-700 bg-slate-800/50">
						<CardContent className="p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-green-600 rounded-lg">
									<span className="text-2xl">🔄</span>
								</div>
								<div>
									<h3 className="text-xl font-bold text-white">State Management</h3>
									<p className="text-sm text-slate-400">Client & server state</p>
								</div>
							</div>
							<div className="flex items-center gap-3 flex-wrap">
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									TanStack Router
								</div>
								<span className="text-slate-400 text-xl">+</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									TanStack Query
								</div>
								<span className="text-slate-400 text-xl">+</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									Zustand
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-2 border-purple-500/50 bg-gradient-to-r from-purple-900/30 to-purple-800/30 shadow-xl">
						<CardContent className="p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-purple-600 rounded-lg">
									<span className="text-2xl">⚡</span>
								</div>
								<div>
									<h3 className="text-xl font-bold text-white">Type-Safe API Layer</h3>
									<p className="text-sm text-purple-300 font-semibold">End-to-end type safety ✨</p>
								</div>
							</div>
							<div className="flex items-center justify-center gap-4 flex-wrap">
								<div className="px-5 py-3 bg-white/20 text-white rounded-lg font-semibold border-2 border-white/30">
									Frontend
								</div>
								<span className="text-2xl font-bold text-purple-300">↔</span>
								<div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold shadow-lg border-2 border-purple-400">
									Hono RPC
								</div>
								<span className="text-2xl font-bold text-purple-300">↔</span>
								<div className="px-5 py-3 bg-white/20 text-white rounded-lg font-semibold border-2 border-white/30">
									Backend
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-2 border-slate-700 bg-slate-800/50">
						<CardContent className="p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-orange-600 rounded-lg">
									<span className="text-2xl">⚙️</span>
								</div>
								<div>
									<h3 className="text-xl font-bold text-white">Backend & Database</h3>
									<p className="text-sm text-slate-400">Server logic & data layer</p>
								</div>
							</div>
							<div className="flex items-center gap-3 flex-wrap">
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									CF Workers
								</div>
								<span className="text-slate-400 text-xl">→</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									Hono
								</div>
								<span className="text-slate-400 text-xl">→</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									Drizzle ORM
								</div>
								<span className="text-slate-400 text-xl">→</span>
								<div className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm border border-white/20">
									D1 / PostgreSQL
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="border-2 border-slate-700 bg-slate-800/50">
							<CardContent className="p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="p-2 bg-amber-600 rounded-lg">
										<span className="text-2xl">🛠️</span>
									</div>
									<div>
										<h3 className="text-lg font-bold text-white">Tooling</h3>
										<p className="text-xs text-slate-400">Type safety & validation</p>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-white font-medium text-sm">TypeScript</span>
										<span className="text-slate-400 text-xs">Compile-time types</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-white font-medium text-sm">Zod</span>
										<span className="text-slate-400 text-xs">Runtime validation</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-white font-medium text-sm">Bun + Turborepo</span>
										<span className="text-slate-400 text-xs">Fast builds</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-2 border-slate-700 bg-slate-800/50">
							<CardContent className="p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="p-2 bg-emerald-600 rounded-lg">
										<span className="text-2xl">🚀</span>
									</div>
									<div>
										<h3 className="text-lg font-bold text-white">Deployment</h3>
										<p className="text-xs text-slate-400">Global edge network</p>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-white font-medium text-sm">CF Pages</span>
										<span className="text-slate-400 text-xs">Frontend hosting</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-white font-medium text-sm">CF Workers</span>
										<span className="text-slate-400 text-xs">Backend runtime</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-white font-medium text-sm">D1 Database</span>
										<span className="text-slate-400 text-xs">Edge SQL</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
