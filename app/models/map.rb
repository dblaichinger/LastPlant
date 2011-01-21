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
end

private
def self.set_name(name)
<<<<<<< HEAD
  if(!name || name == "")
    return self.generate_name
  else
    mapname = params[:mapname]
  end
=======
    if(!name || name == "")
      return self.generate_name     
    else
      return name
    end
>>>>>>> 2ec9da5ae3a2eae60be5c6f3234f551b635604a3

end

def self.generate_name
  username = User.find_by_id(session[:id]).name
  map_count = (Map.find_all_by_user_id(session[:id]).count + 1)
  #map_count = Map.where("user_id =
    
  mapname = username + "'s " + map_count.to_s + " Map"
  return mapname
end