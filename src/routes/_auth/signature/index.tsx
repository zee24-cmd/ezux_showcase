
import { createFileRoute } from '@tanstack/react-router'
import { EzSignatureDemo } from '../../../demos/signature/EzSignatureDemo'
import { DemoWrapper } from '@/components/DemoWrapper'
import { useEffect, useState } from 'react'
import { useI18n } from 'ezux'

export const Route = createFileRoute('/_auth/signature/')({
    component: SignaturePage,
})

function SignaturePage() {
    const [code, setCode] = useState('');
    const i18n = useI18n();

    useEffect(() => {
        // @ts-ignore
        import('../../../demos/signature/EzSignatureDemo?raw').then((m) => {
            setCode(m.default);
        });
    }, []);

    return (
        <DemoWrapper
            title={i18n.t('signature_title')}
            description={i18n.t('signature_demo_desc')}
            code={code}
            componentName="EzSignature"
        >
            <EzSignatureDemo />
        </DemoWrapper>
    );
}
