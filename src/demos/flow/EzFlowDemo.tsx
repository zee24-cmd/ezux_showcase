import React, { useMemo, useRef, useState } from 'react';
import { type NodeProps } from '@xyflow/react';
import {
    ActionNode,
    ApprovalNode,
    EzWorkflow,
    DecisionNode,
    DelayNode,
    EndNode,
    GroupNode,
    LoopNode,
    RequestNode,
    StartNode,
    approvalWorkflowExample,
    apiRequestWorkflowExample,
    createLocalEzWorkflowService,
    humanReviewWorkflowExample,
    scheduledWorkflowExample,
    validateEzWorkflow,
    type EzFlowSerializedState,
    type EzWorkflowNodeRegistry,
    type EzWorkflowRef,
    type EzWorkflowValidationResult,
} from 'ezux/flow';
import { CheckCircle2, Download, Rocket, Save, TriangleAlert, X } from 'lucide-react';

type WorkflowKey = 'approval' | 'api' | 'review' | 'scheduled';

const workflows: Record<WorkflowKey, EzFlowSerializedState> = {
    approval: approvalWorkflowExample,
    api: apiRequestWorkflowExample,
    review: humanReviewWorkflowExample,
    scheduled: scheduledWorkflowExample,
};

const workflowLabels: Record<WorkflowKey, string> = {
    approval: 'Approval',
    api: 'API Request',
    review: 'Human Review',
    scheduled: 'Scheduled',
};

const createFlowNode = (NodeComponent: React.ComponentType<NodeProps>, onDelete: (nodeId: string) => void) => {
    const FlowNode = (props: NodeProps) => {
        const label = typeof props.data?.label === 'string' ? props.data.label : props.id;

        return (
            <div className="relative">
                <button
                    type="button"
                    aria-label={`Delete ${label}`}
                    onClickCapture={(event) => {
                        event.stopPropagation();
                        onDelete(props.id);
                    }}
                    onClick={(event) => event.stopPropagation()}
                    onMouseDownCapture={(event) => event.stopPropagation()}
                    onPointerDownCapture={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="nodrag nopan absolute -right-3 -top-3 z-50 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
                <NodeComponent {...props} />
            </div>
        );
    };

    return FlowNode;
};

const createFlowNodeRegistry = (onDelete: (nodeId: string) => void): EzWorkflowNodeRegistry => ({
    startNode: {
        type: 'startNode',
        label: 'Start',
        description: 'Workflow entry point',
        category: 'flow_control',
        component: createFlowNode(StartNode, onDelete) as any,
        defaultData: { label: 'Start' },
    },
    endNode: {
        type: 'endNode',
        label: 'End',
        description: 'Workflow completion',
        category: 'flow_control',
        component: createFlowNode(EndNode, onDelete) as any,
        defaultData: { label: 'End' },
    },
    decisionNode: {
        type: 'decisionNode',
        label: 'Decision',
        description: 'Branch by condition',
        category: 'logic',
        component: createFlowNode(DecisionNode, onDelete) as any,
        defaultData: { label: 'Decision', branches: [] },
        requiredDataKeys: ['branches'],
    },
    loopNode: {
        type: 'loopNode',
        label: 'Loop',
        description: 'Repeat a path',
        category: 'flow_control',
        component: createFlowNode(LoopNode, onDelete) as any,
        defaultData: { label: 'Loop', iteratorSource: '', maxIterations: 10 },
        requiredDataKeys: ['iteratorSource'],
    },
    actionNode: {
        type: 'actionNode',
        label: 'Action',
        description: 'Run an action',
        category: 'execution',
        component: createFlowNode(ActionNode, onDelete) as any,
        defaultData: { label: 'Action', actionType: '', config: {} },
        requiredDataKeys: ['actionType'],
    },
    requestNode: {
        type: 'requestNode',
        label: 'API Request',
        description: 'Call an HTTP endpoint',
        category: 'execution',
        component: createFlowNode(RequestNode, onDelete) as any,
        defaultData: { label: 'API Request', method: 'GET', url: '' },
        requiredDataKeys: ['url'],
    },
    delayNode: {
        type: 'delayNode',
        label: 'Delay',
        description: 'Pause execution',
        category: 'logic',
        component: createFlowNode(DelayNode, onDelete) as any,
        defaultData: { label: 'Delay', duration: 1, unit: 'hours' },
        requiredDataKeys: ['duration'],
    },
    approvalNode: {
        type: 'approvalNode',
        label: 'Approval',
        description: 'Wait for a person',
        category: 'human',
        component: createFlowNode(ApprovalNode, onDelete) as any,
        defaultData: { label: 'Approval', approverRole: '' },
        requiredDataKeys: ['approverRole'],
    },
    groupNode: {
        type: 'groupNode',
        label: 'Group',
        description: 'Organize nodes',
        category: 'structural',
        component: createFlowNode(GroupNode, onDelete) as any,
        defaultData: { label: 'Group', collapsed: false },
    },
});

const cloneWorkflow = (workflow: EzFlowSerializedState): EzFlowSerializedState => ({
    ...workflow,
    nodes: workflow.nodes.map(node => ({ ...node, data: { ...node.data } })),
    edges: workflow.edges.map(edge => ({ ...edge, data: edge.data ? { ...edge.data } : edge.data })),
    metadata: workflow.metadata ? { ...workflow.metadata } : undefined,
    viewport: workflow.viewport ? { ...workflow.viewport } : undefined,
});

export const EzFlowDemo = () => {
    const workflowRef = useRef<EzWorkflowRef>(null);
    const [workflowKey, setWorkflowKey] = useState<WorkflowKey>('approval');
    const [workflow, setWorkflow] = useState(() => cloneWorkflow(workflows.approval));
    const [validation, setValidation] = useState<EzWorkflowValidationResult>(() => validateEzWorkflow(workflows.approval));
    const [activity, setActivity] = useState('Ready');

    const service = useMemo(
        () => createLocalEzWorkflowService({
            approval: cloneWorkflow(workflows.approval),
            api: cloneWorkflow(workflows.api),
            review: cloneWorkflow(workflows.review),
            scheduled: cloneWorkflow(workflows.scheduled),
        }),
        [],
    );

    const handleWorkflowSelect = (key: WorkflowKey) => {
        const nextWorkflow = cloneWorkflow(workflows[key]);
        setWorkflowKey(key);
        setWorkflow(nextWorkflow);
        setValidation(validateEzWorkflow(nextWorkflow));
        setActivity(`${workflowLabels[key]} workflow loaded`);
    };

    const handleSave = async (nextWorkflow: EzFlowSerializedState) => {
        await service.saveWorkflow(workflowKey, nextWorkflow);
        setActivity('Draft saved locally');
    };

    const handlePublish = async (nextWorkflow: EzFlowSerializedState) => {
        await service.publishWorkflow(workflowKey, nextWorkflow);
        setActivity('Workflow published');
    };

    const handleExport = () => {
        const json = workflowRef.current?.exportJson();
        if (!json) return;

        navigator.clipboard.writeText(json);
        setActivity('Workflow JSON copied');
    };

    const handleQuickConnect = () => {
        const source = workflow.nodes.find(node => node.type !== 'endNode');
        const target = workflow.nodes.find(node =>
            node.id !== source?.id &&
            node.type !== 'startNode' &&
            !workflow.edges.some(edge => edge.source === source?.id && edge.target === node.id)
        );
        if (!source || !target) return;

        workflowRef.current?.connect(source.id, target.id);
        setActivity(`Connected ${source.data.label ?? source.id} to ${target.data.label ?? target.id}`);
    };

    const handleDeleteNode = (nodeId: string) => {
        setWorkflow(current => {
            const nextWorkflow = {
                ...current,
                nodes: current.nodes.filter(node => node.id !== nodeId),
                edges: current.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
            };
            setValidation(validateEzWorkflow(nextWorkflow));
            return nextWorkflow;
        });
        setActivity(`Deleted ${nodeId}`);
    };

    const flowNodeRegistry = useMemo(
        () => createFlowNodeRegistry(handleDeleteNode),
        [],
    );

    return (
        <div className="flex h-full min-h-[720px] flex-col bg-background">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/60 px-5 py-3">
                <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-widest text-primary/70">EzFlow Workflow Builder</div>
                    <div className="mt-1 truncate text-sm text-muted-foreground">
                        Drag nodes, connect branches, inspect validation, then save or publish through the local workflow service.
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {Object.keys(workflows).map(key => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleWorkflowSelect(key as WorkflowKey)}
                            className={`h-9 rounded-md border px-3 text-xs font-bold transition-colors ${workflowKey === key
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {workflowLabels[key as WorkflowKey]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-5 py-3">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 font-semibold text-foreground">
                        {validation.valid ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />}
                        {validation.valid ? 'Valid workflow' : `${validation.issues.length} validation issues`}
                    </span>
                    <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground">
                        {workflow.nodes.length} nodes
                    </span>
                    <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground">
                        {workflow.edges.length} edges
                    </span>
                    <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground">
                        {activity}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => workflowRef.current?.validate()}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-muted"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Validate
                    </button>
                    <button
                        type="button"
                        onClick={handleQuickConnect}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-muted"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Connect sample
                    </button>
                    <button
                        type="button"
                        onClick={() => workflowRef.current?.getWorkflow() && handleSave(workflowRef.current.getWorkflow())}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-muted"
                    >
                        <Save className="h-4 w-4" />
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => workflowRef.current?.getWorkflow() && handlePublish(workflowRef.current.getWorkflow())}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-muted"
                    >
                        <Rocket className="h-4 w-4" />
                        Publish
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="min-h-[520px] flex-1">
                <EzWorkflow
                    key={workflowKey}
                    ref={workflowRef}
                    workflowId={workflowKey}
                    workflow={workflow}
                    service={service}
                    nodeRegistry={flowNodeRegistry}
                    showHeader={false}
                    showToolbox
                    showInspector
                    showValidationPanel
                    showActionBar
                    showGrid
                    snapToGrid
                    fitView
                    autoValidate
                    exportFileName={`ezflow-${workflowKey}.json`}
                    onWorkflowChange={setWorkflow}
                    onConnectionCreate={({ sourceId, targetId }) => setActivity(`Connected ${sourceId} to ${targetId}`)}
                    onValidationChange={setValidation}
                    onSave={handleSave}
                    onPublish={handlePublish}
                    classNames={{
                        root: 'h-full min-h-[520px] border-0',
                        body: 'h-full min-h-[520px]',
                        canvas: 'h-full min-h-[520px] bg-background',
                    }}
                />
            </div>
        </div>
    );
};
