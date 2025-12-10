# テスト患者
patient = Patient.find_or_create_by!(email: "test@example.com") do |p|
  p.password = "password123"
  p.name = "山田太郎"
  p.date_of_birth = Date.new(1990, 1, 1)
end
puts "Created patient: #{patient.email}"

# 医療センター
medical_center = MedicalCenter.find_or_create_by!(code: "MC001") do |mc|
  mc.name = "テスト医療センター"
  mc.email = "info@test-mc.example.com"
  mc.phone = "03-1234-5678"
  mc.address = "東京都千代田区1-1-1"
  mc.active = true
end
puts "Created medical center: #{medical_center.name}"

# 医療センタースタッフ
staff = MedicalCenterStaff.find_or_create_by!(email: "staff@example.com") do |s|
  s.medical_center = medical_center
  s.password = "staff123"
  s.name = "佐藤花子"
  s.role = :admin
  s.active = true
end
puts "Created staff: #{staff.email}"

# サンプル検査結果
BloodTestResult.find_or_create_by!(patient: patient, test_date: Date.today) do |result|
  result.medical_center = medical_center
  result.medical_center_staff = staff
  result.test_items = {
    "WBC" => { value: "5.2", unit: "10^3/μL", reference_min: "3.5", reference_max: "9.0" },
    "RBC" => { value: "4.5", unit: "10^6/μL", reference_min: "4.0", reference_max: "5.5" },
    "HGB" => { value: "14.0", unit: "g/dL", reference_min: "13.0", reference_max: "17.0" }
  }
end
puts "Created blood test result"

puts ""
puts "=== ログイン情報 ==="
puts "患者: test@example.com / password123"
puts "スタッフ: staff@example.com / staff123"
