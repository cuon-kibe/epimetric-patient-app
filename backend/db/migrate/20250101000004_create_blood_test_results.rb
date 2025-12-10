class CreateBloodTestResults < ActiveRecord::Migration[8.0]
  def change
    create_table :blood_test_results do |t|
      t.references :patient, null: false, foreign_key: true
      t.references :medical_center, foreign_key: true
      t.references :medical_center_staff, foreign_key: true
      t.date :test_date, null: false
      t.jsonb :test_items, null: false, default: {}
      t.string :s3_file_key
      t.text :notes
      t.string :csv_file_name
      t.integer :csv_row_number

      t.timestamps
    end

    add_index :blood_test_results, :test_date
  end
end


