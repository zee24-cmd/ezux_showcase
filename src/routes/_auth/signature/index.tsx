
import { createFileRoute } from '@tanstack/react-router'
import { DemoWrapper } from '@/components/DemoWrapper'
import { lazy, Suspense } from 'react'
import { useI18n } from '@/lib/ezux-compat'

const EzSignatureDemo = lazy(() => import('@/demos/signature/EzSignatureDemo').then(m => ({ default: m.EzSignatureDemo })));

export const Route = createFileRoute('/_auth/signature/')({
    component: SignaturePage,
})

function SignaturePage() {
    const i18n = useI18n();

    return (
        <DemoWrapper
            title={i18n.t('signature_title')}
            description={i18n.t('signature_demo_desc')}
            codeLoader={() => import('@/demos/signature/EzSignatureDemo?raw').then(m => m.default)}
            componentName="EzSignature"
        >
            <Suspense fallback={null}>
                <EzSignatureDemo />
            </Suspense>
        </DemoWrapper>
    );
}
