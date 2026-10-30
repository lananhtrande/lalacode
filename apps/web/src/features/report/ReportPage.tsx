import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Award, CalendarCheck, CheckCircle2, Flame, Link2, RefreshCw } from 'lucide-react';
import { loadContentIndex } from '../../content/loader';
import type { ContentIndex } from '../../content/types';
import { exportSnapshot, quietly } from '../../progress/db';
import {
  decodeProgressCode,
  encodeProgressCode,
  type SharedProgress,
} from '../../progress/share-code';
import { formatDayVi, summarizeProgress, type ProgressReport } from '../../progress/report';
import { dayKey } from '../../progress/streak';
import { vi } from '../../shared/i18n/vi';
import { buttonClasses } from '../../shared/ui/button-classes';

type State = { kind: 'no-link' } | { kind: 'bad-link' } | { kind: 'ready'; report: ProgressReport };

/**
 * Trang báo cáo cho bố mẹ. Số liệu nằm **sau dấu `#`** của đường link, nên
 * trình duyệt không gửi nó lên máy chủ (docs/architecture.md §3).
 */
export function ReportPage() {
  const { hash } = useLocation();
  const [state, setState] = useState<State>({ kind: 'no-link' });
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    let active = true;
    const code = hash.startsWith('#') ? hash.slice(1) : hash;

    async function read() {
      // Thiếu mục lục (mạng lỗi) thì vẫn báo cáo được, chỉ là không có tên bài.
      const index: ContentIndex | null = await loadContentIndex().catch(() => null);
      if (code === '') {
        if (active) setState({ kind: 'no-link' });
        return;
      }
      try {
        const progress: SharedProgress = await decodeProgressCode(decodeURIComponent(code));
        if (active) {
          setState({
            kind: 'ready',
            report: summarizeProgress(progress, index, dayKey(new Date())),
          });
        }
      } catch {
        if (active) setState({ kind: 'bad-link' });
      }
    }

    void read();
    return () => {
      active = false;
    };
  }, [hash]);

  // Trên máy của trẻ thì cho tạo link ngay tại đây.
  useEffect(() => {
    let active = true;
    void quietly(() => exportSnapshot()).then((snapshot) => {
      if (active && snapshot) setHasProgress(snapshot.exercises.length > 0);
    });
    return () => {
      active = false;
    };
  }, []);

  async function createLink() {
    const snapshot = await quietly(() => exportSnapshot());
    if (!snapshot) return;
    const code = await encodeProgressCode(snapshot);
    setLink(`${window.location.origin}/bao-cao#${code}`);
    setCopied(false);
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-page-title">{vi.report.title}</h1>
        <p className="mt-2 text-ink-soft">{vi.report.lead}</p>
      </div>

      {state.kind === 'bad-link' && (
        <p role="alert" data-testid="report-bad-link" className="font-medium text-attention">
          {vi.report.badLink}
        </p>
      )}

      {state.kind === 'no-link' && (
        <div data-testid="report-empty">
          <h2 className="text-card-title">{vi.report.emptyTitle}</h2>
          <p className="mt-1 text-ink-soft">{vi.report.emptyLead}</p>
        </div>
      )}

      {state.kind === 'ready' && <ReportBody report={state.report} />}

      {/* Bố mẹ mở link thì không cần ô tạo link — và lời mời ở đó xưng hô với trẻ. */}
      {state.kind !== 'ready' && (
        <div data-testid="report-create" className="rounded-card border border-line p-4">
          <h2 className="flex items-center gap-2 text-card-title">
            <Link2 aria-hidden="true" className="size-5" />
            {vi.report.createTitle}
          </h2>
          <p className="mt-1 text-ink-soft">{vi.report.createLead}</p>
          {hasProgress ? (
            <>
              <button
                type="button"
                onClick={() => void createLink()}
                className={buttonClasses('primary', 'md', 'mt-3')}
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                {vi.report.createButton}
              </button>
              {link !== '' && (
                <div className="mt-3">
                  <textarea
                    readOnly
                    aria-label={vi.report.createTitle}
                    data-testid="report-link"
                    value={link}
                    rows={3}
                    className="block w-full rounded-xl border border-line p-3 font-mono text-small break-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(link).catch(() => undefined);
                      setCopied(true);
                    }}
                    className={buttonClasses('outline', 'md', 'mt-2')}
                  >
                    {copied ? vi.report.copied : vi.report.copy}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="mt-2 text-ink-soft" data-testid="report-no-progress">
              {vi.report.createNothing}
            </p>
          )}
        </div>
      )}

      <div className="rounded-card bg-surface-muted p-4">
        <h2 className="font-bold">{vi.report.privacyTitle}</h2>
        <p className="mt-1 text-ink-soft">{vi.report.privacyBody}</p>
        <p className="mt-2 text-ink-soft">{vi.report.honestyNote}</p>
      </div>
    </section>
  );
}

function ReportBody({ report }: { report: ProgressReport }) {
  const stats = [
    { icon: CheckCircle2, value: report.exercisesDone, label: vi.report.stats.exercises },
    { icon: CalendarCheck, value: report.lessonsCompleted, label: vi.report.stats.lessons },
    { icon: Flame, value: report.streakDays, label: vi.report.stats.streak },
    { icon: Award, value: report.badgeCount, label: vi.report.stats.badges },
  ];

  return (
    <div data-testid="report-body" className="space-y-6">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label} className="rounded-card border border-line p-4">
            <stat.icon aria-hidden="true" className="size-5 text-accent-strong" />
            <p className="mt-2 text-page-title">{stat.value}</p>
            <p className="text-small text-ink-soft">{stat.label}</p>
          </li>
        ))}
      </ul>

      <p className="text-ink-soft">
        <span data-testid="report-attempts" className="font-medium text-ink">
          {report.attempts} {vi.report.stats.attempts}
        </span>{' '}
        · {vi.report.attemptsNote}
      </p>

      {report.lastActiveDay !== '' && (
        <p className="text-ink-soft">
          {vi.report.stats.lastActive}: {formatDayVi(report.lastActiveDay)}
        </p>
      )}

      <div>
        <h2 className="text-card-title">{vi.report.lessonsTitle}</h2>
        {report.lessons.length === 0 ? (
          <p className="mt-1 text-ink-soft">{vi.report.noLessons}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {report.lessons.map((lesson) => (
              <li
                key={lesson.lessonId}
                data-testid={`report-lesson-${lesson.lessonId}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3"
              >
                <span className="font-medium">{lesson.title}</span>
                <span className="text-ink-soft">
                  {lesson.doneCount}/{lesson.totalCount} ·{' '}
                  {lesson.completed ? vi.report.lessonDone : vi.report.lessonDoing}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
