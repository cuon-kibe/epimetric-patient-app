module Api
  module V1
    class SessionsController < ApplicationController
      def create
        patient = Patient.find_by(email: params[:email])

        if patient&.authenticate(params[:password])
          token = JsonWebToken.encode(patient_id: patient.id)
          render json: {
            token: token,
            patient: {
              id: patient.id,
              email: patient.email,
              name: patient.name
            }
          }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        head :ok
      end
    end
  end
end
