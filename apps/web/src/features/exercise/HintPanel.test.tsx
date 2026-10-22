import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HintPanel } from './HintPanel';
import { vi as strings } from '../../shared/i18n/vi';

const hints = ['Dùng `print`.', 'Chữ trong ngoặc kép.', 'Ví dụ: `print("Chào bạn")`.'];
const TOKEN = '6f1c2f4a-9b55-4c21-9f0f-2b6c0a1d3e44';

function renderPanel(options: { aiToken?: string } = { aiToken: TOKEN }) {
  return render(
    <HintPanel
      hints={hints}
      exerciseId="py-khoi-dong.01-xin-chao.01-in-loi-chao"
      getCode={() => 'print("x")'}
      getError={() => undefined}
      {...options}
    />,
  );
}

const aiReplies = (hint: string) =>
  vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve(new Response(JSON.stringify({ hint }))),
  );

const aiFails = (error: string, status: number) =>
  vi.fn(() => Promise.resolve(new Response(JSON.stringify({ error }), { status })));

beforeEach(() => vi.stubGlobal('fetch', aiReplies('Em thử nghĩ xem lệnh nào in ra màn hình nhé.')));
afterEach(() => vi.unstubAllGlobals());

describe('panel gợi ý', () => {
  it('nhắc trẻ đừng gõ tên thật TRƯỚC khi hỏi (bộ lọc không bắt được tên)', () => {
    renderPanel();
    const warning = screen.getByTestId('hint-privacy');
    expect(warning).toHaveTextContent('đừng viết tên thật');
    expect(warning).toHaveTextContent('code của em sẽ được gửi đi');
  });

  it('chưa bấm gì thì không lộ gợi ý nào', () => {
    renderPanel();
    expect(screen.queryByTestId('hint-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ai-hints')).not.toBeInTheDocument();
  });

  it('bấm hỏi thì hiện câu trả lời của trợ lý', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByTestId('hint-ask'));
    await waitFor(() => expect(screen.getByTestId('ai-hints')).toBeInTheDocument());
    expect(screen.getByTestId('ai-hints')).toHaveTextContent('lệnh nào in ra màn hình');
  });

  it('mỗi lần bấm là một mức sâu hơn, không nhảy thẳng tới mức 3', async () => {
    const spy = aiReplies('gợi ý');
    vi.stubGlobal('fetch', spy);
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByTestId('hint-ask'));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    await user.click(screen.getByTestId('hint-ask'));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));

    const levels = spy.mock.calls.map(
      (call) => (JSON.parse(call[1]?.body as string) as { hintLevel: number }).hintLevel,
    );
    expect(levels).toEqual([1, 2]);
  });

  it.each([
    ['ai-dang-tat', 503, strings.exercise.aiOff],
    ['qua-nhieu-luot', 429, strings.exercise.aiOutOfTurns],
    ['het-han-muc-ngay', 429, strings.exercise.aiBusyToday],
  ])(
    'AI trả %s thì rơi về gợi ý viết sẵn kèm câu giải thích đúng',
    async (code, httpStatus, message) => {
      vi.stubGlobal('fetch', aiFails(code, httpStatus));
      const user = userEvent.setup();
      renderPanel();

      await user.click(screen.getByTestId('hint-ask'));
      await waitFor(() => expect(screen.getByTestId('hint-fallback')).toHaveTextContent(message));
      // Quan trọng: trẻ vẫn nhận được một gợi ý, không phải tay trắng.
      expect(screen.getByTestId('hint-list')).toHaveTextContent('Dùng print.');
    },
  );

  it('mất mạng cũng vẫn có gợi ý viết sẵn', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('mất mạng'))),
    );
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByTestId('hint-ask'));
    await waitFor(() => expect(screen.getByTestId('hint-list')).toHaveTextContent('Dùng print.'));
  });

  it('không có token thì chỉ dùng gợi ý viết sẵn, không gọi mạng', async () => {
    const spy = aiReplies('không nên gọi');
    vi.stubGlobal('fetch', spy);
    const user = userEvent.setup();
    renderPanel({});

    await user.click(screen.getByTestId('hint-ask'));
    await waitFor(() => expect(screen.getByTestId('hint-list')).toBeInTheDocument());
    expect(spy).not.toHaveBeenCalled();
  });

  it('hết ba mức thì không còn nút hỏi nữa', async () => {
    const user = userEvent.setup();
    renderPanel();
    for (let index = 0; index < hints.length; index += 1) {
      await user.click(screen.getByTestId('hint-ask'));
      await waitFor(() => expect(screen.getByTestId('hint-list')).toBeInTheDocument());
    }
    expect(screen.queryByTestId('hint-ask')).not.toBeInTheDocument();
  });

  it('bài không có gợi ý viết sẵn thì không hiện panel', () => {
    render(<HintPanel hints={[]} exerciseId="x" getCode={() => ''} getError={() => undefined} />);
    expect(screen.queryByTestId('hint-ask')).not.toBeInTheDocument();
  });
});
