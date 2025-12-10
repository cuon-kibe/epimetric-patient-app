module Api
  module V1
    module Mc
      class PatientsController < BaseController
        def index
          patient_ids = current_medical_center.blood_test_results.select(:patient_id).distinct
          patients = Patient.where(id: patient_ids)

          render json: {
            patients: patients.map do |patient|
              {
                id: patient.id,
                email: patient.email,
                name: patient.name,
                date_of_birth: patient.date_of_birth
              }
            end
          }
        end

        def show
          patient = Patient.find(params[:id])
          render json: {
            patient: {
              id: patient.id,
              email: patient.email,
              name: patient.name,
              date_of_birth: patient.date_of_birth
            }
          }
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Not found" }, status: :not_found
        end
      end
    end
  end
end
