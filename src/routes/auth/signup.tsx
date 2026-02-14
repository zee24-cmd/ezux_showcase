import { createFileRoute } from '@tanstack/react-router';
import { SignUpForm, EzLayout, globalServiceRegistry, LayoutService } from 'ezux';

export const Route = createFileRoute('/auth/signup')({
    component: SignUpPage,
});

function SignUpPage() {
    const layoutService = globalServiceRegistry.getOrThrow<LayoutService>('LayoutService');

    return (
        <EzLayout
            serviceRegistry={globalServiceRegistry}
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
