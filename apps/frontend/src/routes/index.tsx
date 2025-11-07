import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const queryClient = useQueryClient();
  const [showHello, setShowHello] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Hello API call
  const {
    data: helloData,
    isLoading: helloLoading,
    refetch: refetchHello,
  } = useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const response = await apiClient.api.hello.$get();
      return response.json();
    },
    enabled: false,
  });

  // Users API call
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.api.users.$get();
      return response.json();
    },
    enabled: false,
  });

  // Create user mutation
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🦫</div>
        <h1 className="text-5xl font-bold mb-2">bhvr</h1>
        <p className="text-xl mb-2">Bun + Hono + Vite + React</p>
        <p className="text-sm text-muted-foreground">
          A typesafe fullstack monorepo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Call Hello API */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hello World API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCallHello} className="w-full" disabled={helloLoading}>
              {helloLoading ? 'Loading...' : 'Call API'}
            </Button>
            {showHello && helloData && (
              <div className="p-4 bg-secondary rounded-md">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(helloData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fetch Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fetch Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCallUsers} className="w-full" disabled={usersLoading}>
              {usersLoading ? 'Loading...' : 'Call API'}
            </Button>
            {showUsers && usersData && (
              <div className="p-4 bg-secondary rounded-md max-h-64 overflow-auto">
                <pre className="text-xs">
                  {JSON.stringify(usersData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
              {createUserMutation.isSuccess && (
                <p className="text-sm text-center text-green-600">
                  ✓ User created!
                </p>
              )}
              {createUserMutation.isError && (
                <p className="text-sm text-center text-destructive">
                  Error creating user
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Type-safe fullstack • Cloudflare Workers + D1
        </p>
      </div>
    </div>
  );
}

