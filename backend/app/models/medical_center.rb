class MedicalCenter < ApplicationRecord
  has_many :medical_center_staffs, dependent: :destroy
  has_many :blood_test_results, dependent: :nullify
  has_many :csv_upload_logs, dependent: :destroy

  validates :name, presence: true
  validates :code, presence: true, uniqueness: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
end
