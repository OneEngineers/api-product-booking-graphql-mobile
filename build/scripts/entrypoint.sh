#!/bin/bash
# Sabay Docker entrypoint.sh

check_env() {
  local var="$1"

  if [[ ! "${!var:-}" ]] ; then
    echo >&2 "ERROR: $var is not set"
    exit 1
  else
    if [[ ${NODE_ENV} != "production" ]]; then
      echo "INIT $var : ${!var}"
    fi
  fi
}

envs=(
  NODE_ENV

  MONGO_DB_URI
  MONGO_DB_USERNAME
  MONGO_DB_PASSWORD

  JAEGER_HOST
  JAEGER_SPAN_LOGGING

  RABBITMQ_HOST
  RABBITMQ_PASSWORD
  RABBITMQ_USER
  RABBITMQ_VHOST

  REDIS_HOST
  REDIS_PORT

  MOVIE_API_URL
  BOOK_API_URL
  PODCAST_API_URL
  API_USER_PSP_URL
  PAYMENT_ADDRESS_DOMAIN
  API_SSN_URL

  APPLE_BUNDLE_ID
  APPLE_APP_ID
)

case ${1} in
  app:start)
    source /bin/secrets2env.sh
    # check if all envs are set
    for e in "${envs[@]}"; do
      check_env "$e"
    done

    if [[ ${NODE_ENV} == "development" ]]; then
      # ready to start server with nodemon
      echo "INIT: starting web service for development(nodemon)"
      exec npm run dev
    else
      # ready to start server
      echo "INIT: starting web service production"
      exec node ./dist/app.js
    fi
  ;;

  worker:start)
    source /bin/secrets2env.sh
    if [[ ${NODE_ENV} == "development" ]]; then
      # ready to start server with nodemon
      echo "INIT: starting queue worker"
      exec npm run worker:dev
    else
      # ready to start server with pm2
      echo "INIT: starting queue worker"
      exec node ./dist/consumers/index.js
    fi
  ;;

  app:help)
    echo "Available options:"
    echo " app:start  - Starts the server (default)"
    echo " [command]  - Execute the specified command, eg. bash."
  ;;

  *)
    exec "$@"
  ;;

esac
