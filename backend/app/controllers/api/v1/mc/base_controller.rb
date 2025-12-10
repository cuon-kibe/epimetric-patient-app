module Api
  module V1
    module Mc
      class BaseController < ApplicationController
        before_action :authenticate_staff!

        private

        def current_medical_center
          current_staff&.medical_center
        end
      end
    end
  end
end
