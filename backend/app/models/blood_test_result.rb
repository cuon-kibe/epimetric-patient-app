class BloodTestResult < ApplicationRecord
  belongs_to :patient
  belongs_to :medical_center, optional: true
  belongs_to :medical_center_staff, optional: true

  validates :test_date, presence: true
  validates :test_items, presence: true
end
