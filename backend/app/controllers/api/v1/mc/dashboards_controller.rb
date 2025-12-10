module Api
  module V1
    module Mc
      class DashboardsController < BaseController
        def show
          results = current_medical_center.blood_test_results
          upload_logs = current_medical_center.csv_upload_logs

          # 本日の統計
          today_start = Time.current.beginning_of_day
          today_uploads = upload_logs.where("created_at >= ?", today_start)
          today_results = results.where("created_at >= ?", today_start)

          # 今月の統計
          month_start = Time.current.beginning_of_month
          month_uploads = upload_logs.where("created_at >= ?", month_start)
          month_results = results.where("created_at >= ?", month_start)

          render json: {
            dashboard: {
              stats: {
                today: {
                  uploads: today_uploads.count,
                  results: today_results.count,
                  errors: today_uploads.where(status: "failed").count
                },
                this_month: {
                  uploads: month_uploads.count,
                  results: month_results.count,
                  errors: month_uploads.where(status: "failed").count
                },
                total: {
                  uploads: upload_logs.count,
                  results: results.count,
                  patients: results.select(:patient_id).distinct.count
                }
              },
              recent_uploads: upload_logs.order(created_at: :desc).limit(5).map do |log|
                {
                  id: log.id,
                  file_name: log.file_name,
                  status: log.status,
                  total_rows: log.total_rows || 0,
                  success_rows: log.success_rows || 0,
                  error_rows: log.error_rows || 0,
                  uploaded_by: log.medical_center_staff&.name || "不明",
                  uploaded_at: log.created_at.iso8601
                }
              end,
              recent_results: results.order(created_at: :desc).limit(5).map do |result|
                {
                  id: result.id,
                  patient_name: result.patient&.name || "不明",
                  test_date: result.test_date&.to_s,
                  items_count: result.test_items&.keys&.count || 0,
                  registered_by: result.medical_center_staff&.name || "不明",
                  registered_at: result.created_at.iso8601
                }
              end
            }
          }
        end
      end
    end
  end
end
