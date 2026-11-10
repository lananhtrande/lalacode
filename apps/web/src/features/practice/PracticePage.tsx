import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flame,
  Shuffle,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import {
  continueItem,
  dailyChallenge,
  difficulties,
  difficultyCounts,
  emptyPracticeFilter,
  filterPractice,
  isPracticeFiltering,
  monthCalendar,
  parsePracticeFilter,
  practiceFilterParams,
  practiceItems,
  practiceSets,
  practiceStatuses,
  randomPick,
  topicCounts,
  type PracticeFilter,
  type PracticeItem,
} from '../../content/practice';
import { quietly, toggleSaved } from '../../progress/db';
import type { ProgressSnapshot } from '../../progress/schema';
import { dayKey } from '../../progress/streak';
import { fill } from '../../shared/i18n/fill';
import { vi } from '../../shared/i18n/vi';
import { Button } from '../../shared/ui/Button';
import { ButtonLink } from '../../shared/ui/ButtonLink';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import { DifficultyBadge } from '../exercise/ExerciseBrief';
import { useCourses } from '../courses/useCourses';

const { practice: t } = vi;

/**
 * Kho luyện tập `/luyen-tap` (S0-40): mọi bài tập của mọi khoá, lọc ngay trong
 * trình duyệt. Bộ lọc nằm trên URL; "Để dành" nằm trong hồ sơ trên máy cùng
 * tiến độ (docs/privacy.md) — không có gì mới rời khỏi máy.
 */
export function PracticePage() {
  const state = useCourses();
  const [params, setParams] = useSearchParams();
  const filter = parsePracticeFilter(params);
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [noRandom, setNoRandom] = useState(false);
  const today = dayKey(new Date());

  const courses = state.status === 'ready' ? state.courses : null;
  const index = useMemo(
    () => (courses ? { version: 1, courses: courses.map((item) => item.course) } : null),
    [courses],
  );
  const items = useMemo(() => (index ? practiceItems(index) : []), [index]);
  const snapshot = state.progress.snapshot;
  const progress = useMemo(() => progressOf(snapshot), [snapshot]);

  const update = (patch: Partial<PracticeFilter>) => {
    setNoRandom(false);
    setParams(practiceFilterParams({ ...filter, ...patch }), { replace: true });
  };

  if (state.status !== 'ready' || !index) {
    return (
      <div className="mx-auto w-full max-w-[90rem]">
        <h1 className="text-page-title">{t.title}</h1>
        {state.status === 'loading' ? (
          <p className="mt-4 text-ink-soft" role="status">
            {t.loading}
          </p>
        ) : (
          <p className="mt-4 text-attention" role="alert">
            {t.error}
          </p>
        )}
      </div>
    );
  }

  const shown = filterPractice(items, filter, progress);
  const sets = practiceSets(index, items, progress.done);
  const filtering = isPracticeFiltering(filter);
  const filters = (
    <Filters
      items={items}
      filter={filter}
      progress={progress}
      onChange={update}
      onClear={() => update(emptyPracticeFilter)}
      filtering={filtering}
    />
  );

  return (
    <div className="mx-auto w-full max-w-[90rem]">
      <h1 className="text-page-title">{t.title}</h1>
      <p className="mt-1 text-ink-soft">{t.lead}</p>

      <SetStrip
        sets={sets}
        selected={filter.set}
        onSelect={(set) => update({ set: set === filter.set ? null : set })}
      />

      <div className="mt-6 gap-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        <aside aria-label={t.filters} className="hidden lg:block">
          {filters}
        </aside>

        <section aria-labelledby="danh-sach-bai-tap" className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="danh-sach-bai-tap" className="sr-only">
              {t.columnExercise}
            </h2>
            <Button
              variant="outline"
              className="lg:hidden"
              aria-expanded={filtersOpen}
              aria-controls="bo-loc-hep"
              icon={<SlidersHorizontal aria-hidden="true" className="size-4" />}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {t.showFilters}
            </Button>
            <p className="text-small text-ink-soft" aria-live="polite" data-testid="practice-count">
              {shown.length} {t.count}
            </p>
            <Button
              variant="dark"
              className="ml-auto"
              icon={<Shuffle aria-hidden="true" className="size-4" />}
              onClick={() => {
                const pick = randomPick(shown, progress.done);
                if (pick) void navigate(`/bai-tap/${pick.id}`);
                else setNoRandom(true);
              }}
            >
              {t.random}
            </Button>
          </div>
          {noRandom && (
            <p role="status" className="mt-2 text-small font-semibold text-success">
              {t.randomNone}
            </p>
          )}

          {filtersOpen && (
            <div id="bo-loc-hep" className="mt-3 rounded-card border border-line bg-surface p-4 lg:hidden">
              {filters}
            </div>
          )}

          {progress.done.size === 0 && (
            <p
              className="mt-4 rounded-card bg-accent-soft p-4 font-medium text-accent-strong"
              data-testid="practice-start"
            >
              {t.startHere}
            </p>
          )}

          {shown.length === 0 ? (
            <div className="mt-4 rounded-card border border-line bg-surface p-8 text-center">
              <p className="text-card-title font-normal">{t.empty}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => update(emptyPracticeFilter)}
              >
                {t.clearFilters}
              </Button>
            </div>
          ) : (
            <ExerciseList items={shown} done={progress.done} saved={progress.saved} />
          )}
        </section>

        <aside aria-label={t.continueTitle} className="mt-6 hidden space-y-4 xl:mt-0 xl:block">
          <Sidebar
            items={items}
            done={progress.done}
            today={today}
            activeDays={progress.activeDays}
          />
        </aside>
      </div>
    </div>
  );
}

function progressOf(snapshot: ProgressSnapshot | null) {
  const exercises = snapshot?.exercises ?? [];
  const activeDays = new Set<string>();
  for (const exercise of exercises) {
    // Ngày có nộp bài hoặc làm dở, theo giờ máy (giống streak).
    for (const at of [exercise.updatedAt, exercise.passedAt]) {
      if (at) activeDays.add(dayKey(new Date(at)));
    }
  }
  if (snapshot?.profile.lastActiveDay) activeDays.add(snapshot.profile.lastActiveDay);
  return {
    done: new Set(
      exercises.filter((item) => item.status === 'xong').map((item) => item.exerciseId),
    ),
    saved: new Set(snapshot?.profile.saved ?? []),
    activeDays,
  };
}

/** Băng "Bộ bài" cuộn ngang: bấm một bộ để lọc theo chương đó, bấm lại để bỏ. */
function SetStrip({
  sets,
  selected,
  onSelect,
}: {
  sets: { id: string; title: string; total: number; done: number }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const scroll = (direction: 1 | -1) =>
    listRef.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });
  const arrow =
    'flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface hover:bg-surface-muted';

  return (
    <section aria-labelledby="bo-bai" className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h2 id="bo-bai" className="text-section-title">
          {t.setsTitle}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={arrow}
            aria-label={t.setsPrevious}
            onClick={() => scroll(-1)}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button type="button" className={arrow} aria-label={t.setsNext} onClick={() => scroll(1)}>
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
      <ul
        ref={listRef}
        data-testid="practice-sets"
        className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {sets.map((set) => {
          const active = set.id === selected;
          return (
            <li key={set.id} className="w-64 shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(set.id)}
                className={[
                  'flex h-full w-full flex-col gap-3 rounded-card border-2 bg-surface p-4 text-left',
                  active ? 'border-accent' : 'border-line hover:border-ink-soft',
                ].join(' ')}
              >
                <span className="text-label">{set.title}</span>
                <ProgressBar
                  percent={set.total === 0 ? 0 : (set.done / set.total) * 100}
                  label={set.title}
                  caption={`${set.done}/${set.total}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Filters({
  items,
  filter,
  progress,
  onChange,
  onClear,
  filtering,
}: {
  items: readonly PracticeItem[];
  filter: PracticeFilter;
  progress: { done: ReadonlySet<string>; saved: ReadonlySet<string> };
  onChange: (patch: Partial<PracticeFilter>) => void;
  onClear: () => void;
  filtering: boolean;
}) {
  const levels = difficultyCounts(items, filter, progress);
  const topics = topicCounts(items, filter, progress);
  const toggle = <T,>(list: readonly T[], value: T) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div className="space-y-5">
      <FilterGroup legend={t.difficulty}>
        {difficulties.map((value) => (
          <CheckOption
            key={value}
            label={vi.exercise.difficulty[value]}
            count={levels[value]}
            checked={filter.difficulties.includes(value)}
            onChange={() => onChange({ difficulties: toggle(filter.difficulties, value) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup legend={t.topic}>
        {[...topics].map(([topic, count]) => (
          <CheckOption
            key={topic}
            label={topic}
            count={count}
            checked={filter.topics.includes(topic)}
            onChange={() => onChange({ topics: toggle(filter.topics, topic) })}
          />
        ))}
      </FilterGroup>
      <FilterGroup legend={t.status}>
        {practiceStatuses.map((value) => (
          <label key={value} className="flex min-h-tap cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="trang-thai"
              className="size-5 accent-accent"
              checked={filter.status === value}
              onChange={() => onChange({ status: value })}
            />
            {t.statusOptions[value]}
          </label>
        ))}
        <CheckOption
          label={t.savedOnly}
          checked={filter.savedOnly}
          onChange={() => onChange({ savedOnly: !filter.savedOnly })}
        />
      </FilterGroup>
      {filtering && (
        <Button variant="ghost" onClick={onClear}>
          {t.clearFilters}
        </Button>
      )}
    </div>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-label">{legend}</legend>
      <div className="mt-1">{children}</div>
    </fieldset>
  );
}

function CheckOption({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-tap cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="size-5 accent-accent"
        checked={checked}
        onChange={onChange}
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-small text-ink-soft tabular-nums">{count}</span>
      )}
    </label>
  );
}

/** Bảng ở màn rộng, thẻ ở màn hẹp. Không có tỉ lệ đúng, lượt nộp hay sao đánh giá (ADR 0011). */
function ExerciseList({
  items,
  done,
  saved,
}: {
  items: readonly PracticeItem[];
  done: ReadonlySet<string>;
  saved: ReadonlySet<string>;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
      <table className="w-full text-left max-md:block" data-testid="practice-list">
        <thead className="border-b border-line text-small text-ink-soft max-md:sr-only">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t.columnStatus}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t.columnExercise}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t.columnLesson}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {t.columnDifficulty}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              <span className="sr-only">{t.columnSaved}</span>
            </th>
          </tr>
        </thead>
        <tbody className="max-md:block">
          {items.map((item) => {
            const finished = done.has(item.id);
            return (
              <tr
                key={item.id}
                data-testid={`practice-${item.id}`}
                className="border-b border-line last:border-b-0 max-md:grid max-md:grid-cols-[auto_1fr_auto] max-md:items-center max-md:gap-x-3 max-md:px-4 max-md:py-3"
              >
                <td className="px-4 py-2 max-md:row-span-2 max-md:p-0">
                  {finished ? (
                    <Check aria-hidden="true" className="size-5 text-success" />
                  ) : (
                    <Circle aria-hidden="true" className="size-5 text-ink-soft" />
                  )}
                  <span className="sr-only">{finished ? t.done : t.notDone}</span>
                </td>
                <td className="px-4 py-2 max-md:p-0">
                  <Link
                    to={`/bai-tap/${item.id}`}
                    className="flex min-h-tap items-center font-semibold text-accent-strong underline"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-small text-ink-soft max-md:col-start-2 max-md:p-0">
                  {fill(t.lessonLabel, { n: item.lessonNumber, title: item.lessonTitle })}
                </td>
                <td className="px-4 py-2 max-md:col-start-2 max-md:p-0 max-md:pt-1">
                  {item.difficulty ? (
                    <DifficultyBadge difficulty={item.difficulty} />
                  ) : (
                    <span className="text-small text-ink-soft">{t.noDifficulty}</span>
                  )}
                </td>
                <td className="px-2 py-2 text-right max-md:col-start-3 max-md:row-span-2 max-md:row-start-1 max-md:p-0">
                  <SaveButton exerciseId={item.id} title={item.title} saved={saved.has(item.id)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SaveButton({
  exerciseId,
  title,
  saved,
}: {
  exerciseId: string;
  title: string;
  saved: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${t.save}: ${title}`}
      title={saved ? t.unsave : t.save}
      onClick={() => void quietly(() => toggleSaved(exerciseId))}
      className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-muted hover:text-ink aria-pressed:text-accent-strong"
    >
      {saved ? (
        <BookmarkCheck aria-hidden="true" className="size-5" />
      ) : (
        <Bookmark aria-hidden="true" className="size-5" />
      )}
    </button>
  );
}

/** Cột phải (≥ 1280px): tiếp tục, thử thách hôm nay, lịch ngày học của tháng. */
function Sidebar({
  items,
  done,
  today,
  activeDays,
}: {
  items: readonly PracticeItem[];
  done: ReadonlySet<string>;
  today: string;
  activeDays: ReadonlySet<string>;
}) {
  const next = continueItem(items, done);
  const challenge = dailyChallenge(items, today);
  const calendarId = useId();
  const weeks = monthCalendar(today, activeDays);
  const [year, month] = today.split('-');

  return (
    <>
      <section className="rounded-card border border-line bg-surface p-4" data-testid="practice-continue">
        <h2 className="text-card-title">{t.continueTitle}</h2>
        {next ? (
          <>
            <p className="mt-1 text-small text-ink-soft">
              {fill(t.lessonLabel, { n: next.lessonNumber, title: next.lessonTitle })}
            </p>
            <ButtonLink to={`/bai-tap/${next.id}`} className="mt-3">
              {next.title}
              <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </>
        ) : (
          <p className="mt-1">{t.continueAllDone}</p>
        )}
      </section>

      {challenge && (
        <section
          className="rounded-card border border-line bg-surface p-4"
          data-testid="practice-challenge"
        >
          <h2 className="flex items-center gap-2 text-card-title">
            <Trophy aria-hidden="true" className="size-5 text-accent-strong" />
            {t.challengeTitle}
          </h2>
          <p className="mt-1 text-small text-ink-soft">{t.challengeNote}</p>
          <Link
            to={`/bai-tap/${challenge.id}`}
            className="mt-2 flex min-h-tap items-center font-semibold text-accent-strong underline"
          >
            {challenge.title}
          </Link>
          {challenge.difficulty && <DifficultyBadge difficulty={challenge.difficulty} />}
        </section>
      )}

      <section aria-labelledby={calendarId} className="rounded-card border border-line bg-surface p-4">
        <h2 id={calendarId} className="text-card-title">
          {t.calendarTitle} ({month}/{year})
        </h2>
        <table
          className="mt-3 w-full table-fixed text-center text-small"
          data-testid="practice-calendar"
        >
          <thead>
            <tr>
              {t.weekdays.map((day) => (
                <th key={day} scope="col" className="pb-1 font-semibold text-ink-soft">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, row) => (
              <tr key={row}>
                {week.map((day, column) => (
                  <td key={column} className="p-0.5">
                    {day && (
                      <span
                        data-active={day.active || undefined}
                        className={[
                          'flex aspect-square flex-col items-center justify-center rounded-lg',
                          day.active
                            ? 'bg-accent-soft font-semibold text-accent-strong'
                            : 'text-ink-soft',
                          day.today ? 'ring-2 ring-ink' : '',
                        ].join(' ')}
                      >
                        {day.day}
                        {/* Ngày có học: thêm icon lửa và chữ ẩn, không chỉ đổi màu nền. */}
                        {day.active && (
                          <>
                            <Flame aria-hidden="true" className="size-3" />
                            <span className="sr-only">{t.calendarActive}</span>
                          </>
                        )}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
