FROM node:22.17.0-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack install --global pnpm@10.25.0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apk add --no-cache openssl git rsync lsof

# Create group and modify existing node user to match Kubernetes security context
RUN addgroup -g 3000 appgroup && \
    adduser node appgroup

# Increase file watcher limit
RUN echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf

COPY entrypoint.preview.sh /entrypoint.preview.sh
RUN chmod +x /entrypoint.preview.sh

# Create the working directory and give full ownership to node BEFORE switching user
RUN mkdir -p /app/project && chown -R node:appgroup /app/project && chmod -R 775 /app/project

# Switch to non-root user BEFORE copying files and installing
USER node

WORKDIR /app/project

# Now copy files as node user — no permission issues
COPY --chown=node:appgroup . .

# Install as node user — writes to node_modules with correct ownership
RUN pnpm install

EXPOSE 9000

ENTRYPOINT ["/entrypoint.preview.sh"]