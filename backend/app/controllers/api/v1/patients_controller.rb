module Api
  module V1
    class PatientsController < ApplicationController
      before_action :authenticate_patient!, only: [:me, :show]

      def create
        patient = Patient.new(patient_params)

        if patient.save
          token = JsonWebToken.encode(patient_id: patient.id)
          render json: {
            token: token,
            patient: {
              id: patient.id,
              email: patient.email,
              name: patient.name
            }
          }, status: :created
        else
          render json: { errors: patient.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def me
        render json: {
          patient: {
            id: current_patient.id,
            email: current_patient.email,
            name: current_patient.name,
            date_of_birth: current_patient.date_of_birth
          }
        }
      end

      def show
        render json: {
          patient: {
            id: current_patient.id,
            email: current_patient.email,
            name: current_patient.name,
            date_of_birth: current_patient.date_of_birth
          }
        }
      end

      private

      def patient_params
        params.require(:patient).permit(:email, :password, :password_confirmation, :name, :date_of_birth)
      end
    end
  end
end
