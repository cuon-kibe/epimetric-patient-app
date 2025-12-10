module Api
  module V1
    module Mc
      class SessionsController < ApplicationController
        before_action :authenticate_staff!, only: [:me]

        def create
          # フロントエンドからは session オブジェクトにネストされて送信される
          session_params = params[:session] || params
          email = session_params[:email]
          password = session_params[:password]

          staff = MedicalCenterStaff.find_by(email: email)

          if staff&.authenticate(password) && staff.active? && staff.medical_center.active?
            token = JsonWebToken.encode(staff_id: staff.id)
            render json: {
              token: token,
              staff: staff_json(staff)
            }
          else
            render json: { error: "Invalid email or password" }, status: :unauthorized
          end
        end

        def me
          render json: { staff: staff_json(current_staff) }
        end

        def destroy
          head :ok
        end

        private

        def staff_json(staff)
          {
            id: staff.id,
            email: staff.email,
            name: staff.name,
            role: staff.role,
            medical_center: {
              id: staff.medical_center.id,
              name: staff.medical_center.name,
              code: staff.medical_center.code,
              email: staff.medical_center.email
            }
          }
        end
      end
    end
  end
end
