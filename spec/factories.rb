# By using the symbol ':user', we get Factory Girl to simulate the User model.
Factory.define :user do |user|
  user.name                  "Daniel Blaichinger"
  user.email                 "daniel@example.com"
  user.password              "daniel"
  user.password_confirmation "daniel"
end
