class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods

  private

  def authenticate_patient!
    @current_patient = authenticate_with_token(:patient)
    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_patient
  end

  def authenticate_staff!
    @current_staff = authenticate_with_token(:staff)
    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_staff
  end

  def authenticate_with_token(type)
    authenticate_with_http_token do |token, _options|
      decoded = JsonWebToken.decode(token)
      return nil unless decoded

      case type
      when :patient
        Patient.find_by(id: decoded[:patient_id])
      when :staff
        MedicalCenterStaff.find_by(id: decoded[:staff_id])
      end
    end
  end

  def current_patient
    @current_patient
  end

  def current_staff
    @current_staff
  end
end
