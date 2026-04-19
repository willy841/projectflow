#!/bin/sh
set -eu
ps -ef | grep 'next' | grep -v grep || true
