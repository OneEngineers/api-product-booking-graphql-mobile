FROM docker-registry.sabay.com/docker/node:20-alpine-release AS builder

COPY ./ ${APP_DIR}

# install node libs
RUN npm i --legacy-peer-deps \
    && npm run build

# build release image
FROM docker-registry.sabay.com/docker/node:20-alpine-release

COPY --from=builder ${APP_DIR}/dist ./dist
COPY --from=builder ${APP_DIR}/package-lock.json ./
COPY --from=builder ${APP_DIR}/package.json ./
COPY --from=builder ${APP_DIR}/build/scripts ./
COPY --from=builder ${APP_DIR}/src/certificate ./dist/certificate


RUN npm i --production

RUN install -m 755 ./*.sh /bin/

EXPOSE 3000

ENTRYPOINT ["/bin/entrypoint.sh"]
CMD ["app:start"]
