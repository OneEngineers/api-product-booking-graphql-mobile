######################################
#### - do not edit this section - ####

# save system vars
VARS_OLD := $(.VARIABLES)

# gitlab CI vars
CI_REGISTRY          ?= docker-registry.sabay.com
CI_PROJECT_NAMESPACE ?= sabay-one/backend
CI_PROJECT_NAME      ?= app.api.one.sabay.com
CI_COMMIT_REF_NAME   ?= master
CI_ENVIRONMENT_NAME  ?= master


# image and tag
TAG=$(CI_COMMIT_REF_NAME)
IMG=$(CI_REGISTRY)/$(CI_PROJECT_NAMESPACE)/$(CI_PROJECT_NAME)

COMPOSE_PROJECT_NAME ?=$(CI_PROJECT_NAME)

NODE_ENV=development
APP_PORT=3000

MONGO_DB_URI=mongo01.master.sabay.com:27017,mongo02.master.sabay.com:27017,mongo03.master.sabay.com:27017/app_sabay_one?replicaSet=repl_01&retryWrites=true&w=majority
MONGO_DB_USERNAME=app_sabay_one_user
MONGO_DB_PASSWORD=P0l8gjMN

JAEGER_HOST=jaeger
JAEGER_SPAN_LOGGING=true

RABBITMQ_HOST=rabbitmq
RABBITMQ_PASSWORD=guest
RABBITMQ_USER=guest
RABBITMQ_VHOST=/

REDIS_HOST=redis_dev
REDIS_PORT=6379

SLACK_API_URL=https://slack.com/api/chat.postMessage
SLACK_APP_TOKEN=xoxb-39222010342-3583612224324-Yq9D5aQQn0Qu13nnBLmhFh49
SLACK_CHANNEL=C05LT76FHNX

MOVIE_API_TOKEN=40073ea070f430594624f9c76e0290e28dfda521e5454bd2c9ac84495f3c39285d1294a096587fc73001c7ee3c720184706ce9ed9689995befa6f8cd08adf700b809279b3cef052b1a01fc82975c858b5cf416b6e4331a8ec7dfdd6fcbb93379329dd4883ad95dc0a775693434c6794b46b51eef1e305fcc34986bac6b6d63df
BOOK_API_TOKEN=00ce63e65b39b2569932f83d43871fa2268c3b7b8e1562908ec7122322ef0f5c615aa4831ea395e0c6885ed84e7c0d328177fb10f4b41a11faa6bcd52f7500c80e22e446617d05305421388850fa6872339691809e8ba644cfa7062f63d28e240a800d907379646a2fdb743dc2defd30385f30d1adb94a674c38f32137204875

ROW_LIMIT=20
MAX_LIMIT=100
RETRY_INTERVAL=30000
ENABLE_INTROSPECTION=true
DEBUG_MODE=0
MAXIMUM_OBJECT_SIZE=1
CACHED_EXPIRE=7200

MOVIE_API_URL=https://reality-stone.master.sabay.com/graphql
BOOK_API_URL=https://time-stone.master.sabay.com/graphql
PODCAST_API_URL=https://power-stone.master.sabay.com/graphql

API_USER_PSP_URL=https://psp.master.mysabay.com/v1/charge/auth
PAYMENT_ADDRESS_DOMAIN=one-resolver.master.sabay.com
API_SSN_URL=https://api.master.ssn.digital/v1

APPLE_CA_CERTIFICATE=AppleRootCA-G3.cer
APPLE_BUNDLE_ID=kh.com.sabay.sabayone.dev
APPLE_APP_ID=6452802434
APPLE_ENVIRONMENT=Sandbox
APPLE_ENABLE_ONLINE_CHECK=false

MICROSERVICE_JWT_SK=49D2D8D1F95AEABB952EE2791F111
ABA_PAY_API_KEY= 7372f806-aa2e-4a18-b79e-af933f813ce5
ABA_PAY_MERCHANT_ID=sabayone
ABA_PAY_WAY_URL=https://checkout-sandbox.payway.com.kh

WING_PAY_API_KEY=f510a69552be2c653e270fa257e82c87da4c116387667a9036ab28e978280c45
WING_PAY_WAY_URL=https://stage-pm2.wingbank.com
WING_PAY_USERNAME=online.woanant.test
