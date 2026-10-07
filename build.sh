#!/bin/bash
set -e
cd "$(dirname "$0")"
ORDER="util data_tracks data_series data_people world player race ui creation season race_ui career owner screens events_engine events_grass events_pro events_life main"
: > /tmp/ft_game.js
for f in $ORDER; do cat "src/$f.js" >> /tmp/ft_game.js; echo >> /tmp/ft_game.js; done
node --check /tmp/ft_game.js
python3 - <<'PY'
s=open('src/shell.html').read();js=open('/tmp/ft_game.js').read()
assert '</script' not in js.lower(), 'bundle contains a closing script tag'
open('racing_career.html','w').write(s.replace('/*__JS__*/',js))
PY
cp /tmp/ft_game.js game_bundle.js
ls -la racing_career.html
