#!/usr/bin/env bash
BASEDIR=$(dirname "$0")
cd ${BASEDIR}
source ~/.zshrc
nvm use lts/carbon
./cli agendar ${HERA_PASS} --local lt --time 14:30..18:00 --cron >> ./cli.log 2>&1
