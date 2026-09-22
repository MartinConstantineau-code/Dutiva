#!/bin/sh
# Start clamd, wait for it to be ready, then hand off to the HTTP endpoint.
#
# The wait matters: clamd takes 30-90s to parse the signature database, and
# without it the server would come up answering 502 on every scan until clamd
# caught up. Better to hold the container "not ready" than to serve wrong.
set -eu

DB_DIR=/var/lib/clamav

# No database (build had no egress) — fetch one before clamd will start at all.
if ! ls "$DB_DIR"/*.cvd "$DB_DIR"/*.cld >/dev/null 2>&1; then
  echo "[entrypoint] no signature database; running freshclam (this takes a few minutes)"
  freshclam --stdout || { echo "[entrypoint] freshclam failed; cannot start"; exit 1; }
fi

echo "[entrypoint] starting freshclam daemon"
freshclam -d --stdout &

echo "[entrypoint] starting clamd"
clamd &

echo "[entrypoint] waiting for clamd on ${CLAMD_HOST:-127.0.0.1}:${CLAMD_PORT:-3310}"
i=0
until node -e "
const net=require('node:net');
const s=net.createConnection({host:process.env.CLAMD_HOST||'127.0.0.1',port:Number(process.env.CLAMD_PORT||3310)});
s.on('connect',()=>{s.write('zPING\0')});
s.on('data',d=>process.exit(String(d).includes('PONG')?0:1));
s.on('error',()=>process.exit(1));
setTimeout(()=>process.exit(1),2000);
" 2>/dev/null; do
  i=$((i+1))
  if [ "$i" -ge 90 ]; then
    echo "[entrypoint] clamd did not become ready in ~3 minutes."
    echo "[entrypoint] the usual cause is too little memory — clamd needs ~2 GB for the signature database."
    exit 1
  fi
  sleep 2
done

echo "[entrypoint] clamd ready; starting scan endpoint"
exec node /app/server.js
