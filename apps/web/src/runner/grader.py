"""Chạy code học sinh và chấm theo các test khai báo trong bài tập.

Đọc một "việc" dạng JSON ở stdin:

    {"code": "...", "tests": [{"type": "stdout_equals", ...}, ...]}

In ra JSON:

    {"passed": true, "results": [{"index": 0, "type": "...", "passed": true,
                                  "message": null, "detail": null}, ...]}

Mỗi test chạy code trong một namespace mới để test này không ảnh hưởng test kia.
Đây cũng là phần sẽ chạy trong Pyodide ở S0-08, nên chỉ dùng thư viện chuẩn và
tránh cú pháp quá mới.
"""

from __future__ import annotations

import io
import json
import sys
import traceback
from contextlib import redirect_stderr, redirect_stdout
from typing import Any


class StudentCodeError(Exception):
    """Code học sinh ném lỗi khi chạy."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


def run_student_code(code: str, stdin_text: str) -> tuple[dict[str, Any], str]:
    """Chạy code trong namespace riêng, trả về (namespace, stdout)."""
    namespace: dict[str, Any] = {"__name__": "__main__"}
    stdout = io.StringIO()
    original_stdin = sys.stdin
    sys.stdin = io.StringIO(stdin_text)
    try:
        with redirect_stdout(stdout), redirect_stderr(io.StringIO()):
            exec(compile(code, "bai-lam.py", "exec"), namespace)  # noqa: S102
    except SystemExit:
        pass
    except BaseException as error:  # noqa: BLE001 - báo lại nguyên văn cho người viết bài
        raise StudentCodeError(format_exception(error)) from error
    finally:
        sys.stdin = original_stdin
    return namespace, stdout.getvalue()


def format_exception(error: BaseException) -> str:
    lines = traceback.format_exception_only(type(error), error)
    return "".join(lines).strip()


def normalise_output(text: str) -> str:
    """Bỏ khoảng trắng thừa ở cuối mỗi dòng và ở cuối output."""
    return "\n".join(line.rstrip() for line in text.rstrip("\n").split("\n"))


def check_test(test: dict[str, Any]) -> tuple[bool, str | None]:
    """Trả về (đạt hay không, chi tiết để người viết bài sửa)."""
    kind = test["type"]
    code = test["__code"]
    stdin_text = test.get("stdin", "") or ""

    namespace, stdout = run_student_code(code, stdin_text)

    if kind == "stdout_equals":
        expected = normalise_output(test["expected"])
        actual = normalise_output(stdout)
        if actual == expected:
            return True, None
        return False, f"cần {expected!r}, nhận {actual!r}"

    if kind == "stdout_contains":
        if test["expected"] in stdout:
            return True, None
        return False, f"output không chứa {test['expected']!r}; nhận {stdout!r}"

    if kind == "variable_equals":
        name = test["name"]
        if name not in namespace:
            return False, f"không tìm thấy biến `{name}`"
        actual = namespace[name]
        if actual == test["expected"]:
            return True, None
        return False, f"biến `{name}`: cần {test['expected']!r}, nhận {actual!r}"

    if kind == "function_returns":
        name = test["name"]
        function = namespace.get(name)
        if not callable(function):
            return False, f"không tìm thấy hàm `{name}`"
        args = test.get("args", [])
        try:
            actual = function(*args)
        except BaseException as error:  # noqa: BLE001
            return False, f"gọi `{name}` bị lỗi: {format_exception(error)}"
        if actual == test["expected"]:
            return True, None
        return False, f"`{name}({', '.join(repr(a) for a in args)})`: cần {test['expected']!r}, nhận {actual!r}"

    if kind == "python_assert":
        try:
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                exec(compile(test["code"], "test.py", "exec"), namespace)  # noqa: S102
        except AssertionError as error:
            return False, format_exception(error) or "assert thất bại"
        except BaseException as error:  # noqa: BLE001
            return False, f"test bị lỗi: {format_exception(error)}"
        return True, None

    return False, f"loại test không hỗ trợ: {kind}"


def install_turtle(source: str) -> None:
    """Cài rùa tự viết thành module `turtle`.

    Cần cho cả hai nơi: CPython khi chạy `content:verify` (turtle thật đòi
    tkinter và màn hình), và bất cứ chỗ nào khác không có turtle.
    """
    import types

    module = types.ModuleType("turtle")
    exec(source, module.__dict__)  # noqa: S102
    sys.modules["turtle"] = module


def grade(job: dict[str, Any]) -> dict[str, Any]:
    """Chấm một bài: chạy `job["code"]` với từng test trong `job["tests"]`."""
    turtle_source = job.get("turtle_source")
    if turtle_source:
        install_turtle(turtle_source)
    code = job["code"]
    results = []

    for index, test in enumerate(job["tests"]):
        test_with_code = dict(test)
        test_with_code["__code"] = code
        try:
            passed, detail = check_test(test_with_code)
        except StudentCodeError as error:
            passed, detail = False, error.message
        results.append(
            {
                "index": index,
                "type": test["type"],
                "passed": passed,
                "message": test.get("message"),
                "detail": detail,
            }
        )

    return {"passed": all(result["passed"] for result in results), "results": results}


def grade_json(job_json: str) -> str:
    """Cửa vào cho Pyodide: JSON vào, JSON ra (không dùng stdin/stdout)."""
    return json.dumps(grade(json.loads(job_json)), ensure_ascii=False)


def main() -> int:
    """Cửa vào cho CPython ở terminal: đọc việc ở stdin, in kết quả ra stdout."""
    json.dump(grade(json.load(sys.stdin)), sys.stdout, ensure_ascii=False)
    return 0


if __name__ == "__main__":
    sys.exit(main())
