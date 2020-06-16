# Dockerfile
FROM node:10 as build-img

# Set environment variables
ENV APPDIR /code

# Set the work directory
RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

ADD . ${APPDIR}

RUN npm install && npm run prebuild && npm run build

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

# Multistage build
FROM node:10-alpine

ENV APPDIR /code

RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

# Copy source code
COPY --from=build-img /code/dist /code
COPY --from=build-img /code/package.json /code

RUN npm install --production

# Delete unused files
RUN rm -rf package-lock.json
RUN rm -rf tsconfig.build.tsbuildinfo
RUN find . -name "*.d.ts" -type f -delete
RUN find . -name "*.js.map" -type f -delete

CMD ["node", "main.js"]
