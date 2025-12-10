class CreatePatients < ActiveRecord::Migration[8.0]
  def change
    create_table :patients do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :name, null: false
      t.date :date_of_birth

      t.timestamps
    end

    add_index :patients, :email, unique: true
  end
end
