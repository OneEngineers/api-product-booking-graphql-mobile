#!/bin/sh
#
# UPDATED: 2021-07-02
# pipe secrets to .env file
# usage: $source secrets2env.sh prefix
prefix="$1"
dir=/run/secrets
# check if files exist in secrets
if [[ -n "$(ls $dir)" ]] ; then
    for f in $dir/*; do
        # remove prefix from key and make it uppercase
        name=$(basename $f)
        key=$(echo ${name#"$prefix"})
        key=$(echo "$key" | awk '{ print toupper($0) }')
        value=$(cat $f)
        export "$key"="$value"
        echo "reading secret $key"
    done
fi