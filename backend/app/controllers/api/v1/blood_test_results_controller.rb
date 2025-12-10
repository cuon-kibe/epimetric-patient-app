module Api
  module V1
    class BloodTestResultsController < ApplicationController
      before_action :authenticate_patient!

      def index
        results = current_patient.blood_test_results.order(test_date: :desc)
        render json: {
          blood_test_results: results.map { |r| serialize_result(r) }
        }
      end

      def show
        result = current_patient.blood_test_results.find(params[:id])
        render json: { blood_test_result: serialize_result(result, include_items: true) }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Not found" }, status: :not_found
      end

      def upload
        # CSVアップロード処理（患者向け）
        render json: { error: "Not implemented" }, status: :not_implemented
      end

      private

      def serialize_result(result, include_items: false)
        data = {
          id: result.id,
          test_date: result.test_date,
          created_at: result.created_at,
          items_count: result.test_items&.size || 0
        }
        data[:test_items] = result.test_items if include_items
        data
      end
    end
  end
end
