# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

<<<<<<< HEAD
ActiveRecord::Schema.define(:version => 20110106163234) do

  create_table "maps", :force => true do |t|
    t.string   "name"
    t.string   "content"
=======
ActiveRecord::Schema.define(:version => 20110108170303) do

  create_table "maps", :force => true do |t|
    t.string   "name"
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
    t.integer  "score"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
<<<<<<< HEAD
=======
    t.text     "content"
>>>>>>> 12a6c858ca3a1f66ff36776792d0e57daca43736
  end

  add_index "maps", ["user_id"], :name => "index_maps_on_user_id"

  create_table "users", :force => true do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "encrypted_password"
    t.string   "salt"
    t.boolean  "admin",              :default => false
    t.string   "fbid"
    t.integer  "createScore"
    t.integer  "destroyScore"
    t.boolean  "isFacebook"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true

end
