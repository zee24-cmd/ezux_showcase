import { useRef, useState, useEffect } from 'react';
import {
    EzSignature,
    EzSignatureRef,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Label,
    Input,
    useI18n
} from 'ezux';
import {
    Undo,
    Redo,
    Save,
    Download,
    Trash2
} from 'lucide-react';

export const EzSignatureDemo = () => {
    const i18n = useI18n();
    const [_, setTick] = useState(0);

    useEffect(() => {
        const unsub = i18n.subscribe(() => setTick(t => t + 1));
        return () => { unsub(); };
    }, [i18n]);

    const signatureRef = useRef<EzSignatureRef>(null);
    const [color, setColor] = useState('#000f55'); // Ink Blue
    const [width, setWidth] = useState(5); // Default 5px as requested
    const [savedSignature, setSavedSignature] = useState<string | null>(null);

    const handleClear = () => signatureRef.current?.clear();
    const handleUndo = () => signatureRef.current?.undo();
    const handleRedo = () => signatureRef.current?.redo();

    const handleSave = async () => {
        if (signatureRef.current) {
            const dataUrl = await signatureRef.current.save('png');
            setSavedSignature(dataUrl);
        }
    };

    const generateFilename = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        return `eSign_${timestamp}.png`;
    };

    const handleDownload = async () => {
        if (signatureRef.current) {
            const dataUrl = await signatureRef.current.save('png');
            triggerDownload(dataUrl);
        }
    };

    const triggerDownload = async (dataUrl: string) => {
        try {
            const filename = generateFilename();
            console.log('Downloading with filename:', filename);

            // Convert data URL to Blob
            const byteString = atob(dataUrl.split(',')[1]);
            const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });

            // Try File System Access API first (more reliable for filename handling)
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await (window as any).showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'PNG Image',
                            accept: { 'image/png': ['.png'] }
                        }]
                    });
                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    console.log('File saved using File System Access API');
                    return;
                } catch (err: any) {
                    // User cancelled or API not available, fall back to traditional method
                    if (err.name !== 'AbortError') {
                        console.warn('File System Access API failed, falling back:', err);
                    } else {
                        console.log('User cancelled save dialog');
                        return;
                    }
                }
            }

            // Fallback: Traditional download method
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.setAttribute('download', filename);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            console.log('File saved using traditional download method');
        } catch (e) {
            console.error("Download failed:", e);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto h-full overflow-y-auto">

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>{i18n.t('controls')}</CardTitle>
                        <CardDescription>{i18n.t('customize_stroke')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>{i18n.t('stroke_color')}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="signature-color"
                                    name="signature-color"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-10 h-10 p-1 cursor-pointer"
                                />
                                <span className="text-sm font-mono text-muted-foreground">{color}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{i18n.t('stroke_width')}: {width}px</Label>
                            <input
                                id="signature-width"
                                name="signature-width"
                                type="range"
                                min="5"
                                max="25"
                                step="1"
                                value={width}
                                onChange={(e) => setWidth(parseFloat(e.target.value))}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-secondary"
                            />
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            <Label>{i18n.t('actions')}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={handleUndo}>
                                    <Undo className="w-4 h-4 mr-2" /> {i18n.t('undo')}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleRedo}>
                                    <Redo className="w-4 h-4 mr-2" /> {i18n.t('redo')}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleClear} className="col-span-2">
                                    <Trash2 className="w-4 h-4 mr-2" /> {i18n.t('clear')}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            <Button className="w-full" onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" /> {i18n.t('capture')}
                            </Button>
                            <Button variant="secondary" className="w-full" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" /> {i18n.t('download_png')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Canvas */}
                <div className="space-y-6">
                    <Card className="overflow-hidden bg-white dark:bg-zinc-950 border-2 border-dashed shadow-sm">
                        <EzSignature
                            ref={signatureRef}
                            strokeColor={color}
                            maxStrokeWidth={width} // Variable width based on pressure
                            minStrokeWidth={width * 0.5}
                            height={400}
                            className="w-full cursor-crosshair"
                            backgroundColor="transparent"
                        />
                    </Card>

                    {savedSignature && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{i18n.t('captured_output')}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => triggerDownload(savedSignature)}>
                                    <Download className="w-4 h-4 mr-2" /> {i18n.t('download')}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="p-4 border rounded-lg bg-checkered">
                                    <img src={savedSignature} alt="Saved Signature" className="max-w-full h-auto" />
                                </div>
                                <p className="text-xs text-muted-foreground bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded text-center">
                                    ⚠️ <strong>Note:</strong> Right-clicking to 'Save Image' may result in a random filename.
                                    Please use the <strong>Download</strong> button above to save with the correct timestamp.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
