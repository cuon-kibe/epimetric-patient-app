Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # 認証
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"

      # 患者
      resources :patients, only: [:create, :show] do
        collection do
          get :me
        end
      end

      # 血液検査結果
      resources :blood_test_results, only: [:index, :show] do
        collection do
          post :upload
        end
      end

      # 医療センター管理画面
      namespace :mc do
        post "login", to: "sessions#create"
        delete "logout", to: "sessions#destroy"
        get "me", to: "sessions#me"
        get "dashboard", to: "dashboards#show"
        resources :patients, only: [:index, :show]
        resources :blood_test_results, only: [:index, :show, :create] do
          collection do
            post :upload_csv
          end
        end
        resources :csv_upload_logs, only: [:index, :show]
      end
    end
  end

  # ヘルスチェック
  get "health", to: proc { [200, {}, ["OK"]] }
end
