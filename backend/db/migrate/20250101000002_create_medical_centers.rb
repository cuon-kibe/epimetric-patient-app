class CreateMedicalCenters < ActiveRecord::Migration[8.0]
  def change
    create_table :medical_centers do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.string :email
      t.string :phone
      t.string :address
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :medical_centers, :code, unique: true
  end
end


