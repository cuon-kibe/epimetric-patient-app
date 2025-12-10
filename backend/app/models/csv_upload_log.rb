class CsvUploadLog < ApplicationRecord
  belongs_to :medical_center
  belongs_to :medical_center_staff, optional: true

  enum :status, { pending: 0, processing: 1, completed: 2, failed: 3 }

  validates :file_name, presence: true
end
