FROM node:lts-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS prod
COPY /server/package.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod
COPY /server .

FROM base AS build
COPY /package.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod /app .
COPY --from=build /app/dist ./dist
CMD [ "npm", "run", "serve" ]
EXPOSE 8080
