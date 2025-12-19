#!/bin/bash
#

# source settings from ARG1
# read original setting file from stdin
# output clean key=value file

# to use CI ENV in source file, declare VAR as
# VAR={$VAR:-default-value}

# source the value replacement file
if [ ! -z "$1" ]; then
  test -f $1 && source $1
fi

# read the value file and replace values with settings from source file
cat /dev/stdin | sed '/^$/d' | sed '/^#.*$/d' | sort | while read line; do

  if [[ "${!line}" =~ \ |\' ]]
  then
    printf "%s='%s'\n" "${line}" "${!line}"
  else
    printf "%s=%s\n" "${line}" "${!line}"
  fi

done
