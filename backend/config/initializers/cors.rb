Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # withCredentials: true を使用する場合、ワイルドカード(*) は使用不可
    # 開発環境: localhost:4000 (Next.js フロントエンド)
    origins "http://localhost:4000", "http://127.0.0.1:4000"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ["Authorization"]
  end
end
