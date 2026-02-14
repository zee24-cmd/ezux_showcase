import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2, ArrowRight, BookOpen, Layout, Terminal, Table, Trello, Calendar, GitBranch, PenTool } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';
import { globalServiceRegistry, I18nService } from 'ezux';

const ShowcaseHome = lazy(() => import('@/components/ShowcaseHome').then(m => ({ default: m.ShowcaseHome })));

export const Route = createFileRoute('/_auth/docs/ez-layout')({
  component: EzLayoutDocs,
});

function EzLayoutDocs() {
  const i18nService = globalServiceRegistry.getOrThrow<I18nService>('I18nService');
  const [homeCode, setHomeCode] = useState('');

  useEffect(() => {
    // @ts-ignore
    import('@/components/ShowcaseHome?raw').then((m) => {
      setHomeCode(m.default);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">
      {/* 1. Introduction */}
      <section id="introduction" className="space-y-8">
        <div className="flex items-center gap-3 text-primary mb-2">
          <Layout className="w-8 h-8" />
          <h1 className="text-4xl font-extrabold tracking-tight">{i18nService.t('docs_layout_intro_title')}</h1>
        </div>

        <div className="space-y-6">
          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl">
            {i18nService.t('docs_layout_intro_p1')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { title: 'EzLayout', desc: i18nService.t('comp_layout_desc'), icon: Layout, color: 'text-blue-500' },
              { title: 'EzTable', desc: i18nService.t('comp_table_desc'), icon: Table, color: 'text-emerald-500' },
              { title: 'EzKanban', desc: i18nService.t('comp_kanban_desc'), icon: Trello, color: 'text-cyan-500' },
              { title: 'EzScheduler', desc: i18nService.t('comp_scheduler_desc'), icon: Calendar, color: 'text-violet-500' },
              { title: 'EzTreeView', desc: i18nService.t('comp_tree_desc'), icon: GitBranch, color: 'text-amber-500' },
              { title: 'EzSignature', desc: i18nService.t('comp_signature_desc'), icon: PenTool, color: 'text-rose-500' },
            ].map((comp) => (
              <div key={comp.title} className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors group">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <comp.icon className={`w-6 h-6 ${comp.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors text-foreground">{comp.title}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{comp.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-4xl pt-4">
            {i18nService.t('docs_layout_intro_p2')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a href="#demo" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
            {i18nService.t('docs_layout_jump_demo')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* 2. Installation */}
      <section id="installation" className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{i18nService.t('docs_layout_install_title')}</h2>
        </div>
        <p className="text-muted-foreground">
          {i18nService.t('docs_layout_install_desc')}
        </p>
        <div className="bg-slate-950 rounded-xl p-6 relative group border border-white/5 shadow-2xl">
          <pre className="font-mono text-sm text-slate-300">
            <code>npm install ezux</code>
          </pre>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold mb-2">{i18nService.t('docs_layout_framework_support')}</h4>
            <p className="text-xs text-muted-foreground">{i18nService.t('docs_layout_framework_desc')}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold mb-2">{i18nService.t('docs_layout_styling')}</h4>
            <p className="text-xs text-muted-foreground">{i18nService.t('docs_layout_styling_desc')}</p>
          </div>
        </div>
      </section>

      {/* 3. Demo */}
      <section id="demo" className="space-y-6 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{i18nService.t('docs_layout_demo_title')}</h2>
        </div>
        <DemoWrapper
          title={i18nService.t('docs_layout_demo_wrapper_title')}
          description={i18nService.t('docs_layout_demo_wrapper_desc')}
          code={homeCode}
          componentName="EzLayout"
        >
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
            <div className="border rounded-xl overflow-y-auto bg-background h-[750px] shadow-inner">
              <ShowcaseHome showOnlyContent={true} />
            </div>
          </Suspense>
        </DemoWrapper>
      </section>
    </div>
  );
}
