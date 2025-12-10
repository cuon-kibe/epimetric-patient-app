module Api
  module V1
    module Mc
      class BloodTestResultsController < BaseController
        def index
          results = current_medical_center.blood_test_results
                      .includes(:patient, :medical_center_staff)
                      .order(created_at: :desc)
                      .limit(100)

          render json: {
            blood_test_results: results.map { |r| serialize_result(r) }
          }
        end

        def show
          result = current_medical_center.blood_test_results.find(params[:id])
          render json: { blood_test_result: serialize_result(result, include_items: true) }
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Not found" }, status: :not_found
        end

        def upload_csv
          # CSVアップロード処理
          file = params[:file]
          return render json: { error: "No file uploaded" }, status: :bad_request unless file

          log = CsvUploadLog.create!(
            medical_center: current_medical_center,
            medical_center_staff: current_staff,
            file_name: file.original_filename,
            status: :processing,
            started_at: Time.current
          )

          # CSV処理（簡易版）
          begin
            require "csv"
            content = file.read.force_encoding("UTF-8")
            rows = CSV.parse(content, headers: true)

            success_count = 0
            error_count = 0

            rows.each_with_index do |row, index|
              patient = Patient.find_by(email: row["患者メール"])
              next (error_count += 1) unless patient

              BloodTestResult.create!(
                patient: patient,
                medical_center: current_medical_center,
                medical_center_staff: current_staff,
                test_date: row["検査日"],
                test_items: {
                  row["項目名"] => {
                    value: row["結果値"],
                    unit: row["単位"],
                    reference_min: row["基準値下限"],
                    reference_max: row["基準値上限"]
                  }
                },
                csv_file_name: file.original_filename,
                csv_row_number: index + 1
              )
              success_count += 1
            rescue => e
              error_count += 1
            end

            log.update!(
              status: :completed,
              total_rows: rows.size,
              success_rows: success_count,
              error_rows: error_count,
              completed_at: Time.current
            )

            render json: { success: true, log_id: log.id, success_rows: success_count, error_rows: error_count }
          rescue => e
            log.update!(status: :failed, error_details: e.message)
            render json: { error: e.message }, status: :unprocessable_entity
          end
        end

        private

        def serialize_result(result, include_items: false)
          data = {
            id: result.id,
            patient_name: result.patient.name,
            patient_email: result.patient.email,
            test_date: result.test_date,
            items_count: result.test_items&.size || 0,
            staff_name: result.medical_center_staff&.name,
            created_at: result.created_at
          }
          data[:test_items] = result.test_items if include_items
          data
        end
      end
    end
  end
end
