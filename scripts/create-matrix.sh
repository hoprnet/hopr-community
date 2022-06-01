#!/usr/bin/env bash

# prevent sourcing of this script, only allow execution
$(return >/dev/null 2>&1)
test "$?" -eq "0" && { echo "This script should only be executed." >&2; exit 1; }

# exit on errors, undefined variables, ensure errors in pipes are not hidden
set -Eeuo pipefail

# set mydir
declare mydir
mydir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)

# get projects path
projectsPath=$(realpath "${mydir}/../projects")
# echo "projectsPath=$projectsPath"

# loop through folders that contain a 'deploy.json'
# echo those who contain differences
find ${projectsPath} -maxdepth 2 -name 'deploy.json' | while read file; do
  filePath=$(dirname $file)
  diffLines=$(git diff --name-only HEAD^ HEAD -- $(dirname $file) | wc -l)

  # echo $file
  # echo $filePath
  # echo $diffLines
  if [ $diffLines -gt 0 ]; then
    echo $file
  fi  
done