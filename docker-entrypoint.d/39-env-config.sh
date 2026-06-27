#!/bin/sh
set -e

CONFIG_PATH="/usr/share/nginx/html/env-config.js"
API_KEY="${PUBLIC_API_KEY:-}"

# Escape backslashes and double quotes for safe JSON embedding
ESCAPED_KEY=$(printf '%s' "$API_KEY" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat > "$CONFIG_PATH" <<EOF
window.__NECKO_CONFIG__ = {
  apiUrl: "/api",
  apiKey: "$ESCAPED_KEY"
};
EOF
