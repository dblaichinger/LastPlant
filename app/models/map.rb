# == Schema Information
# Schema version: 20110108170303
#
# Table name: maps
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  score      :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#  content    :text
#

class Map < ActiveRecord::Base
  attr_accessible :name, :content, :score, :user_id

  belongs_to :user

  def self.set_name(name, user_id)
    if(!name || name == "")
      name = generate_name(user_id)
    end
    return name
  end


  def self.generate_name(user_id)
    username = User.find_by_id(user_id).name
    map_count = (Map.find_all_by_user_id(user_id, :select => "id").count + 1)
    mapname = username + "'s " + map_count.to_s + " Map"
    return mapname
  end
end