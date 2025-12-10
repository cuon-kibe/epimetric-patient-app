# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_01_01_000006) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "blood_test_results", force: :cascade do |t|
    t.bigint "patient_id", null: false
    t.date "test_date", null: false
    t.jsonb "test_items", default: {}, null: false
    t.string "s3_file_key"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "medical_center_id", comment: "登録した医療機関"
    t.bigint "medical_center_staff_id", comment: "登録したスタッフ"
    t.string "csv_file_name", comment: "元のCSVファイル名"
    t.integer "csv_row_number", comment: "CSVファイル内の行番号"
    t.index ["medical_center_id", "patient_id"], name: "index_blood_test_results_on_medical_center_id_and_patient_id", comment: "医療機関が登録した患者の検索用"
    t.index ["medical_center_id", "test_date"], name: "index_blood_test_results_on_medical_center_id_and_test_date", comment: "医療機関ごとの日付検索用"
    t.index ["medical_center_id"], name: "index_blood_test_results_on_medical_center_id"
    t.index ["medical_center_staff_id"], name: "index_blood_test_results_on_medical_center_staff_id"
    t.index ["patient_id"], name: "index_blood_test_results_on_patient_id"
    t.index ["test_date"], name: "index_blood_test_results_on_test_date"
    t.index ["test_items"], name: "index_blood_test_results_on_test_items", using: :gin
  end

  create_table "csv_upload_logs", force: :cascade do |t|
    t.bigint "medical_center_id", null: false, comment: "取り込みを実行した医療機関"
    t.bigint "medical_center_staff_id", null: false, comment: "取り込みを実行したスタッフ"
    t.string "file_name", null: false, comment: "元のファイル名"
    t.string "file_path", comment: "S3保存パス"
    t.integer "file_size", comment: "ファイルサイズ（バイト）"
    t.integer "total_rows", default: 0, comment: "総行数"
    t.integer "success_rows", default: 0, comment: "成功行数"
    t.integer "error_rows", default: 0, comment: "エラー行数"
    t.text "error_details", comment: "エラー詳細（JSON形式）"
    t.string "status", default: "processing", null: false, comment: "processing/completed/failed"
    t.datetime "started_at", comment: "処理開始日時"
    t.datetime "completed_at", comment: "処理完了日時"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_csv_upload_logs_on_created_at", comment: "日付での検索用"
    t.index ["medical_center_id", "created_at"], name: "index_csv_upload_logs_on_medical_center_id_and_created_at", comment: "医療機関ごとの日付検索用"
    t.index ["medical_center_id"], name: "index_csv_upload_logs_on_medical_center_id"
    t.index ["medical_center_staff_id"], name: "index_csv_upload_logs_on_medical_center_staff_id"
    t.index ["status"], name: "index_csv_upload_logs_on_status", comment: "ステータスでの検索用"
  end

  create_table "medical_center_staffs", force: :cascade do |t|
    t.bigint "medical_center_id", null: false, comment: "所属医療機関"
    t.string "email", null: false, comment: "ログイン用メールアドレス"
    t.string "password_digest", null: false, comment: "ハッシュ化されたパスワード"
    t.string "name", null: false, comment: "スタッフ氏名"
    t.string "role", default: "staff", null: false, comment: "ロール（staff/admin）"
    t.boolean "active", default: true, null: false, comment: "有効/無効フラグ"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_medical_center_staffs_on_active", comment: "有効なスタッフの検索用"
    t.index ["email"], name: "index_medical_center_staffs_on_email", unique: true, comment: "メールアドレスの一意制約"
    t.index ["medical_center_id", "active"], name: "index_medical_center_staffs_on_medical_center_id_and_active", comment: "医療機関の有効スタッフ検索用"
    t.index ["medical_center_id"], name: "index_medical_center_staffs_on_medical_center_id"
  end

  create_table "medical_centers", force: :cascade do |t|
    t.string "name", null: false, comment: "医療機関名"
    t.string "code", null: false, comment: "医療機関コード（一意識別子）"
    t.string "email", null: false, comment: "代表メールアドレス"
    t.string "phone", comment: "電話番号"
    t.string "address", comment: "住所"
    t.boolean "active", default: true, null: false, comment: "有効/無効フラグ"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_medical_centers_on_active", comment: "有効な医療機関の検索用"
    t.index ["code"], name: "index_medical_centers_on_code", unique: true, comment: "医療機関コードの一意制約"
    t.index ["email"], name: "index_medical_centers_on_email", unique: true, comment: "メールアドレスの一意制約"
  end

  create_table "patients", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "name", null: false
    t.date "date_of_birth"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_patients_on_email", unique: true
  end

  add_foreign_key "blood_test_results", "medical_center_staffs"
  add_foreign_key "blood_test_results", "medical_centers"
  add_foreign_key "blood_test_results", "patients"
  add_foreign_key "csv_upload_logs", "medical_center_staffs"
  add_foreign_key "csv_upload_logs", "medical_centers"
  add_foreign_key "medical_center_staffs", "medical_centers"
end
