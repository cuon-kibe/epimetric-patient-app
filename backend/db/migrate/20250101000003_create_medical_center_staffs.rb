class CreateMedicalCenterStaffs < ActiveRecord::Migration[8.0]
  def change
    create_table :medical_center_staffs do |t|
      t.references :medical_center, null: false, foreign_key: true
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :name, null: false
      t.integer :role, default: 0
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :medical_center_staffs, :email, unique: true
  end
end


