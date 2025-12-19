#Makefile

include ./include.mk


vars := $(filter-out $(VARS_OLD) VARS_OLD,$(.VARIABLES))
export $(.VARIABLES)

config:
ifneq ($(wildcard overwrite.env),"")
	@cat ./docker.vars | /bin/bash ./build/scripts/build-env-docker.sh ./overwrite.env > .env
else
	@cat ./docker.vars | /bin/bash ./build/scripts/build-env-docker.sh  >  .env
endif

help:
	@echo "$(TAG) will build for $(CI_PROJECT_NAME)"
	@echo "make build    = build docker images"
	@echo "make push     = push image to repository"

build-app:
	@echo "build image for $(IMG)/app"
	docker build --platfor= -t "$(IMG)/app:$(TAG)" \
		-f build/app/Dockerfile .
ifneq ($(TAG), master)
	docker tag "$(IMG)/app:$(TAG)" "$(IMG)/app:testing"
endif

push:
	docker push $(IMG)/app:$(TAG)
ifneq ($(TAG), master)
	docker tag "$(IMG)/app:$(TAG)" "$(IMG)/app:testing"
	docker push $(IMG)/app:testing
endif

build: build-app
	@echo "done building image for $(CI_PROJECT_NAME)"

tag-prod:
	docker tag $(IMG)/app:$(TAG) $(IMG)/app:production
	docker push $(IMG)/app:production
