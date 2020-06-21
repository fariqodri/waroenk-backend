# Dockerfile
FROM node:10-alpine as development

# Set environment variables
ENV APPDIR /code

# Set the work directory
RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Multistage build
FROM node:10-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

ENV APPDIR /code

RUN mkdir -p ${APPDIR}
WORKDIR ${APPDIR}

# Copy source code
COPY --from=development /code/dist /code
COPY --from=development /code/package*.json /code/

RUN apk add --no-cache make gcc g++ python && \
  npm install --production && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python

# Delete unused files
RUN rm -rf package-lock.json
RUN rm -rf tsconfig.build.tsbuildinfo
RUN find . -name "*.d.ts" -type f -delete
RUN find . -name "*.js.map" -type f -delete

CMD ["node", "main.js"]
