class V1::ExpenseSerializer
  include FastJsonapi::ObjectSerializer
  set_key_transform :camel_lower
  attributes :name, :amount, :category, :made_on
end
