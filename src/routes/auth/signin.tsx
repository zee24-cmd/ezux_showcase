import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SignInForm, EzLayout, globalServiceRegistry, LayoutService } from 'ezux';

export const Route = createFileRoute('/auth/signin')({
    component: SignInPage,
});

function SignInPage() {
    const layoutService = globalServiceRegistry.getOrThrow<LayoutService>('LayoutService');
    const navigate = useNavigate();

    return (
        <EzLayout
            serviceRegistry={globalServiceRegistry}
            authConfig={{
                signInSlot: (
                    <div className="space-y-6">
                        <SignInForm
                            defaultValues={{
                                email: 'admin@example.com',
                                password: 'ux@793$ez'
                            }}
                            onSubmit={async () => {
                                layoutService.setMode('dashboard');
                                navigate({ to: '/' });
                            }}
                        />
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Demo Access</p>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Email: <code className="text-primary">admin@example.com</code></p>
                                <p className="text-sm font-medium">Password: <code className="text-primary">ux@793$ez</code></p>
                            </div>
                        </div>
                    </div>
                ),
            }}
        />
    );
}
