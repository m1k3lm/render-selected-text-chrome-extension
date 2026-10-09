#!/bin/bash
# Creates a production-ready zip file for Chrome Web Store

set -euo pipefail
cd "$(dirname "$0")"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  📦 Packaging Render Selected Text Extension${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
OUTPUT="render-selected-text-v${VERSION}.zip"
echo -e "${YELLOW}Version:${NC} $VERSION"

# zip -r updates an existing archive in place, so start from scratch
rm -f "$OUTPUT"

echo -e "${BLUE}Package contents:${NC}"
zip -r "$OUTPUT" \
  manifest.json \
  background.js \
  content.js \
  renderers.js \
  styles.css \
  settings.js \
  options.html \
  options.js \
  options.css \
  parsers/ \
  icon16.png \
  icon48.png \
  icon128.png \
  README.md \
  -x "*.DS_Store"

echo ""
echo -e "${GREEN}✓ Created ${OUTPUT} ($(du -h "$OUTPUT" | cut -f1 | tr -d ' '))${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Go to: ${BLUE}https://chrome.google.com/webstore/devconsole${NC}"
echo -e "  2. Click 'New Item' and upload: ${GREEN}$OUTPUT${NC}"
echo -e "  3. Fill out store listing (see PUBLISHING.md)"
echo -e "  4. Submit for review"
echo ""
