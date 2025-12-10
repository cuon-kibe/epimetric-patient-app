class MedicalCenterStaff < ApplicationRecord
  has_secure_password

  belongs_to :medical_center
  has_many :blood_test_results, dependent: :nullify
  has_many :csv_upload_logs, dependent: :nullify

  enum :role, { staff: 0, admin: 1 }

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }
end
