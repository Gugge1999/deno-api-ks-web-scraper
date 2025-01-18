FROM denoland/deno:2.1.5

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

# TODO: Bäst praxis är inte köra som root. Detta kräver dock att mappen redan är skapat när koden checkas ut.
# Det gör också att COPY deno.lock deno.json ./ inte fungerar i github actions
# Prefer not to run as root.
#USER deno

FROM base as build

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deno.lock deno.json ./
RUN deno install --allow-scripts=npm:protobufjs@7.4.0

# These steps will be re-run upon each file change in your working directory:
COPY --link . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
#RUN deno cache src/main.ts

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

CMD ["task", "start"]