#!/usr/bin/env bash
# ============================================================================
#  JewelleryERP — DEVELOPMENT auto-deploy (PULL based)
# ----------------------------------------------------------------------------
#  INSTALLED COPY. Source of truth is scripts/dev-autodeploy.sh in the repo;
#  this copy lives OUTSIDE the checkout on purpose, because the deploy resets
#  that checkout to origin/dev on every run — a script running from inside the
#  tree can delete itself mid-deploy the moment its branch changes.
#  After editing the repo copy, reinstall with:
#      install -m 755 /var/www/html/jewelleryerp/scripts/dev-autodeploy.sh \
#                     /usr/local/bin/jewelleryerp-dev-deploy.sh
#
#  Why pull instead of the GitHub Actions SSH push?
#    This dev box is on a private LAN (192.168.1.100) behind NAT on a dynamic
#    ISP address, and its only public name (devjewelerp.nazaradiamonds.com)
#    resolves to Cloudflare proxy IPs fronting a Cloudflare Tunnel, which do
#    not carry SSH. A GitHub runner has no reachable address to connect to, so
#    appleboy/ssh-action has never once authenticated here. Polling origin/dev
#    from the inside needs no inbound port, no static IP and no SSH key in
#    GitHub, so it cannot break the same way.
#
#  Run by : jewelleryerp-dev-deploy.timer (every 60s)
#  Log    : /var/log/jewelleryerp-deploy.log
#  State  : /var/lib/jewelleryerp/deployed-sha
# ============================================================================
set -Eeuo pipefail

REPO=/var/www/html/jewelleryerp
BRANCH=dev
STATE=/var/lib/jewelleryerp/deployed-sha
LOG=/var/log/jewelleryerp-deploy.log
PM2_APP=jewellery-backend
export HOME=/root                    # git needs ~/.ssh/config for the deploy key
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') $*" >>"$LOG"; }
trap 'log "ERROR: deploy aborted at line $LINENO (exit $?)"' ERR

mkdir -p "$(dirname "$STATE")"
cd "$REPO"

git fetch --quiet origin "$BRANCH"
remote=$(git rev-parse "origin/$BRANCH")
deployed=$(cat "$STATE" 2>/dev/null || echo none)

# Nothing new since the last SUCCESSFUL deploy -> stay quiet. Comparing against
# the state file rather than against HEAD means a build that died half way is
# retried on the next tick instead of being mistaken for "already deployed".
[ "$remote" = "$deployed" ] && exit 0

log "=== deploy start: $deployed -> $remote ==="

# What changed? Decides whether npm install / build / pm2 restart run at all.
if [ "$deployed" = none ]; then
  changed=$(git ls-tree -r --name-only "$remote")
else
  changed=$(git diff --name-only "$deployed" "$remote" 2>/dev/null || git ls-tree -r --name-only "$remote")
fi

# -B forces the local `dev` branch onto the fetched commit AND checks it out, so
# the deploy is correct even if someone left the working copy on another branch.
# (A bare `reset --hard` would instead rewrite whichever branch was checked out,
# quietly destroying it.) Untracked, git-ignored files such as backend/.env are
# not touched by either.
git checkout -q -B "$BRANCH" "$remote"
log "checked out $(git log --oneline -1)"

# --- dependencies: only when a manifest moved (or node_modules is missing) ---
if grep -qE '^backend/package(-lock)?\.json$' <<<"$changed" || [ ! -d backend/node_modules ]; then
  log "backend: npm install"
  (cd backend && npm install --no-audit --no-fund) >>"$LOG" 2>&1
fi
if grep -qE '^frontend/package(-lock)?\.json$' <<<"$changed" || [ ! -d frontend/node_modules ]; then
  log "frontend: npm install"
  (cd frontend && npm install --no-audit --no-fund) >>"$LOG" 2>&1
fi

# --- frontend build ---------------------------------------------------------
# Built into dist.new and swapped in only after it succeeds, so a broken commit
# leaves the currently served dist untouched instead of blanking the dev site.
if grep -qE '^frontend/' <<<"$changed" || [ ! -f frontend/dist/index.html ]; then
  log "frontend: build"
  rm -rf frontend/dist.new
  (cd frontend && NODE_OPTIONS=--max-old-space-size=4096 \
      npm run build -- --outDir dist.new --emptyOutDir) >>"$LOG" 2>&1
  rm -rf frontend/dist.old
  [ -d frontend/dist ] && mv frontend/dist frontend/dist.old
  mv frontend/dist.new frontend/dist
  rm -rf frontend/dist.old
  log "frontend: dist swapped in"
fi

# --- backend ----------------------------------------------------------------
if grep -qE '^backend/' <<<"$changed"; then
  log "backend: pm2 restart"
  pm2 restart "$PM2_APP" --update-env >>"$LOG" 2>&1 || \
    (cd backend && pm2 start server.js --name "$PM2_APP" --update-env >>"$LOG" 2>&1)
  pm2 save >>"$LOG" 2>&1
fi

echo "$remote" >"$STATE"
log "=== deploy OK: now on $(git log --oneline -1) ==="
