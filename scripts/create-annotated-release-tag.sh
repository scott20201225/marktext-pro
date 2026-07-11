#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <tag> [--force]" >&2
  exit 1
fi

tag="$1"
force_flag="${2:-}"

if [[ "${force_flag}" != "" && "${force_flag}" != "--force" ]]; then
  echo "Unknown option: ${force_flag}" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
note_file="${repo_root}/.github/release-notes/macos-unsigned-zh-CN.md"
tmp_file="$(mktemp)"
trap 'rm -f "${tmp_file}"' EXIT

{
  echo "Release ${tag}"
  echo
  cat "${note_file}"
} > "${tmp_file}"

cd "${repo_root}"

if [[ "${force_flag}" == "--force" ]]; then
  git tag -a -f "${tag}" -F "${tmp_file}"
else
  git tag -a "${tag}" -F "${tmp_file}"
fi
