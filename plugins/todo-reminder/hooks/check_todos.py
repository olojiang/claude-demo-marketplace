#!/usr/bin/env python3
"""
TODO Reminder Hook

A PreToolUse hook that checks for TODO/FIXME/HACK/XXX comments in code
being written or edited, and reminds the developer to address them.

Hook behavior:
  - Exit 0: Allow the tool use (with optional warning on stderr)
  - Exit 2: Block the tool use (not used here, we only warn)

Input (stdin): JSON with tool_name and tool_input
Output (stderr): Warning message if TODOs found
"""

import json
import re
import sys

TODO_PATTERNS = [
    r'\bTODO\b',
    r'\bFIXME\b',
    r'\bHACK\b',
    r'\bXXX\b',
    r'\bWARNING\b:\s',
]

TODO_REGEX = re.compile('|'.join(TODO_PATTERNS), re.IGNORECASE)


def extract_content(tool_input: dict, tool_name: str) -> str:
    """Extract the code content from different tool input formats."""
    if tool_name == 'Write':
        return tool_input.get('content', '')
    elif tool_name == 'Edit':
        return tool_input.get('new_string', '')
    elif tool_name == 'MultiEdit':
        edits = tool_input.get('edits', [])
        return '\n'.join(e.get('new_string', '') for e in edits)
    return ''


def find_todos(content):
    # type: (str) -> list
    """Find all TODO-like comments in the content."""
    findings = []
    for i, line in enumerate(content.splitlines(), 1):
        if TODO_REGEX.search(line):
            findings.append(f"  Line {i}: {line.strip()}")
    return findings


def main():
    try:
        hook_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    tool_name = hook_input.get('tool_name', '')
    tool_input = hook_input.get('tool_input', {})
    file_path = tool_input.get('file_path', tool_input.get('path', 'unknown'))

    content = extract_content(tool_input, tool_name)
    if not content:
        sys.exit(0)

    todos = find_todos(content)
    if todos:
        msg = f"\nTODO Reminder: Found {len(todos)} TODO/FIXME comment(s) in {file_path}:\n"
        msg += '\n'.join(todos)
        msg += "\n\nConsider addressing these before finalizing.\n"
        print(msg, file=sys.stderr)

    sys.exit(0)


if __name__ == '__main__':
    main()
