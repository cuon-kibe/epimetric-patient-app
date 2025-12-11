FROM node:22

ENV TZ Asia/Tokyo

# tiniをインストール（シグナル処理のため、Ctrl+Cでサーバーを停止可能にする）
RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# corepackを有効化してyarnを使用可能にする
RUN corepack enable

COPY package.json yarn.lock /app/
RUN yarn install

COPY . /app

# Prismaクライアントを生成（schema.prismaをコピー後に実行）
RUN yarn db:generate

# 起動スクリプトに実行権限を付与
RUN chmod +x /app/scripts/docker-entrypoint.sh

EXPOSE 3000

# tiniをエントリーポイントにしてシグナルを適切に処理
# docker-entrypoint.shでマイグレーションとシードを実行
ENTRYPOINT ["/usr/bin/tini", "--", "/app/scripts/docker-entrypoint.sh"]
CMD ["yarn", "dev", "-p", "3000"]
