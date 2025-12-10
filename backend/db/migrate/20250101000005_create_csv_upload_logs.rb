class CreateCsvUploadLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :csv_upload_logs do |t|
      t.references :medical_center, null: false, foreign_key: true
      t.references :medical_center_staff, foreign_key: true
      t.string :file_name, null: false
      t.string :file_path
      t.integer :file_size
      t.integer :total_rows, default: 0
      t.integer :success_rows, default: 0
      t.integer :error_rows, default: 0
      t.text :error_details
      t.integer :status, default: 0
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end
  end
end


