import { useEffect, useState } from 'react';
import { Copy, Download, Upload } from 'lucide-react';
import { exportSnapshot, importSnapshot, quietly } from '../../progress/db';
import {
  decodeProgressCode,
  encodeProgressCode,
  mergeProgress,
  ProgressCodeError,
} from '../../progress/share-code';
import { vi } from '../../shared/i18n/vi';
import { DeleteDataPanel } from './DeleteDataPanel';
import { buttonClasses } from '../../shared/ui/button-classes';

type ImportState = { kind: 'idle' } | { kind: 'done' } | { kind: 'error'; message: string };

/**
 * Xuất/nhập mã tiến độ. Mọi thứ chạy trong máy: mã do trẻ tự sao chép, không
 * có request nào gửi tiến độ đi đâu (docs/privacy.md).
 */
export function ProgressCodePage() {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState('');
  const [importState, setImportState] = useState<ImportState>({ kind: 'idle' });

  useEffect(() => {
    let active = true;
    void quietly(() => exportSnapshot()).then(async (snapshot) => {
      if (!active || !snapshot) return;
      if (snapshot.exercises.length === 0 && snapshot.lessons.length === 0) return;
      setCode(await encodeProgressCode(snapshot));
    });
    return () => {
      active = false;
    };
  }, [importState]);

  async function copy() {
    await navigator.clipboard.writeText(code).catch(() => undefined);
    setCopied(true);
  }

  async function runImport() {
    setImportState({ kind: 'idle' });
    try {
      const incoming = await decodeProgressCode(pasted);
      const local = (await quietly(() => exportSnapshot())) ?? {
        schemaVersion: incoming.schemaVersion,
        profile: incoming.profile,
        lessons: [],
        exercises: [],
      };
      await importSnapshot(mergeProgress(local, incoming));
      setPasted('');
      setImportState({ kind: 'done' });
    } catch (error) {
      const tooNew = error instanceof ProgressCodeError && error.code === 'phien-ban-moi-hon';
      setImportState({
        kind: 'error',
        message: tooNew ? vi.progressCode.importTooNew : vi.progressCode.importBadCode,
      });
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{vi.progressCode.title}</h1>
        <p className="mt-2 text-ink-soft">{vi.progressCode.lead}</p>
        <p className="mt-1 text-sm text-ink-soft">{vi.progressCode.privacyNote}</p>
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Download aria-hidden="true" className="size-5" />
          {vi.progressCode.yourCode}
        </h2>
        {code === '' ? (
          <p className="mt-2 text-ink-soft" data-testid="no-code">
            {vi.progressCode.nothingYet}
          </p>
        ) : (
          <>
            <textarea
              readOnly
              aria-label={vi.progressCode.yourCode}
              data-testid="progress-code"
              value={code}
              rows={3}
              className="mt-2 block w-full rounded-xl border border-line p-3 font-mono text-sm break-all"
            />
            <button
              type="button"
              onClick={() => void copy()}
              className={buttonClasses('outline', 'md', 'mt-2')}
            >
              <Copy aria-hidden="true" className="size-4" />
              {copied ? vi.progressCode.copied : vi.progressCode.copy}
            </button>
          </>
        )}
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Upload aria-hidden="true" className="size-5" />
          {vi.progressCode.importTitle}
        </h2>
        <p className="mt-1 text-ink-soft">{vi.progressCode.importLead}</p>
        <textarea
          aria-label={vi.progressCode.importLabel}
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          rows={3}
          className="mt-2 block w-full rounded-xl border border-line p-3 font-mono text-sm break-all"
        />
        <button
          type="button"
          onClick={() => void runImport()}
          disabled={pasted.trim() === ''}
          className={buttonClasses('primary', 'md', 'mt-2')}
        >
          {vi.progressCode.importButton}
        </button>

        {importState.kind === 'done' && (
          <p role="status" data-testid="import-done" className="mt-3 font-medium text-success">
            {vi.progressCode.importDone}
          </p>
        )}
        {importState.kind === 'error' && (
          <p role="alert" data-testid="import-error" className="mt-3 font-medium text-attention">
            {importState.message}
          </p>
        )}
      </div>
      <DeleteDataPanel onDeleted={() => setCode('')} />
    </section>
  );
}
