import { createFileRoute } from '@tanstack/react-router';
import { SignUpForm, EzLayout, useEzServiceRegistry, LayoutService } from 'ezux';

export const Route = createFileRoute('/auth/signup')({
    component: SignUpPage,
});

function SignUpPage() {
    const registry = useEzServiceRegistry();
    const layoutService = registry.getOrThrow<LayoutService>('LayoutService');

    return (
        <EzLayout
            authConfig={{
                signUpSlot: (
                    <SignUpForm
                        onSubmit={async () => {
                            layoutService.setMode('dashboard');
                            // Router will automatically redirect to /
                        }}
                    />
                ),
            }}
        />
    );
}
